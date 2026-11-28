import { expect, test } from "@playwright/test";

const titles = {
  "en-GB": "Variations Through Time",
  "af-ZA": "Variasies deur die tyd",
  "es-ES": "Variaciones a través del tiempo",
  "fr-FR": "Variations à travers le temps",
  "pl-PL": "Wariacje w czasie",
};

for (const [lang, title] of Object.entries(titles)) {
  test(`the timeline name stays consistent across entry points in ${lang}`, async ({ page }) => {
    await page.goto(`./?lang=${lang}#entered`);
    const destination = page.locator('.portal[href="river.html"]');
    await expect(destination.locator(".name")).toHaveText(title);
    await destination.click();
    await expect(page.locator("#head h1")).toHaveText(title);
    await expect(page).toHaveTitle(new RegExp(`^${title} — `));

    await page.goto("hall.html#composer=johann-sebastian-bach");
    await expect(page.locator('.sigil a[href="river.html"]')).toHaveText(title);
    const life = page.locator('a[href="river.html#focus=johann-sebastian-bach"]');
    await expect(life).toBeVisible();
    await expect(life).toContainText(lang === "pl-PL" ? "Wariacjach w czasie" : title);
    await life.click();
    await expect(page.locator("#life")).toHaveClass(/open/);
    await expect(page.locator("#head h1")).toHaveText(title);

    await page.goto("terms.html");
    await expect(page.locator('.sigil a[href="river.html"]')).toHaveText(title);
  });
}

for (const lang of ["fr-FR", "es-ES"]) {
  test(`the long Hall life link is tappable above the dock at 568×320 in ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 });
    await page.goto(`hall.html?lang=${lang}#composer=johann-sebastian-bach`);
    const life = page.locator('a[href="river.html#focus=johann-sebastian-bach"]');
    await life.scrollIntoViewIfNeeded();
    await life.click();
    await expect(page).toHaveURL(/river\.html#focus=johann-sebastian-bach$/);
    await expect(page.locator("#lName")).toContainText("Bach");
  });
}
