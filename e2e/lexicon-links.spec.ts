import { expect, test, type Page } from "@playwright/test";

type Point = { x: number; y: number };
type Label = Point & { size: number; width: number };
type Curve = { a: Point; b: Point; control: Point; width: number };
type Frame = { labels: Record<string, Label>; curves: Curve[] };

async function watchGraph(page: Page) {
  await page.addInitScript(() => {
    const ctx = CanvasRenderingContext2D.prototype;
    const read = () => (window as Window & { graphFrame: Frame }).graphFrame;
    const { clearRect, moveTo, quadraticCurveTo, fillText } = ctx;
    let start = { x: 0, y: 0 };
    ctx.clearRect = function (...args: Parameters<typeof clearRect>) {
      if (this.canvas.id === "sky") (window as Window & { graphFrame: Frame }).graphFrame = { labels: {}, curves: [] };
      return clearRect.apply(this, args);
    };
    ctx.moveTo = function (x, y) {
      if (this.canvas.id === "sky") start = { x, y };
      return moveTo.call(this, x, y);
    };
    ctx.quadraticCurveTo = function (cx, cy, x, y) {
      if (this.canvas.id === "sky") read().curves.push({ a: start, b: { x, y }, control: { x: cx, y: cy }, width: this.lineWidth });
      return quadraticCurveTo.call(this, cx, cy, x, y);
    };
    ctx.fillText = function (...args: Parameters<typeof fillText>) {
      const [text, x, y] = args;
      if (this.canvas.id === "sky") read().labels[text] = { x, y, size: Number(this.font.match(/([\d.]+)px/)?.[1]), width: this.measureText(text).width };
      return fillText.apply(this, args);
    };
  });
}

async function linePoint(page: Page, from: string, to: string) {
  const result = await page.waitForFunction(({ from, to }) => {
    const frame = (window as Window & { graphFrame?: Frame }).graphFrame;
    if (!frame) return false;
    const a = frame.labels[from], b = frame.labels[to];
    if (!a || !b) return false;
    const same = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y) < 1;
    const line = frame.curves.find(c => c.width > 1 && (same(c.a, a) && same(c.b, b) || same(c.a, b) && same(c.b, a)));
    if (!line) return false;
    for (const f of [.5, .6, .4, .7, .3]) {
      const u = 1 - f;
      const x = u * u * line.a.x + 2 * u * f * line.control.x + f * f * line.b.x;
      const y = u * u * line.a.y + 2 * u * f * line.control.y + f * f * line.b.y;
      if (
        document.elementFromPoint(x, y)?.id === "sky" &&
        [a, b].every(label => Math.abs(label.x - x) > label.width / 2 + 8 || Math.abs(label.y - y) > label.size / 2 + 6)
      ) return { x, y };
    }
    return false;
  }, { from, to });
  return await result.jsonValue() as Point;
}

const heading = (page: Page, term: string) => page.getByRole("dialog").getByRole("heading", { name: term, exact: true });
const chip = (page: Page, term: string) => page.getByRole("button", { name: `Follow ${term} →`, exact: true });

test("hover, click, and double-click follow one lit connection at a time", async ({ page }, testInfo) => {
  await watchGraph(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("terms.html?lang=en-GB#term=crescendo");
  await expect(heading(page, "Crescendo")).toBeVisible();
  await expect(page.locator(".follow.active")).toHaveCount(0);
  const dynamics = await linePoint(page, "Crescendo", "Dynamics");
  await page.screenshot({ path: testInfo.outputPath("impl-before-follow.png") });
  await page.mouse.move(dynamics.x, dynamics.y);
  await page.mouse.down();
  await page.mouse.move(dynamics.x + 30, dynamics.y);
  await page.mouse.up();
  await expect(page.locator(".follow.active")).toHaveCount(0);
  await expect(heading(page, "Crescendo")).toBeVisible();
  await page.reload();
  await expect(heading(page, "Crescendo")).toBeVisible();
  const hovered = await linePoint(page, "Crescendo", "Dynamics");
  await page.mouse.move(hovered.x, hovered.y);
  await expect(chip(page, "Dynamics")).toHaveClass(/\bactive\b/);
  await page.screenshot({ path: testInfo.outputPath("impl-follow-chip.png") });
  await chip(page, "Dynamics").click();
  await expect(heading(page, "Dynamics")).toBeVisible();
  await expect(page).toHaveURL(/#term=dynamics$/);

  const tremolo = await linePoint(page, "Dynamics", "Tremolo");
  await page.mouse.click(tremolo.x, tremolo.y);
  await page.mouse.move(20, 180);
  await expect(chip(page, "Tremolo")).toHaveClass(/\bactive\b/);
  await expect(heading(page, "Dynamics")).toBeVisible();
  await page.mouse.dblclick(tremolo.x, tremolo.y);
  await expect(heading(page, "Tremolo")).toBeVisible();
  await expect(page.getByRole("link", { name: "See it in the Concert Hall" })).toHaveAttribute("href", "hall.html#instrument=viola");
  await page.screenshot({ path: testInfo.outputPath("impl-after-follow.png") });
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(heading(page, "Dynamics")).toBeVisible();
});

test("keyboard users can reveal, dismiss, and follow one connection", async ({ page }) => {
  await page.goto("terms.html?lang=en-GB");
  const search = page.locator("#q");
  await search.fill("Crescendo");
  await search.press("Enter");
  await expect(heading(page, "Crescendo")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(chip(page, "Dynamics")).toBeFocused();
  await expect(chip(page, "Dynamics")).toHaveClass(/\bactive\b/);
  await page.keyboard.press("Escape");
  await expect(heading(page, "Crescendo")).toBeFocused();
  await expect(page.locator(".follow.active")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect(heading(page, "Dynamics")).toBeFocused();
});

test("Piano Solo draws in both neighbors without normalising their perspective sizes", async ({ page }, testInfo) => {
  await watchGraph(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("terms.html?lang=en-GB#term=piano-solo");
  await expect(heading(page, "Piano Solo")).toBeVisible();
  await linePoint(page, "Piano Solo", "Étude");
  await linePoint(page, "Piano Solo", "Nocturne");
  const labels = await page.evaluate(() => (window as Window & { graphFrame: Frame }).graphFrame.labels);
  for (const name of ["Étude", "Nocturne"]) {
    expect(Math.hypot(labels[name].x - labels["Piano Solo"].x, labels[name].y - labels["Piano Solo"].y)).toBeLessThan(290);
    expect(labels[name].size).toBeLessThan(labels["Piano Solo"].size);
  }
  await page.screenshot({ path: testInfo.outputPath("impl-piano-pull.png") });
  await page.keyboard.press("Escape");
  await expect(heading(page, "Piano Solo")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Follow / })).toHaveCount(0);
});

test.describe("Lexicon on touch", () => {
  test.use({ hasTouch: true, viewport: { width: 740, height: 430 }, reducedMotion: "reduce" });

  test("press and hold a line, then tap its chip", async ({ page }, testInfo) => {
    await watchGraph(page);
    await page.goto("terms.html?lang=en-GB#term=crescendo");
    await expect(heading(page, "Crescendo")).toBeVisible();
    const point = await linePoint(page, "Crescendo", "Dynamics");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    await expect(chip(page, "Dynamics")).toHaveClass(/\bactive\b/);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(heading(page, "Crescendo")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("impl-mobile-long-press.png") });
    await chip(page, "Dynamics").tap();
    await expect(heading(page, "Dynamics")).toBeVisible();
  });
});
