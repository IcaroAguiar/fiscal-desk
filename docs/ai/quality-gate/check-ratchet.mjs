#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const gateDir = dirname(fileURLToPath(import.meta.url));
const baseline = JSON.parse(readFileSync(join(gateDir, "baseline.json"), "utf8"));
const config = JSON.parse(readFileSync(join(gateDir, "quality-gate.config.json"), "utf8"));
const failures = [];
const warnings = [];
const improvements = [];
const sourceExtensions = new Set([".astro",".c",".cc",".cpp",".cs",".css",".go",".java",".js",".jsx",".kt",".mjs",".php",".py",".rb",".rs",".scss",".sql",".swift",".ts",".tsx",".vue"]);
const ignoredDirs = new Set([".cache",".git",".next",".turbo",".venv","build","coverage","dist","node_modules","target","vendor"]);
const diffMode = process.env.QUALITY_GATE_DIFF_MODE || "default";
const usesWorktreeDiff = diffMode === "worktree";

function readJson(path) { try { return JSON.parse(readFileSync(join(root, path), "utf8")); } catch { return null; } }
function git(args, options = {}) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    if (options.required) {
      const stderr = error?.stderr?.toString?.().trim?.();
      fail("quality-gate.git-command-failed", "git " + args.join(" ") + " failed" + (stderr ? ": " + stderr : "."));
    }
    return "";
  }
}
function fail(id, message) { failures.push({ id, message }); }
function warn(id, message) { warnings.push({ id, message }); }
function pct(value) { return value === null || value === undefined ? "n/a" : String(value) + "%"; }
function delta(current, previous) { return current === null || current === undefined || previous === null || previous === undefined ? null : Number((current - previous).toFixed(2)); }
function statusIcon(ok) { return ok ? "PASS" : "FAIL"; }

let resolvedBaseRef;
function baseRef() {
  if (resolvedBaseRef !== undefined) return resolvedBaseRef;
  const base = process.env.AGENTIC_REVIEW_BASE || config.base || "origin/main";
  const commit = git(["rev-parse", "--verify", base + "^{commit}"]);
  if (!commit) {
    fail("quality-gate.base-ref-missing", "Unable to resolve AGENTIC_REVIEW_BASE/config base ref '" + base + "'. Fetch the base ref or fix the configured ref before trusting PR diff metrics.");
    resolvedBaseRef = null;
    return resolvedBaseRef;
  }
  resolvedBaseRef = base;
  return resolvedBaseRef;
}

function changedFiles() {
  if (usesWorktreeDiff) {
    const tracked = git(["diff", "--name-only", "HEAD", "--"], { required: true });
    const untracked = git(["ls-files", "--others", "--exclude-standard"], { required: true });
    return [...tracked.split(/\r?\n/), ...untracked.split(/\r?\n/)].filter(Boolean);
  }
  const base = baseRef();
  if (!base) return [];
  const output = git(["diff", "--name-only", base + "...HEAD"], { required: true });
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function lineCount(path) { try { return readFileSync(join(root, path), "utf8").split(/\r?\n/).length; } catch { return 0; } }
function commentDensityFromText(text) {
  const lines = text.split(/\r?\n/);
  const commentLines = lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("--") || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("<!--");
  }).length;
  return lines.length ? Number((commentLines / lines.length).toFixed(4)) : 0;
}
function commentDensity(path) {
  let text = "";
  try { text = readFileSync(join(root, path), "utf8"); } catch { return 0; }
  return commentDensityFromText(text);
}

