import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Page } from "playwright";

export type ViewportCase = {
  name: string;
  width: number;
  height: number;
};

export type VisualSmokeResult = {
  scenario: string;
  viewport: ViewportCase;
  overflow: boolean;
  clippedButtons: string[];
  overlaps: string[];
  screenshots: Record<string, string>;
};

export async function collectScenarioChecks(
  page: Page,
  outputDir: string,
  viewport: ViewportCase,
  scenario: string,
  screenshots: Record<string, string>,
  checks: {
    clippedButtons: string[];
    overlaps: string[];
    setOverflow(value: boolean): void;
  },
): Promise<void> {
  const screenshotPath = join(outputDir, `${viewport.name}-${scenario}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  screenshots[scenario] = screenshotPath;
  await writeVisualArtifacts(page, outputDir, viewport, scenario);

  checks.setOverflow(await hasHorizontalOverflow(page));
  checks.clippedButtons.push(
    ...(await clippedPrimaryButtons(page, scenario)).map(
      (item) => `${scenario}:${item}`,
    ),
  );
  checks.overlaps.push(
    ...(await siblingOverlaps(page)).map((item) => `${scenario}:${item}`),
  );
}

async function writeVisualArtifacts(
  page: Page,
  outputDir: string,
  viewport: ViewportCase,
  scenario: string,
): Promise<void> {
  const artifactPrefix = `${viewport.name}-${scenario}`;
  const domLandmarksPath = join(outputDir, `${artifactPrefix}-dom-landmarks.json`);
  const ariaSnapshotPath = join(outputDir, `${artifactPrefix}-aria-snapshot.yml`);
  const domLandmarks = await captureDomLandmarks(page);
  const ariaSnapshot = await captureAriaSnapshot(page);

  await writeFile(
    domLandmarksPath,
    JSON.stringify(domLandmarks, null, 2) + "\n",
    "utf8",
  );
  await writeFile(ariaSnapshotPath, ariaSnapshot, "utf8");
}

async function captureDomLandmarks(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const selectors = {
      shell: ".fd-shell",
      sidebar: ".fd-sidebar",
      header: ".fd-header",
      command: ".fd-command",
      metrics: ".fd-metrics",
      pipeline: ".fd-pipeline",
      providerGrid: ".fd-provider-grid",
      settings: ".fd-settings",
      execution: ".fd-execution",
      output: ".fd-output",
      history: ".fd-history",
    };

    return Object.fromEntries(
      Object.entries(selectors).map(([name, selector]) => {
        const element = document.querySelector(selector);

        if (!(element instanceof HTMLElement)) {
          return [name, { selector, exists: false }];
        }

        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);

        return [
          name,
          {
            selector,
            exists: true,
            visible:
              styles.display !== "none" &&
              styles.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            text: element.innerText.replace(/\s+/g, " ").trim(),
          },
        ];
      }),
    );
  });
}

async function captureAriaSnapshot(page: Page): Promise<string> {
  try {
    return await page.locator("body").ariaSnapshot();
  } catch (error) {
    return `ariaSnapshotUnavailable: ${String(error)}\n`;
  }
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth ?? 0,
    );
    return documentWidth > window.innerWidth;
  });
}

async function clippedPrimaryButtons(
  page: Page,
  scenario: string,
): Promise<string[]> {
  return page.evaluate((currentScenario) => {
    const selectors = [
      {
        selector: '[data-action="pick-file"]',
        required: currentScenario === "idle",
      },
      { selector: '[data-action="process-file"]', required: true },
      { selector: '[data-action="cancel-processing"]', required: false },
      {
        selector: '[data-action="save-file"]',
        required: currentScenario === "success",
      },
    ];

    return selectors.flatMap(({ selector, required }) => {
      const element = Array.from(
        document.querySelectorAll<HTMLElement>(selector),
      ).find((candidate) => {
        const style = window.getComputedStyle(candidate);
        const rect = candidate.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0
        );
      });
      if (!element) return required ? [selector + ":missing"] : [];
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const clipped =
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.left < 0 ||
        rect.right > window.innerWidth;

      return clipped && required ? [selector] : [];
    });
  }, scenario);
}

async function siblingOverlaps(page: Page): Promise<string[]> {
  return page.evaluate<string[]>(`(() => {
    const parents = [
      ".fd-header",
      ".fd-header__actions",
      ".fd-command",
      ".fd-metrics",
      ".fd-section-head",
      ".fd-pipeline__stages",
      ".fd-provider-grid",
      ".fd-settings__grid",
      ".fd-import",
      ".fd-base-prep",
      ".fd-base-prep__actions",
      ".fd-execution__grid",
      ".fd-suggestions",
      ".fd-actions-row",
      ".fd-nav",
      ".history-list",
    ];

    const visibleRect = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return null;
      }
      return rect;
    };

    const overlapArea = (a, b) => {
      const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return width * height;
    };

    return parents.flatMap((selector) => {
      return Array.from(document.querySelectorAll(selector)).flatMap(
        (parent, parentIndex) => {
          const children = Array.from(parent.children)
            .map((child, childIndex) => ({
              child,
              childIndex,
              rect: visibleRect(child),
            }))
            .filter((item) => Boolean(item.rect));

          const collisions = [];
          for (let index = 0; index < children.length; index += 1) {
            for (let next = index + 1; next < children.length; next += 1) {
              const current = children[index];
              const other = children[next];
              if (overlapArea(current.rect, other.rect) > 4) {
                collisions.push(
                  selector +
                    "[" +
                    parentIndex +
                    "] child " +
                    current.childIndex +
                    " overlaps " +
                    other.childIndex,
                );
              }
            }
          }
          return collisions;
        },
      );
    });
  })()`);
}

export function renderMarkdown(report: {
  status: string;
  generatedAt: string;
  results: VisualSmokeResult[];
}): string {
  return [
    "# Fiscal Desk visual smoke",
    "",
    `Status: **${report.status.toUpperCase()}**`,
    "",
    "| Cenário | Viewport | Overflow | Clipped buttons | Overlaps | Screenshots |",
    "| --- | --- | ---: | --- | --- | --- |",
    ...report.results.map((result) =>
      [
        result.scenario,
        result.viewport.name +
          ` (${result.viewport.width}x${result.viewport.height})`,
        String(result.overflow),
        result.clippedButtons.length ? result.clippedButtons.join(", ") : "none",
        result.overlaps.length ? result.overlaps.join(", ") : "none",
        Object.entries(result.screenshots)
          .map(([scenario, path]) => `${scenario}: ${path}`)
          .join("<br>"),
      ].join(" | "),
    ).map((row) => "| " + row + " |"),
    "",
  ].join("\n");
}
