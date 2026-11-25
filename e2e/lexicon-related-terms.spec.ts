import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

declare global {
  interface Window {
    lexiconLabels: Map<string, { x: number; y: number }>;
  }
}

async function expectCentered(page: Page, term: string) {
  await expect.poll(() => page.evaluate((name) => {
    const position = window.lexiconLabels.get(name);
    if (!position) return Infinity;
    return Math.hypot(position.x - (innerWidth / 2 - 200), position.y - (innerHeight / 2 + 30));
  }, term)).toBeLessThan(24);
}

test("readers can follow the graph from Crescendo to Viola and return", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.lexiconLabels = new Map();
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth?) {
      if (this.canvas.id === "sky") window.lexiconLabels.set(text, { x, y });
      return fillText.call(this, text, x, y, maxWidth);
    };
  });
  await page.goto("./?lang=en-GB#entered");
  await page.getByRole("link", { name: /The Lexicon/ }).click();

  const search = page.getByRole("searchbox", { name: "Find a word" });
  await page.getByRole("button", { name: "Loud & soft", exact: true }).click();
  await expect(page).toHaveURL(/#group=dyn$/);
  await search.fill("Crescendo");
  await search.press("Enter");
  const card = page.getByRole("dialog");
  const related = card.getByRole("region", { name: "Related terms" });
  const trail = card.getByRole("navigation", { name: "Term trail" });
  const hallLink = card.getByRole("link", { name: "See it in the Concert Hall" });
  await expect(card).toHaveAccessibleName("Crescendo");
  await expect(related.getByRole("button")).toHaveText([/Dynamics/, /Diminuendo/]);
  await expect(hallLink).toHaveCount(0);
  await expect(card).toHaveCSS("opacity", "1");
  await expectCentered(page, "Crescendo");
  await page.screenshot({ path: testInfo.outputPath("crescendo.png") });

  await related.getByRole("button", { name: /Dynamics/ }).click();
  await expect(card).toHaveAccessibleName("Dynamics");
  await expect(page).toHaveURL(/#term=dynamics$/);
  await expect(trail.getByRole("button", { name: "Crescendo", exact: true })).toBeVisible();
  await expect(trail.locator("[aria-current]")).toHaveText("Dynamics");
  await expect(related.getByRole("button")).toHaveText([/Crescendo/, /Tremolo.*Ways of playing/]);
  await expectCentered(page, "Dynamics");
  await page.screenshot({ path: testInfo.outputPath("dynamics.png") });

  const tremolo = related.getByRole("button", { name: /Tremolo/ });
  await expect(card.getByRole("heading", { name: "Dynamics" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(related.getByRole("button", { name: /Crescendo/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(tremolo).toBeFocused();
  await expect(tremolo).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(card).toHaveAccessibleName("Tremolo");
  await expect(card.getByRole("heading", { name: "Tremolo" })).toBeFocused();
  await expect(trail.getByRole("button")).toHaveText([/Back/, "Crescendo", "Dynamics"]);
  await expect(related.getByRole("button")).toHaveText([/Dynamics/]);
  await expect(hallLink).toBeVisible();
  await expectCentered(page, "Tremolo");
  await page.screenshot({ path: testInfo.outputPath("tremolo.png") });

  await hallLink.click();
  await expect(page).toHaveURL(/hall\.html#.*instrument=viola/);
  await expect(page.locator("#card")).toHaveClass(/\bopen\b/);
  await expect(page.locator("#card")).toContainText("Viola");
  await page.goBack();
  await expect(page).toHaveURL(/terms\.html#term=tremolo$/);
  await expect(card).toHaveAccessibleName("Tremolo");

  await hallLink.click();
  await page.getByRole("link", { name: "Lexicon", exact: true }).click();
  await expect(page).toHaveURL(/terms\.html#term=tremolo$/);
  await page.reload();
  await expect(card).toHaveAccessibleName("Tremolo");
});

test.describe("touch and reduced motion", () => {
  test.use({ viewport: { width: 740, height: 390 }, hasTouch: true, isMobile: true });

  test("readers can backtrack and choose another branch", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("terms.html?lang=en-GB#term=crescendo");
    const card = page.getByRole("dialog", { name: "Crescendo" });
    await expect(card).toHaveCSS("transition-duration", "0s");
    await card.getByRole("button", { name: /Dynamics/ }).tap();
    const dynamics = page.getByRole("dialog", { name: "Dynamics" });
    await dynamics.getByRole("button", { name: /Tremolo/ }).tap();
    await page.getByRole("button", { name: "Back to Dynamics" }).tap();
    await expect(dynamics).toBeVisible();
    await dynamics.getByRole("navigation").getByRole("button", { name: "Crescendo", exact: true }).tap();
    await card.getByRole("button", { name: /Diminuendo/ }).tap();
    await expect(page).toHaveURL(/#term=diminuendo$/);
    const diminuendo = page.getByRole("dialog", { name: "Diminuendo" });
    await expect(diminuendo.getByRole("link", { name: /Concert Hall/ })).toHaveCount(0);
    await diminuendo.getByRole("button", { name: "Hear it", exact: true }).tap();
    await expect(diminuendo.getByRole("button", { name: "Hear it again" })).toBeVisible({ timeout: 15_000 });
  });
});
