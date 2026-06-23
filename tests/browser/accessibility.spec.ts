import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  expect(
    results.violations,
    results.violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help}\n${violation.nodes
            .map((node) => `  ${node.target.join(" ")}: ${node.failureSummary}`)
            .join("\n")}`
      )
      .join("\n\n")
  ).toEqual([]);
}

async function waitForStableInterface(page: Page) {
  await expect(
    page.getByRole("heading", { name: "World Populated Places" })
  ).toBeVisible();
  await expect(page.locator(".topbar-status")).toContainText(
    /Globe ready|Text experience available/,
    { timeout: 15_000 }
  );
}

async function openPlaceDirectory(page: Page) {
  await page.getByRole("button", { name: "Browse places" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search places" })
  ).toBeVisible();
}

test("has no automated WCAG violations in its initial state", async ({
  page
}) => {
  await page.goto("/");
  await waitForStableInterface(page);
  await expectNoAccessibilityViolations(page);
});

test("has no automated WCAG violations with a selected place", async ({
  page
}) => {
  await page.goto("/");
  await waitForStableInterface(page);
  await openPlaceDirectory(page);

  await page
    .getByRole("searchbox", { name: "Search places" })
    .fill("Chicago");
  await page.getByRole("button", { name: /^Chicago/ }).click();
  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).toBeVisible();

  await expectNoAccessibilityViolations(page);
});
