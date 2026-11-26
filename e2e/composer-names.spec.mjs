/* global CanvasRenderingContext2D, innerWidth, innerHeight, window */
import { expect, test } from '@playwright/test';

for (const [width, height] of [[1600, 900], [1024, 768], [844, 390], [568, 320]]) {
  test(`overview composer names stay separate and work without hover at ${width}×${height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('roe-sound', 'off');
      const { fillText, fillRect } = CanvasRenderingContext2D.prototype;
      CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
        if (this.canvas.id === 'river' && x === 0 && y === 0 && w === innerWidth && h === innerHeight) window.composerNames = [];
        return fillRect.call(this, x, y, w, h);
      };
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        if (this.canvas.id === 'river' && this.textAlign === 'right' && /Cormorant/.test(this.font)) {
          const { e: x, f: y, a: dpr } = this.getTransform(), ink = this.measureText(text);
          window.composerNames.push({ text, left: x / dpr - ink.width, right: x / dpr,
            top: y / dpr - ink.actualBoundingBoxAscent, bottom: y / dpr + ink.actualBoundingBoxDescent });
        }
        return fillText.call(this, text, ...args);
      };
    });
    await page.goto('river.html#still');
    await page.evaluate(() => window.document.fonts.ready);
    await page.waitForFunction(() => window.composerNames?.some(n => n.text === 'Mozart'));
    await expect(page.locator('#find')).toHaveValue('');
    await expect(page.locator('#life')).not.toHaveClass(/open/);
    const names = await page.evaluate(() => window.composerNames);
    for (let i = 0; i < names.length; i++) {
      const a = names[i];
      expect(a.left).toBeGreaterThanOrEqual(0);
      expect(a.right).toBeLessThanOrEqual(width);
      for (const b of names.slice(i + 1)) {
        expect(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
          `${a.text} overlaps ${b.text}`).toBe(false);
      }
    }
    // A genuine touch tap has no preceding mouse hover or pointermove.
    const mozart = names.find(n => n.text === 'Mozart');
    await page.touchscreen.tap((mozart.left + mozart.right) / 2, (mozart.top + mozart.bottom) / 2);
    await expect(page.locator('#life')).toHaveClass(/open/);
    await expect(page.locator('#lName')).toHaveText('Wolfgang Amadeus Mozart');
    if (height <= 500) {
      const switcher = await page.locator('#roe-language').boundingBox();
      const hint = await page.locator('.closehint').boundingBox();
      expect(switcher.y + switcher.height).toBeLessThan(hint.y);
    }
    await context.close();
  });
}

test('dismissing a keyboard search does not reopen the life on reload', async ({ page }) => {
  await page.goto('river.html#still');
  await page.keyboard.press('/');
  await expect(page.locator('#find')).toBeFocused();
  await page.keyboard.type('Bach');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#focus=johann-sebastian-bach$/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#life')).not.toHaveClass(/open/);
  await expect(page).not.toHaveURL(/focus=/);
  await page.reload();
  await expect(page.locator('#life')).not.toHaveClass(/open/);
});
