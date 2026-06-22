import { expect, test } from "@playwright/test";

test("loads the accessible application shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "World Populated Places" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "World places" })
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search places" })
  ).toBeVisible();
  await expect(page.getByText("243 places available.")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Choose a point on the globe or from the list."
    })
  ).toBeVisible();
});

test("searches, selects, shares, and closes a place", async ({ page }) => {
  await page.goto("/");

  const search = page.getByRole("searchbox", { name: "Search places" });
  await search.fill("Chicago");

  await expect(
    page.getByText("1 of 243 places match “Chicago”.")
  ).toBeVisible();

  const chicago = page.getByRole("button", { name: /^Chicago/ });
  await chicago.click();

  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).toBeVisible();
  await expect(chicago).toHaveAttribute("aria-current", "true");
  await expect(page).toHaveURL(/[?&]place=natural-earth%3A/);

  await page.getByRole("button", { name: "Close place details" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Choose a point on the globe or from the list."
    })
  ).toBeVisible();
  await expect(chicago).not.toHaveAttribute("aria-current", "true");
  await expect(page).not.toHaveURL(/[?&]place=/);
});

test("supports keyboard globe movement and shareable camera state", async ({
  page
}) => {
  await page.goto("/");

  await expect(page.locator(".topbar-status")).toContainText(
    /Globe ready|Text experience available/,
    { timeout: 15_000 }
  );

  const keyboardButton = page.getByRole("button", {
    name: "Focus globe for keyboard controls"
  });
  const globe = page.getByRole("region", { name: /^Interactive globe/ });

  await expect(keyboardButton).toBeVisible();
  await keyboardButton.click();
  await expect(globe).toBeFocused();

  const longitudeBefore = new URL(page.url()).searchParams.get("lon");
  await globe.press("ArrowRight");

  await expect
    .poll(() => new URL(page.url()).searchParams.get("lon"))
    .not.toBe(longitudeBefore);
  await expect(page).toHaveURL(/[?&]lat=/);
  await expect(page).toHaveURL(/[?&]height=/);
});

test("removes the retired engine query parameter", async ({ page }) => {
  await page.goto("/?engine=cesium");

  await expect(
    page.getByRole("heading", { name: "World places" })
  ).toBeVisible();
  await expect(page).not.toHaveURL(/[?&]engine=/);
});
