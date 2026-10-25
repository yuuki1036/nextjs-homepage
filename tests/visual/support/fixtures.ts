import { test as base, expect, type Locator, type Page } from "@playwright/test";
import { IMAGE_PENDING_CLASS, type Locale, type SitePage, urlFor } from "./site";

export type Visit = {
  // 撮るたびに変わる領域。toHaveScreenshot の mask に渡す
  readonly masks: Locator[];
  // goto より前から集めた console の error と未捕捉の例外
  errors(): string[];
};

type Fixtures = {
  networkIsolation: void;
  // 戻った時点で、status の一致・ハイドレーション・フォント・画像の読み込みが済んでいる
  visit: (target: SitePage, locale: Locale) => Promise<Visit>;
};

const contentTypeFor = (resourceType: string): string => {
  if (resourceType === "script") return "application/javascript";
  if (resourceType === "stylesheet") return "text/css";
  return "text/plain";
};

// 表示中なのに読み込みが終わっていない画像を、理由と src 付きで返す
const pendingImages = (page: Page, pendingClass: string): Promise<string[]> =>
  page.evaluate((pending) => {
    const result: string[] = [];
    for (const img of Array.from(document.images)) {
      if (!img.checkVisibility()) continue;
      const src = img.currentSrc || img.src;
      if (!img.complete) result.push(`loading ${src}`);
      else if (img.naturalWidth === 0) result.push(`broken ${src}`);
      else if (img.classList.contains(pending)) result.push(`hidden-until-hydrated ${src}`);
      else if (img.style.backgroundImage) result.push(`blur ${src}`);
    }
    return result;
  }, pendingClass);

// lazy の画像を読ませるため 1 画面ずつ下まで送り、先頭へ戻す。
// html の scroll-behavior: smooth を避けて instant で動かす
const scrollThrough = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo({ top: y, behavior: "instant" });
      await frame();
      await frame();
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await frame();
  });

const openSettled = async (page: Page, target: SitePage, locale: Locale): Promise<Visit> => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    errors.push(`[console.error] ${message.text()} @ ${message.location().url}`);
  });
  page.on("pageerror", (error) => errors.push(`[pageerror] ${error.message}`));

  const response = await page.goto(urlFor(target, locale));
  expect(response?.status(), "本文の status").toBe(target.status);
  expect(await page.evaluate(() => window.isSecureContext), "secure context").toBe(true);

  // ssr: false の chunk と、afterInteractive で挿入される GA・Vercel Analytics の読み込みを待つ
  await page.waitForLoadState("networkidle");
  for (const selector of target.ready) {
    await expect(page.locator(selector)).toBeVisible();
  }
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  await scrollThrough(page);
  await expect.poll(() => pendingImages(page, IMAGE_PENDING_CLASS)).toEqual([]);
  // 表示されていない lazy の画像は読み込まれず、decode() が終わらないので待たない
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((img) => img.checkVisibility())
        .map((img) => img.decode().catch(() => undefined))
    )
  );

  // 中身が出たことを確かめてから隠す（canvas などは複数あるので先頭で見る）
  const masks: Locator[] = [];
  for (const { region, drawn } of target.masks) {
    await expect(page.locator(drawn).first()).toBeVisible();
    const locator = page.locator(region);
    await expect(locator).toBeVisible();
    masks.push(locator);
  }

  return { masks, errors: () => [...errors] };
};

export const test = base.extend<Fixtures>({
  // 外部と /_vercel/ へのリクエストには空の 200 を返す。
  // abort するとコンソールにエラーが残る。CSP の検査はリクエストより前に行われるので違反は記録される
  networkIsolation: [
    async ({ context, baseURL }, use) => {
      const appOrigin = new URL(baseURL ?? "").origin;
      await context.route(
        (url) => url.origin !== appOrigin || url.pathname.startsWith("/_vercel/"),
        (route) =>
          route.fulfill({
            status: 200,
            contentType: contentTypeFor(route.request().resourceType()),
            body: ""
          })
      );
      await use();
    },
    { auto: true }
  ],
  visit: async ({ page }, use) => {
    await use((target, locale) => openSettled(page, target, locale));
  }
});

export { expect };
