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

test("Home text cannot be selected by dragging", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#enter")).toHaveCSS("opacity", "1", { timeout: 10_000 });

  for (const selector of ["#homeTitle", "#aboutTitle"]) {
    if (selector === "#aboutTitle") {
      await page.getByRole("button", { name: "Enter in silence" }).click();
      await page.getByRole("button", { name: "Credits" }).click();
      await expect(page.getByRole("dialog", { name: "Credits" })).toHaveCSS("opacity", "1");
    }

    const { x, y, width } = await page.locator(selector).evaluate(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rect = range.getBoundingClientRect();
      return { x: rect.left, y: rect.top + rect.height / 2, width: rect.width };
    });
    await page.mouse.move(x + 2, y);
    await page.mouse.down();
    await page.mouse.move(x + width - 2, y, { steps: 10 });
    await page.mouse.up();
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
  }
});

test("visitors can enter V2 and open the River without WebGL2", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type === "webgl2" ? null : Reflect.apply(getContext, this, [type, ...args]);
    };
  });
  await page.goto("./");
  await expect(page.locator("#homeTitle")).toHaveText("Requiem of Everything");
  await expect(page.locator("#gl")).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/\bno-gl\b/);
  await expect(page.locator("#glNotice")).toBeHidden();
  await page.getByRole("button", { name: "Enter in silence" }).click();
  await expect(page.locator("body")).toHaveClass(/\bentered\b/);
  await page.getByRole("link", { name: /The River of Time/ }).click();
  await expect(page).toHaveURL(/\/requiem-of-everything\/river\.html$/);
  await expect(page.locator("#river")).toBeVisible();
});

test("the home page falls back to its CSS hall when WebGL renders black", async ({ page }) => {
  await page.addInitScript(() => {
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      proto.drawArrays = function (this: WebGLRenderingContext) {
        this.clearColor(0, 0, 0, 1);
        this.clear(this.COLOR_BUFFER_BIT);
      };
    }
  });
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/\bno-gl\b/);
  await expect(page.locator("#hallLight")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "withholding WebGL" })).toBeVisible();
});

test("the home page falls back to its CSS hall when WebGL draws nothing", async ({ page }) => {
  await page.addInitScript(() => {
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      proto.drawArrays = () => {};
    }
  });
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/\bno-gl\b/);
  await expect(page.getByRole("status").filter({ hasText: "withholding WebGL" })).toBeVisible();
});

test("the home page keeps its hall of light without WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return /webgl/.test(type) ? null : Reflect.apply(getContext, this, [type, ...args]);
    };
  });
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/\bno-gl\b/);
  await expect(page.locator("#hallLight")).toBeVisible();
  await expect(page.locator("#gl")).toBeHidden();
  const notice = page.getByRole("status").filter({ hasText: "withholding WebGL" });
  await expect(notice).toBeVisible();
  await notice.getByRole("button", { name: "Dismiss" }).click();
  await expect(notice).toBeHidden();
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/\bno-gl\b/);
  await expect(page.locator("#glNotice")).toBeHidden();
  await page.getByRole("button", { name: "Enter in silence" }).click();
  await expect(page.locator("body")).toHaveClass(/\bentered\b/);
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
  await expect(page.locator("#enter")).toHaveJSProperty("inert", true);
  await page.getByRole("button", { name: "Credits" }).focus();
  await page.keyboard.press("Tab");
  const legacyLink = page.getByRole("link", { name: "Requiem V1" });
  await expect(legacyLink).toBeVisible();
  await expect(legacyLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/requiem-of-everything\/legacy\/v1\/$/);
});

test("Credits and the V1 link do not overlap at 375px", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 374 });
  await page.goto("./#entered");
  const credits = page.getByRole("button", { name: "Credits" });
  const legacyLink = page.getByRole("link", { name: "Requiem V1" });
  await expect(credits).toBeVisible();
  await expect(legacyLink).toBeVisible();

  const [creditsBox, legacyBox] = await Promise.all([credits.boundingBox(), legacyLink.boundingBox()]);
  expect(creditsBox).not.toBeNull();
  expect(legacyBox).not.toBeNull();
  const a = creditsBox!;
  const b = legacyBox!;
  expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("v2-entered-375px.png") });
  await credits.click();
  const dialog = page.getByRole("dialog", { name: "Credits" });
  await expect(dialog).toHaveClass(/\bopen\b/);
});

for (const [width, height] of [[375, 667], [740, 360], [1440, 900]]) {
  test(`V2 destination names receive pointer input at ${width}×${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("./#entered");
    await expect(page.locator("body")).toHaveClass(/\bentered\b/);

    if (width < height) {
      const overlay = await page.locator("body").evaluate(body => getComputedStyle(body, "::after").content);
      expect(overlay).toContain("Please turn your phone sideways");
      await page.addStyleTag({ content: "body::after { pointer-events: none; }" });
    }

    const names = page.locator("#portals .name");
    await expect(names).toHaveCount(3);
    await expect.poll(() => names.evaluateAll(labels => labels.map(label => {
      const { x, y, width, height } = label.getBoundingClientRect();
      return document.elementFromPoint(x + width / 2, y + height / 2)?.closest(".portal") === label.closest(".portal");
    }))).toEqual([true, true, true]);

    if (width >= height) await page.screenshot({ path: testInfo.outputPath(`v2-entered-${width}x${height}.png`) });
  });
}

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
