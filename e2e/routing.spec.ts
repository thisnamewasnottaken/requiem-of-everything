import { expect, test } from "@playwright/test";

test("the production root opens V2 and links to V1 and back", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("reqe_tour_dismissed", "true"));
  await page.goto("./");
  await expect(page.locator("#homeTitle")).toHaveText("Requiem of Everything");
  const legacyLink = page.getByRole("link", { name: "Requiem V1" });
  await expect(legacyLink).toHaveCSS("text-decoration-line", "none");
  await expect(page.locator("#enter")).toHaveCSS("opacity", "1", { timeout: 10_000 });
  await page.screenshot({ path: testInfo.outputPath("v2-home.png") });
  await legacyLink.click();

  await expect(page).toHaveURL(/\/requiem-of-everything\/legacy\/v1\/$/);
  await expect(page.getByRole("heading", { name: "Requiem of Everything" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Timeline", exact: true })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: testInfo.outputPath("v1-timeline.png") });
  await page.getByRole("link", { name: "Requiem V2" }).click();
  await expect(page).toHaveURL(/\/requiem-of-everything\/$/);
  await expect(page.getByRole("button", { name: "Enter in silence" })).toBeVisible();
});

test("the direct legacy document URL still loads the React app and its locales", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("i18nextLng", "fr-FR");
    localStorage.setItem("reqe_tour_dismissed", "true");
  });
  await page.goto("legacy/v1/index.html?source=bookmark#root");
  await expect(page).toHaveURL(/\/legacy\/v1\/index\.html\?source=bookmark#root$/);
  await expect(page.getByRole("heading", { name: "Requiem de Tout" })).toBeVisible();
  await page.getByRole("button", { name: "Termes", exact: true }).click();
  await expect(page.getByRole("button", { name: "Termes", exact: true })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: testInfo.outputPath("v1-direct.png") });
});

for (const alias of ["v2/", "v2/index.html"]) {
  test(`${alias} redirects to the V2 root with query and fragment`, async ({ page }) => {
    await page.goto(`${alias}?lang=fr-FR#credits`);
    await expect(page).toHaveURL(/\/requiem-of-everything\/\?lang=fr-FR#credits$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr-FR");
    await expect(page.getByRole("dialog", { name: "Crédits" })).toBeVisible();
  });
}

test("the old River link retains the focused composer and can return to the V2 root", async ({ page }, testInfo) => {
  await page.goto("v2/river.html?lang=en-GB#focus=johann-sebastian-bach");
  await expect(page).toHaveURL(/\/requiem-of-everything\/river\.html\?lang=en-GB#focus=johann-sebastian-bach$/);
  await expect(page.locator("#life")).toHaveCSS("opacity", "1");
  await expect(page.locator("#lName")).toHaveText("Johann Sebastian Bach");
  await page.screenshot({ path: testInfo.outputPath("v2-river-bookmark.png") });
  await page.locator(".sigil .home").click();
  await expect(page).toHaveURL(/\/requiem-of-everything\/#entered$/);
  await expect(page.locator("body")).toHaveClass(/\bentered\b/);
});

for (const { path, selector, text } of [
  { path: "hall.html?lang=en-GB#composer=gustav-mahler", selector: "#card", text: "Gustav Mahler" },
  { path: "terms.html?lang=en-GB#term=fugue", selector: "#card", text: "Fugue" },
]) {
  test(`the old ${path.split("?")[0]} link retains the selected item`, async ({ page, baseURL }) => {
    await page.goto(`v2/${path}`);
    await expect(page).toHaveURL(new URL(path, baseURL).href);
    await expect(page.locator(selector)).toContainText(text);
  });
}
