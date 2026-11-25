import { expect, test } from '@playwright/test';
import { createServer } from 'vite';

test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });

let server, url;
test.beforeAll(async () => {
  server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true }, server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  url = new URL('v2/river.html#still', server.resolvedUrls.local[0]).href;
});
test.afterAll(async () => { await server.close(); });

test('River era captions and event key have distinct space at desktop and narrow widths', async ({ page }) => {
  await page.addInitScript(() => {
    const { fillRect, fillText } = CanvasRenderingContext2D.prototype;
    CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
      if (this.canvas.id === 'river') {
        if (x === 0 && y === 0 && w === innerWidth && h === innerHeight) {
          window.riverFrame = { width: innerWidth, eras: [], trackY: 0 };
        } else if (x === -3 && y === -3 && w === 6 && h === 6) {
          window.riverFrame.trackY = this.getTransform().f + Math.SQRT2 * 3;
        }
      }
      return fillRect.call(this, x, y, w, h);
    };
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (this.canvas.id === 'river' && text.includes('\u200a')) {
        const { e: x, f: y } = this.getTransform();
        const bounds = this.measureText(text);
        window.riverFrame.eras.push({ left: x - bounds.width / 2, right: x + bounds.width / 2,
          bottom: y + bounds.actualBoundingBoxDescent });
      }
      return fillText.call(this, text, ...args);
    };
  });
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);

  for (const [width, height] of [[1024, 800], [1280, 800], [1440, 800], [768, 600], [1920, 800], [667, 375]]) {
    await page.setViewportSize({ width, height });
    await page.waitForFunction(w => window.riverFrame?.width === w && window.riverFrame.trackY > 0, width);
    const { eras, trackY, map, key, hint } = await page.evaluate(() => {
      const rect = id => document.getElementById(id).getBoundingClientRect().toJSON();
      return { ...window.riverFrame, map: rect('mini'), key: rect('legendE'), hint: rect('hint') };
    });
    expect(eras.length, `${width}px visible era captions`).toBe(6);
    for (let i = 0; i < eras.length; i++) {
      const { left, right, bottom } = eras[i];
      expect(left).toBeGreaterThanOrEqual(0);
      expect(right).toBeLessThanOrEqual(width);
      expect(bottom).toBeLessThan(map.top);
      if (i > 0) expect(left - eras[i - 1].right).toBeGreaterThan(6);
    }
    expect(trackY).toBeLessThan(key.top);
    expect(map.bottom).toBeLessThanOrEqual(key.top);
    expect(key.bottom).toBeLessThanOrEqual(hint.height > 0 ? hint.top : height);
  }
});

test('country captions hover and pin their own lane at 568×320', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.addInitScript(() => {
    const { fillText } = CanvasRenderingContext2D.prototype;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (this.canvas.id === 'river' && text.endsWith('I T A L Y')) {
        const { e: x, f: y } = this.getTransform();
        const ink = this.measureText(text);
        window.italyCaption = { x: x + ink.actualBoundingBoxRight - 1, top: y - ink.actualBoundingBoxAscent,
          bottom: y + ink.actualBoundingBoxDescent, pinned: text.startsWith('◆') };
      }
      return fillText.call(this, text, ...args);
    };
    localStorage.setItem('roe-sound', 'off');
  });
  await page.goto(url);
  await page.waitForFunction(() => window.italyCaption);
  const { x, top, bottom } = await page.evaluate(() => window.italyCaption);
  for (const y of [Math.ceil(top), Math.ceil(bottom) - 1]) {
    await page.mouse.move(x, y);
    await expect(page.locator('#tip b')).toHaveText('Italy');
    await expect(page.locator('#tip')).toHaveCSS('opacity', '1');
  }
  await page.mouse.click(x, Math.ceil(bottom) - 1);
  await page.waitForFunction(() => window.italyCaption.pinned);
});

test('life chart retains an upright plot on short landscape screens', async ({ page }) => {
  await page.addInitScript(() => {
    const { createLinearGradient } = CanvasRenderingContext2D.prototype;
    CanvasRenderingContext2D.prototype.createLinearGradient = function (x0, y0, x1, y1) {
      if (this.canvas.id === 'seis') window.lifePlotHeight = y1 - y0;
      return createLinearGradient.call(this, x0, y0, x1, y1);
    };
  });
  for (const [width, height] of [[667, 350], [667, 375], [568, 320]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${url.split('#')[0]}?checkHeight=${height}#focus=johann-sebastian-bach`);
    await page.waitForFunction(() => window.lifePlotHeight !== undefined);
    expect(await page.evaluate(() => window.lifePlotHeight)).toBeGreaterThan(0);
    await page.locator('#lListen').scrollIntoViewIfNeeded();
    await expect(page.locator('#lListen')).toBeInViewport();
    if (width === 667 && height === 350) {
      await page.locator('#lListen').focus();
      await page.keyboard.press('Tab');
      const chart = page.getByRole('region', { name: 'Life chart' });
      await expect(chart).toBeFocused();
      await expect(chart).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('ArrowDown');
      await expect.poll(() => chart.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    }
  }
});