function walk(current = root, files = []) {
  for (const entry of execFileSync("find", [relative(root, current) || ".", "-maxdepth", "1", "-mindepth", "1", "-print"], { cwd: root, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean)) {
    const abs = join(root, entry);
    if (ignoredDirs.has(basename(abs))) continue;
    const type = execFileSync("stat", ["-f", "%HT", abs], { encoding: "utf8" }).trim();
    if (type === "Directory") walk(abs, files);
    else files.push(abs);
  }
  return files;
}

function sourceFiles() {
  const tracked = git(["ls-files"], { required: true });
  const files = tracked ? tracked.split(/\r?\n/).map((path) => join(root, path)) : [];
  return files.filter((path) => sourceExtensions.has(extname(path)) && !path.includes("/node_modules/"));
}

function collectCodeMetrics() {
  const byFile = [];
  let totalLines = 0;
  let commentLines = 0;
  for (const abs of sourceFiles()) {
    let text = "";
    try { text = readFileSync(abs, "utf8"); } catch { continue; }
    const rel = relative(root, abs);
    const lines = text.split(/\r?\n/).length;
    const density = commentDensity(rel);
    const comments = Math.round(lines * density);
    totalLines += lines;
    commentLines += comments;
    byFile.push({ path: rel, lines, commentLines: comments, commentDensity: density });
  }
  byFile.sort((a, b) => b.lines - a.lines);
  return { sourceFiles: byFile.length, totalLines, commentLines, commentDensity: totalLines ? Number((commentLines / totalLines).toFixed(4)) : null, largeFiles: byFile.filter((file) => file.lines > config.thresholds.maxNewFileLines).length, largestFiles: byFile.slice(0, 50) };
}
function sourceFilesAtRef(ref) {
  const tracked = git(["ls-tree", "-r", "--name-only", ref], { required: true });
  const files = tracked ? tracked.split(/\r?\n/) : [];
  return files.filter((path) => sourceExtensions.has(extname(path)));
}
function textAtRef(ref, path) {
  try {
    return execFileSync("git", ["show", ref + ":" + path], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}
function collectCodeMetricsAtRef(ref) {
  const byFile = [];
  let totalLines = 0;
  let commentLines = 0;
  for (const path of sourceFilesAtRef(ref)) {
    const text = textAtRef(ref, path);
    if (!text) continue;
    const lines = text.split(/\r?\n/).length;
    const density = commentDensityFromText(text);
    const comments = Math.round(lines * density);
    totalLines += lines;
    commentLines += comments;
    byFile.push({ path, lines, commentLines: comments, commentDensity: density });
  }
  byFile.sort((a, b) => b.lines - a.lines);
  return { sourceFiles: byFile.length, totalLines, commentLines, commentDensity: totalLines ? Number((commentLines / totalLines).toFixed(4)) : null, largeFiles: byFile.filter((file) => file.lines > config.thresholds.maxNewFileLines).length, largestFiles: byFile.slice(0, 50) };
}

function coverageMetric() {
  const json = readJson(config.reportPaths.coverageSummary);
  return json?.total?.lines?.pct === undefined ? null : Number(json.total.lines.pct);
}
function changedLineMap() {
  if (usesWorktreeDiff) {
    const output = git(["diff", "--unified=0", "HEAD", "--"], { required: true });
    return parseChangedLineMap(output);
  }

  const base = baseRef();
  if (!base) return new Map();
  const output = git(["diff", "--unified=0", base + "...HEAD"], { required: true });
  return parseChangedLineMap(output);
}
function parseChangedLineMap(output) {
  const map = new Map();
  let currentFile = "";
  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.slice("+++ b/".length);
      if (!map.has(currentFile)) map.set(currentFile, new Set());
      continue;
    }
    const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!match || !currentFile) continue;
    const start = Number(match[1]);
    const count = Number(match[2] || 1);
    for (let offset = 0; offset < count; offset += 1) map.get(currentFile).add(start + offset);
  }
  return map;
}
function lcovFileCoverage() {
  let text = "";
  try { text = readFileSync(join(root, config.reportPaths.lcov), "utf8"); } catch { return null; }
  const files = new Map();
  let current = "";
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("SF:")) {
      current = relative(root, line.slice(3));
      if (current.startsWith("..")) current = line.slice(3);
      if (!files.has(current)) files.set(current, new Map());
    } else if (line.startsWith("DA:") && current) {
      const [lineNumber, hits] = line.slice(3).split(",");
      files.get(current).set(Number(lineNumber), Number(hits));
    } else if (line === "end_of_record") {
      current = "";
    }
  }
  return files;
}
function prCoverageMetric() {
  const changed = changedLineMap();
  const lcov = lcovFileCoverage();
  if (!lcov) return null;
  let covered = 0;
  let total = 0;
  const uncovered = [];
  for (const [file, lines] of changed.entries()) {
    const fileCoverage = lcov.get(file);
    if (!fileCoverage) continue;
    for (const line of lines) {
      if (!fileCoverage.has(line)) continue;
      total += 1;
      if (fileCoverage.get(line) > 0) covered += 1;
      else uncovered.push(file + ":" + line);
    }
  }
  return { pct: total ? Number(((covered / total) * 100).toFixed(2)) : null, covered, total, uncovered: uncovered.slice(0, 25), path: config.reportPaths.lcov };
}
function duplicationMetric() {
  const json = readJson(config.reportPaths.jscpd);
  const stats = json?.statistics || json?.statistic || json;
  const total = stats?.total || stats;
  const value = total?.percentage ?? total?.duplicatedLinesPercentage ?? total?.duplicatedPercentage;
  return value === undefined ? null : Number(value);
}
function agenticReviewMetric() {
  const packet = readJson(config.reportPaths.agenticReviewPacket);
  if (!packet) {
    return {
      blocking: null,
      high: null,
      medium: null,
      enforced: Boolean(config.requiredChecks.agenticReviewPacket),
      status: config.requiredChecks.agenticReviewPacket ? "MISSING" : "NOT_ENFORCED",
    };
  }
  const repos = Array.isArray(packet.repositories) ? packet.repositories : [];
  let blocking = 0, high = 0, medium = 0;
  for (const repo of repos) {
    blocking += Number(repo.normalizedGateSummary?.blocking || 0);
    high += Number(repo.findingsSummary?.high || 0);
    medium += Number(repo.findingsSummary?.medium || 0);
  }
  if (packet.findings) {
    high += packet.findings.filter((finding) => finding.severity === "high").length;
    medium += packet.findings.filter((finding) => finding.severity === "medium").length;
    blocking += packet.findings.filter((finding) => ["high", "medium"].includes(finding.severity)).length;
  }
  return { blocking, high, medium, enforced: true, status: "PRESENT" };
}
function feedbackMetric() {
  const feedback = readJson(config.reportPaths.feedback);
  const entries = Array.isArray(feedback?.feedback) ? feedback.feedback : [];
  const falsePositive = entries.filter((entry) => entry.outcome === "false-positive").length;
  const falseNegative = entries.filter((entry) => entry.outcome === "false-negative").length;
  for (const entry of entries.filter((entry) => entry.outcome === "false-negative")) {
    improvements.push({ type: "false-negative", rule: entry.rule || "unknown", recommendation: entry.recommendation || "Add or tune a detector/test so this escaped issue is caught before merge.", source: entry.case || entry.source || "review-feedback" });
  }
  return { total: entries.length, falsePositive, falseNegative };
}

