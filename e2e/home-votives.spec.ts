import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("roe-sound", "off");
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const getUniformLocation = proto.getUniformLocation;
      const uniform1i = proto.uniform1i;
      const votiveCounts = new WeakSet<WebGLUniformLocation>();
      proto.getUniformLocation = function (program, name) {
        const location = getUniformLocation.call(this, program, name);
        if (location && name === "uN") votiveCounts.add(location);
        return location;
      };
      proto.uniform1i = function (location, count) {
        if (location && votiveCounts.has(location) && this.canvas instanceof HTMLCanvasElement) {
          this.canvas.dataset.votiveCount = String(count);
        }
        uniform1i.call(this, location, count);
      };
    }
  });
  await page.goto("./?lang=en-GB");
});

test("visitors can light a votive by keyboard before entering or by clicking the hall", async ({ page }) => {
  const renderedVotives = page.locator("#gl");
  const light = page.getByRole("button", { name: "Light a votive" });
  const silent = page.getByRole("button", { name: "Enter in silence" });
  await expect(renderedVotives).toHaveAttribute("data-votive-count", "0");
  await silent.focus();
  await page.keyboard.press("Tab");
  await expect(light).toBeFocused();

  await page.keyboard.press("Space");
  await expect(renderedVotives).toHaveAttribute("data-votive-count", "1");
  await expect(silent).toBeVisible();

  await page.mouse.click(250, 320);
  await expect(renderedVotives).toHaveAttribute("data-votive-count", "2");

  await silent.click();
  await expect(page.locator("body")).toHaveClass(/\bentered\b/);
  await expect(page.locator("#enter")).toHaveJSProperty("inert", true);
  await expect(renderedVotives).toHaveAttribute("data-votive-count", "2");
  await page.mouse.click(250, 320);
  await expect(renderedVotives).toHaveAttribute("data-votive-count", "3");
});

test.describe("touch on the Home entry screen", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("tapping the button or the background adds one votive without entering", async ({ page }) => {
    const renderedVotives = page.locator("#gl");
    await expect(renderedVotives).toHaveAttribute("data-votive-count", "0");
    const overlay = await page.locator("body").evaluate(body => getComputedStyle(body, "::after").content);
    expect(overlay).toContain("Please turn your phone sideways");
    await page.touchscreen.tap(195, 422);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(renderedVotives).toHaveAttribute("data-votive-count", "0");
    await page.getByRole("button", { name: "Light a votive" }).tap();
    await expect(renderedVotives).toHaveAttribute("data-votive-count", "1");
    await page.touchscreen.tap(75, 220);
    await expect(renderedVotives).toHaveAttribute("data-votive-count", "2");
    await expect(page.locator("body")).not.toHaveClass(/\bentered\b/);
  });
});
