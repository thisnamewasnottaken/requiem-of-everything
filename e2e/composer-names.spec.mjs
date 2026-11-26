/* global CanvasRenderingContext2D, innerWidth, innerHeight, window */
import { expect, test } from '@playwright/test';

for (const [width, height] of [[1600, 900], [1024, 768], [844, 390], [568, 320], [430, 320]]) {
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
      await page.keyboard.press('/');
      await expect(page.locator('#find')).toBeFocused();
      const search = await page.locator('#find').boundingBox();
      const card = await page.locator('#life').boundingBox();
      expect(search.y + search.height).toBeLessThan(card.y);
      await page.keyboard.type('Bach');
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('.find-result[aria-selected="true"]')).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page.locator('#lName')).toHaveText('Johann Sebastian Bach');
      await page.locator('.sigil-burger').click();
      await expect(page.locator('.sigil')).toHaveClass(/open/);
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

test('compact landscape search has room for a readable query', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 374 });
  await page.goto('river.html#still&focus=johann-sebastian-bach');
  await expect(page.locator('#life')).toHaveClass(/open/);
  await page.keyboard.press('/');
  const input = page.locator('#find');
  await expect(input).toBeFocused();
  await input.fill('Mozart');
  const textWidth = await input.evaluate(el => {
    const style = window.getComputedStyle(el);
    return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  });
  expect(textWidth).toBeGreaterThan(200);
  const search = await input.boundingBox(), card = await page.locator('#life').boundingBox();
  expect(search.y + search.height).toBeLessThan(card.y);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#lName')).toHaveText('Wolfgang Amadeus Mozart');
  await page.locator('.sigil-burger').click();
  await expect(page.locator('.sigil')).toHaveClass(/open/);
});

test('search buttons remain clickable when the browser does not focus buttons', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 374 });
  await page.goto('river.html#still&focus=johann-sebastian-bach');
  await expect(page.locator('#life')).toHaveClass(/open/);
  // Emulate Safari's non-focusing button default, unless the app cancels it.
  await page.locator('#findGroup').evaluate(group => {
    group.addEventListener('mousedown', event => {
      if (!event.defaultPrevented && event.target.closest('button')) {
        event.preventDefault();
        window.document.activeElement.blur();
      }
    });
  });
  await page.locator('#find').fill('Mozart');
  await page.locator('.find-result').first().click();
  await expect(page.locator('#lName')).toHaveText('Wolfgang Amadeus Mozart');
  await expect(page.locator('#life')).toBeFocused();
  await page.locator('#find').fill('Bach');
  await page.locator('#findClear').click();
  await expect(page.locator('#find')).toHaveValue('');
  await expect(page.locator('#life')).not.toHaveClass(/open/);
});

test('a hovered name painted over a country opens its composer', async ({ page }) => {
  // Isolate a real composer's lane to make the zoomed label overlap deterministic.
  await page.route('**/common/data.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() +
      '\nwindow.ROE_DATA.composers.forEach(c => { if (c.id !== "wolfgang-amadeus-mozart") c.nationalityKey = "Italian"; });' });
  });
  await page.addInitScript(() => {
    const { fillText } = CanvasRenderingContext2D.prototype;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (this.canvas.id === 'river') {
        const { e: x, f: y, a: dpr } = this.getTransform();
        const ink = this.measureText(text);
        if (String(text).replaceAll(' ', '') === 'GERMANLANDS') window.countryCenter = y / dpr - 3;
        if (text === 'Mozart') window.mozartName = { x: x / dpr - ink.width / 2, y: y / dpr - 3 };
      }
      return fillText.call(this, text, ...args);
    };
  });
  await page.goto('river.html#still&zoom=1750-1850');
  await page.waitForFunction(() => window.countryCenter);
  const countryY = await page.evaluate(() => window.countryCenter);
  // Hover a thread away from the caption, revealing its otherwise omitted name.
  await page.mouse.move(400, countryY);
  await page.waitForFunction(() => window.mozartName);
  const name = await page.evaluate(() => window.mozartName);
  await page.mouse.click(name.x, name.y);
  await expect(page.locator('#life')).toHaveClass(/open/);
  await expect(page.locator('#lName')).toHaveText('Wolfgang Amadeus Mozart');
});