const files = changedFiles();
const code = collectCodeMetrics();
const liveBaseRef = usesWorktreeDiff ? "HEAD" : baseRef();
const codeBaseline = liveBaseRef ? collectCodeMetricsAtRef(liveBaseRef) : baseline.metrics.code;
const codeBaselineSource = liveBaseRef || "baseline.json";
const largeFileBaseline = codeBaseline?.largeFiles ?? baseline.metrics.code.largeFiles;
const coverage = coverageMetric();
const prCoverage = prCoverageMetric();
const duplication = duplicationMetric();
const review = agenticReviewMetric();
const feedback = feedbackMetric();
const baselineCoverage = baseline.metrics.coverage?.linesPct;
const baselineDuplication = baseline.metrics.duplication?.duplicatedLinesPct;
const largeFileExceptions = new Map();

for (const exception of config.exceptions?.largeFiles || []) {
  const expiresAt = exception.expiresAfter
    ? new Date(exception.expiresAfter + "T23:59:59.999Z")
    : null;

  if (!exception.path || !exception.reason || !exception.expiresAfter) {
    fail(
      "quality-gate.exception-invalid",
      "Large-file exception must include path, reason, and expiresAfter.",
    );
    continue;
  }

  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    fail(
      "quality-gate.exception-invalid",
      "Large-file exception for " + exception.path + " has invalid expiresAfter.",
    );
    continue;
  }

  if (Date.now() > expiresAt.getTime()) {
    fail(
      "quality-gate.exception-expired",
      "Large-file exception for " +
        exception.path +
        " expired after " +
        exception.expiresAfter +
        ".",
    );
    continue;
  }

  largeFileExceptions.set(exception.path, exception);
}

function largeFileExceptionMessage(file, exception) {
  const expiry = exception.expiresAfter
    ? " Expires after " + exception.expiresAfter + "."
    : "";
  return "Explicit large-file exception for " + file + ": " + exception.reason + "." + expiry;
}

