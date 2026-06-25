import { expect, test, type Page } from "@playwright/test";

async function openAtlasSearch(page: Page) {
  await page.getByRole("button", { name: "Explore atlas" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search atlas" })
  ).toBeVisible();
}

test("loads the accessible application shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "World Populated Places" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Explore atlas" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Focus globe view" })
  ).not.toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search atlas" })
  ).not.toBeVisible();
  await expect(page.locator(".globe-statusbar")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );
  await expect(page.locator(".globe-statusbar")).toHaveCSS(
    "border-top-width",
    "0px"
  );
  await expect(page.locator(".globe-statusbar")).toHaveCSS(
    "backdrop-filter",
    "none"
  );
  await expect(page.locator(".globe-statusbar")).toHaveCSS("padding", "0px");

  await openAtlasSearch(page);
  await expect(
    page.getByText("243 places and 228 regions available.")
  ).toBeVisible();
});

test("searches, selects, shares, and closes a place", async ({ page }) => {
  await page.goto("/");
  await openAtlasSearch(page);

  const search = page.getByRole("searchbox", { name: "Search atlas" });
  await search.fill("Chicago");

  await expect(
    page.getByText("1 of 471 atlas items match “Chicago”.")
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
      name: "Choose a place, country, or state."
    })
  ).toBeVisible();
  await expect(chicago).not.toHaveAttribute("aria-current", "true");
  await expect(page).not.toHaveURL(/[?&]place=/);

  await page.getByRole("button", { name: "Clear atlas search" }).click();
  await expect(search).toHaveValue("");
  await expect(
    page.getByText("243 places and 228 regions available.")
  ).toBeVisible();
});

test("searches and selects a boundary region", async ({ page }) => {
  await page.goto("/");
  await openAtlasSearch(page);

  const search = page.getByRole("searchbox", { name: "Search atlas" });
  await search.fill("Texas");

  await expect(
    page.getByText("2 of 471 atlas items match “Texas”.")
  ).toBeVisible();

  const texas = page.getByRole("button", { name: /^Texas/ });
  await texas.click();

  await expect(
    page.getByRole("heading", { name: "Texas", exact: true })
  ).toBeVisible();
  await expect(
    page.locator(".details-panel").getByText("U.S. state", { exact: true })
  ).toBeVisible();
  await expect(page.locator(".details-panel").getByText("US-TX")).toBeVisible();
  await expect(texas).toHaveAttribute("aria-current", "true");
  await expect(page).toHaveURL(/[?&]boundary=natural-earth%3Aus-state%3A/);
  await expect(page).not.toHaveURL(/[?&]place=/);

  await page.getByRole("button", { name: "Close region details" }).click();
  await expect(page).not.toHaveURL(/[?&]boundary=/);
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

  const heightBeforeZoom = new URL(page.url()).searchParams.get("height");
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("height"))
    .not.toBe(heightBeforeZoom);

  const heightAfterZoomIn = new URL(page.url()).searchParams.get("height");
  await page.getByRole("button", { name: "Zoom out" }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("height"))
    .not.toBe(heightAfterZoomIn);

  const longitudeBefore = new URL(page.url()).searchParams.get("lon");
  await globe.press("ArrowRight");

  await expect
    .poll(() => new URL(page.url()).searchParams.get("lon"))
    .not.toBe(longitudeBefore);
  await expect(page).toHaveURL(/[?&]lat=/);
  await expect(page).toHaveURL(/[?&]height=/);

  await page.getByRole("button", { name: "Return to global view" }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("lon"))
    .toBe("8.000");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("lat"))
    .toBe("18.000");
});

test("removes the retired engine query parameter", async ({ page }) => {
  await page.goto("/?engine=cesium");

  await expect(
    page.getByRole("heading", { name: "World Populated Places" })
  ).toBeVisible();
  await expect(page).not.toHaveURL(/[?&]engine=/);
});

test("filters places and can reset an empty result", async ({ page }) => {
  await page.goto("/");
  await openAtlasSearch(page);

  const capitals = page.getByRole("button", { name: "Capitals" });
  const allPlaces = page.getByRole("button", { name: "All", exact: true });
  const search = page.getByRole("searchbox", { name: "Search atlas" });

  await capitals.click();
  await expect(capitals).toHaveAttribute("aria-pressed", "true");

  await search.fill("Chicago");
  await expect(page.getByText("No atlas items found")).toBeVisible();

  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(allPlaces).toHaveAttribute("aria-pressed", "true");
  await expect(search).toHaveValue("");
  await expect(page.getByRole("button", { name: /^Chicago/ })).toBeVisible();
});

