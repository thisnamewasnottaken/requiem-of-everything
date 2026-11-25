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
    expect(key.bottom).toBeLessThanOrEqual(hint.top);
  }
});