if (config.requiredChecks.coverage && coverage === null) fail("coverage.missing", "Coverage is required but " + config.reportPaths.coverageSummary + " was not found.");
else if (coverage !== null && baselineCoverage !== undefined) {
  if (coverage < config.thresholds.newCoverageMin) fail("coverage.minimum", "Coverage " + coverage + "% is below minimum " + config.thresholds.newCoverageMin + "%.");
  if (coverage + config.thresholds.coverageDropMax < baselineCoverage) fail("coverage.ratchet", "Coverage dropped from " + baselineCoverage + "% to " + coverage + "%.");
}
if (prCoverage === null) warn("coverage.pr-missing", "PR coverage requires " + config.reportPaths.lcov + " to calculate changed-line coverage.");
else if (prCoverage.total >= config.thresholds.minChangedLinesForCoverageGate && prCoverage.pct < config.thresholds.prCoverageMin) {
  fail("coverage.pr-minimum", "PR changed-line coverage " + prCoverage.pct + "% is below minimum " + config.thresholds.prCoverageMin + "%.");
} else if (prCoverage.total > 0 && prCoverage.total < config.thresholds.minChangedLinesForCoverageGate) {
  warn("coverage.pr-small-change", "PR changed-line coverage has only " + prCoverage.total + " executable changed lines; report it but do not hard-block by percentage noise.");
}
if (config.requiredChecks.duplication && duplication === null) warn("duplication.missing", "Duplication report " + config.reportPaths.jscpd + " was not found; install/run jscpd to enforce this gate.");
else if (duplication !== null) {
  if (duplication > config.thresholds.newDuplicationMax) fail("duplication.maximum", "Duplication " + duplication + "% exceeds " + config.thresholds.newDuplicationMax + "%.");
  if (baselineDuplication !== undefined && duplication > baselineDuplication + config.thresholds.duplicationIncreaseMax) fail("duplication.ratchet", "Duplication increased from " + baselineDuplication + "% to " + duplication + "%.");
}
if (code.largeFiles > largeFileBaseline + config.thresholds.maxLargeFileCountIncrease) fail("code.large-file-ratchet", "Large file count increased from " + largeFileBaseline + " (" + codeBaselineSource + ") to " + code.largeFiles + ".");

const baselineFileByPath = new Map((codeBaseline?.largestFiles || baseline.metrics.code.largestFiles || []).map((file) => [file.path, file]));
for (const file of files) {
  if (!sourceExtensions.has(extname(file))) continue;
  const lines = lineCount(file);
  const density = commentDensity(file);
  const baselineFile = baselineFileByPath.get(file);
  const largeFileException = largeFileExceptions.get(file);
  if (lines > config.thresholds.maxNewFileLines) {
    if (largeFileException) warn("file.size.exception", largeFileExceptionMessage(file, largeFileException));
    else fail("file.size", "Changed file " + file + " has " + lines + " lines; limit is " + config.thresholds.maxNewFileLines + ". Split it or justify in review.");
  }
  if (lines > config.thresholds.maxNewFileLines && density < config.thresholds.minCommentDensityForLargeFiles) warn("file.context-comments", "Large changed file " + file + " has low context-comment density. Add useful why/invariant comments or split responsibility.");
  if (config.policies.touchedBadAreaMustImprove && baselineFile && baselineFile.lines > config.thresholds.maxNewFileLines && lines > baselineFile.lines + config.thresholds.touchedLargeFileMaxLineIncrease) {
    if (largeFileException) warn("touched-bad-area.exception", largeFileExceptionMessage(file, largeFileException));
    else fail("touched-bad-area.must-improve", "Touched large file " + file + " grew from " + baselineFile.lines + " to " + lines + " lines. Improve/split it or add an explicit quality-gate exception.");
  }
}
if (config.requiredChecks.agenticReviewPacket && review?.status === "MISSING") fail("agentic-review.missing", "Agentic review packet " + config.reportPaths.agenticReviewPacket + " was not found.");
else if (review?.status === "NOT_ENFORCED") warn("agentic-review.not-enforced", "Agentic review packet is not enforced in CI; independent reviewer evidence remains a PR closeout requirement.");
else if (review) {
  if (review.high > config.thresholds.maxHighReviewFindings) fail("agentic-review.high", "Agentic review has " + review.high + " high findings.");
  if (review.blocking > config.thresholds.maxBlockingReviewFindings) fail("agentic-review.blocking", "Agentic review has " + review.blocking + " blocking findings.");
}