test("operates workspace help, layers, random exploration, and sharing", async ({
  context,
  page
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173"
  });
  await page.goto("/");

  await page
    .getByRole("button", { name: "Open keyboard shortcuts" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Keyboard shortcuts" })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close keyboard shortcuts" })
    .click();

  await page.locator("summary").filter({ hasText: "Layers" }).click();
  const countries = page.getByRole("checkbox", {
    name: /Country boundaries/
  });
  const states = page.getByRole("checkbox", {
    name: /U\.S\. state boundaries/
  });
  await expect(countries).toBeChecked();
  await expect(states).toBeChecked();
  await expect(page.getByText("177 countries · Natural Earth")).toBeVisible();
  await expect(
    page.getByText("51 regions · Zoom closer to reveal")
  ).toBeVisible();

  for (let step = 0; step < 3; step += 1) {
    await page.getByRole("button", { name: "Zoom in" }).click();
  }
  await expect(page.getByText("51 regions · Visible now")).toBeVisible();

  await countries.uncheck({ force: true });
  await states.uncheck({ force: true });
  await expect(countries).not.toBeChecked();
  await expect(states).not.toBeChecked();
  await expect(page.getByText("51 regions · Hidden")).toBeVisible();

  await page
    .locator("header")
    .getByRole("button", { name: "Explore a random place" })
    .click();
  await expect(page).toHaveURL(/[?&]place=/);
  await expect(
    page.getByRole("button", { name: "Close place details" })
  ).toBeVisible();

  const randomPlaceUrl = page.url();
  await page.getByRole("button", { name: "Next place" }).click();
  await expect.poll(() => page.url()).not.toBe(randomPlaceUrl);

  const placeBeforeShare = new URL(page.url()).searchParams.get("place");
  await page.getByRole("button", { name: "Share this view" }).click();
  await expect(page.getByText("Copied", { exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("http://127.0.0.1:4173/");

  const copiedUrl = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  );
  expect(copiedUrl.searchParams.get("place")).toBe(placeBeforeShare);
  expect(copiedUrl.searchParams.has("lon")).toBe(true);
  expect(copiedUrl.searchParams.has("lat")).toBe(true);
  expect(copiedUrl.searchParams.has("height")).toBe(true);
});

test("keeps the workspace within desktop and mobile viewports", async ({
  page
}) => {
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    )
    .toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    )
    .toBe(true);
  await expect(
    page.getByRole("heading", { name: "World Populated Places" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Explore atlas" })
  ).toBeVisible();
});

test("collapses panels and expands the globe workspace", async ({ page }) => {
  await page.goto("/");

  const search = page.getByRole("searchbox", { name: "Search atlas" });
  await expect(search).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Focus globe view" })
  ).not.toBeVisible();

  const initialGlobeWidth = await page.locator(".globe-stage").evaluate(
    (element) => element.getBoundingClientRect().width
  );
  expect(initialGlobeWidth).toBeGreaterThan(1200);

  await openAtlasSearch(page);
  await expect(search).toBeVisible();

  await page
    .getByRole("button", { name: "Collapse atlas browser" })
    .click({ force: true });
  await expect(search).not.toBeVisible();
  await openAtlasSearch(page);

  await search.fill("Chicago");
  await page.getByRole("button", { name: /^Chicago/ }).click();
  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Collapse details panel" })
    .click({ force: true });
  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Open details" })
    .click({ force: true });
  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Focus globe view" })
    .click({ force: true });
  await expect(search).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Explore atlas" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open details" })
  ).toBeVisible();

  const globeWidth = await page.locator(".globe-stage").evaluate(
    (element) => element.getBoundingClientRect().width
  );
  expect(globeWidth).toBeGreaterThan(1200);

  await openAtlasSearch(page);
  await page
    .getByRole("button", { name: "Open details" })
    .click({ force: true });
  await expect(search).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chicago", exact: true })
  ).toBeVisible();
});
