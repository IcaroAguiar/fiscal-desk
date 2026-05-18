#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const marker = "<!-- fiscal-desk-quality-gate -->";
const root = process.cwd();
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const dryRun = process.env.QUALITY_GATE_COMMENT_DRY_RUN === "1";
const reportPath = join(root, "docs/ai/quality-gate/quality-gate-report.md");

function required(name, value) {
  if (!value) throw new Error(name + " is required to publish the PR quality gate comment.");
  return value;
}

function reportBody() {
  const report = existsSync(reportPath)
    ? readFileSync(reportPath, "utf8").trim()
    : [
        "| Gate | Status | Details |",
        "| --- | --- | --- |",
        "| Ratchet quality report | SKIPPED | The report file was not generated before this comment step. Check the previous workflow step that failed first. |",
      ].join("\n");

  return [
    marker,
    "## Fiscal Desk PR Quality Gate",
    "",
    report,
    "",
    "_Atualizado automaticamente pelo workflow `PR Quality Gate`._",
  ].join("\n");
}

function isActionsBot(comment) {
  return comment.user?.login === "github-actions[bot]" || comment.user?.login === "github-actions";
}

async function github(path, options = {}) {
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(options.method + " " + path + " failed with " + response.status + ": " + text);
  }

  return response.status === 204 ? null : response.json();
}

async function main() {
  const body = reportBody();

  if (dryRun) {
    console.log(body);
    return;
  }

  required("GITHUB_TOKEN", token);
  required("GITHUB_REPOSITORY", repository);
  required("PR_NUMBER", prNumber);

  const [owner, repo] = repository.split("/");
  const comments = await github(
    "/repos/" + owner + "/" + repo + "/issues/" + prNumber + "/comments?per_page=100",
    { method: "GET" },
  );
  const existing = comments.find((comment) => isActionsBot(comment) && comment.body?.includes(marker));

  if (existing) {
    await github("/repos/" + owner + "/" + repo + "/issues/comments/" + existing.id, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
    console.log("Updated existing quality gate PR comment.");
    return;
  }

  await github("/repos/" + owner + "/" + repo + "/issues/" + prNumber + "/comments", {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  console.log("Created quality gate PR comment.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