const rows = [
  { metric: "PR test coverage", baseline: prCoverage ? String(prCoverage.covered) + "/" + String(prCoverage.total) + " changed lines" : "n/a", current: prCoverage ? pct(prCoverage.pct) : "n/a", target: ">=" + pct(config.thresholds.prCoverageMin) + " (goal " + pct(config.thresholds.prCoverageTarget) + ")", delta: "n/a", status: !failures.some((f) => f.id === "coverage.pr-minimum") },
  { metric: "Global test coverage", baseline: pct(baselineCoverage), current: pct(coverage), target: pct(config.thresholds.newCoverageMin), delta: delta(coverage, baselineCoverage), status: !failures.some((f) => f.id === "coverage.minimum" || f.id === "coverage.ratchet" || f.id === "coverage.missing") },
  { metric: "Duplication", baseline: pct(baselineDuplication), current: pct(duplication), target: "<= " + pct(config.thresholds.newDuplicationMax), delta: delta(duplication, baselineDuplication), status: !failures.some((f) => f.id.startsWith("duplication.")) },
  { metric: "Large files", baseline: largeFileBaseline, current: code.largeFiles, target: "no increase", delta: code.largeFiles - largeFileBaseline, status: !failures.some((f) => f.id.startsWith("code.") || f.id.startsWith("file.") || f.id.startsWith("touched-bad-area")) },
  { metric: "Agentic review blocking", baseline: 0, current: review?.status === "NOT_ENFORCED" ? "NOT_ENFORCED" : review?.blocking ?? "n/a", target: review?.status === "NOT_ENFORCED" ? "PR closeout" : 0, delta: review?.status === "NOT_ENFORCED" ? "n/a" : review?.blocking ?? null, status: review?.status !== "NOT_ENFORCED" && !failures.some((f) => f.id.startsWith("agentic-review.")) },
  { metric: "Feedback false negatives", baseline: "tracked", current: feedback.falseNegative, target: 0, delta: feedback.falseNegative, status: feedback.falseNegative === 0 },
];
const markdown = [
  "# Agentic Quality Gate",
  "",
  "Status: **" + (failures.length ? "FAIL" : "PASS") + "**",
  "",
  "| Metric | Baseline | Current | Target | Delta | Status |",
  "| --- | ---: | ---: | ---: | ---: | --- |",
  ...rows.map((row) => "| " + row.metric + " | " + row.baseline + " | " + row.current + " | " + row.target + " | " + (row.delta ?? "n/a") + " | " + statusIcon(row.status) + " |"),
  "",
  "## Failures",
  failures.length ? failures.map((item) => "- **" + item.id + "**: " + item.message).join("\n") : "- None",
  "",
  "## Warnings",
  warnings.length ? warnings.map((item) => "- **" + item.id + "**: " + item.message).join("\n") : "- None",
  "",
  "## Auto-Improve Queue",
  improvements.length ? improvements.map((item) => "- **" + item.type + " / " + item.rule + "**: " + item.recommendation + " (source: " + item.source + ")").join("\n") : "- None",
  "",
].join("\n");
const report = { status: failures.length ? "fail" : "pass", generatedAt: new Date().toISOString(), diffMode, failures, warnings, improvements, metrics: { coverage, prCoverage, duplication, code, codeBaseline: { source: codeBaselineSource, largeFiles: largeFileBaseline }, review, feedback, rows }, changedFiles: files };
mkdirSync(gateDir, { recursive: true });
writeFileSync(join(gateDir, "quality-gate-report.json"), JSON.stringify(report, null, 2) + "\n");
writeFileSync(join(gateDir, "quality-gate-report.md"), markdown + "\n");
writeFileSync(join(gateDir, "quality-trend-entry.json"), JSON.stringify({ generatedAt: report.generatedAt, status: report.status, coverage, prCoverage, duplication, largeFiles: code.largeFiles, review, feedback }, null, 2) + "\n");
writeFileSync(join(gateDir, "auto-improvement-queue.json"), JSON.stringify({ generatedAt: report.generatedAt, improvements, feedback }, null, 2) + "\n");
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
