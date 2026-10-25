import { COLOR_SCHEMES, LOCALES, PAGES, urlFor } from "./support/site";
import { expect, test } from "./support/fixtures";

// 既知のエラーを除外する仕組みは作らない。出たら原因を直す。
// 例外は目録の status が 404 のページだけで、ページ自体の 404 を Chromium が console error として出す 1 行を期待値にする
for (const colorScheme of COLOR_SCHEMES) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const target of PAGES) {
      for (const locale of LOCALES) {
        test(`${target.id} ${locale}`, async ({ visit, baseURL }) => {
          const { errors } = await visit(target, locale);
          const expected =
            target.status === 404
              ? [
                  `[console.error] Failed to load resource: the server responded with a status of 404 (Not Found) @ ${baseURL}${urlFor(target, locale)}`
                ]
              : [];
          expect(errors()).toEqual(expected);
        });
      }
    }
  });
}

// 上の検査が 0 件で通るのは、未捕捉の例外を集める経路が動いているときだけ。
// console 側は 404 の 1 行が毎回確かめるので、pageerror 側をここで確かめる
test("visit() が未捕捉の例外を集める", async ({ page, visit }) => {
  const home = PAGES.find((target) => target.id === "home");
  if (!home) throw new Error("目録に home が無い");
  const { errors } = await visit(home, "ja");
  await page.evaluate(() => {
    setTimeout(() => {
      throw new Error("visual-test-pageerror");
    });
  });
  await expect.poll(() => errors()).toEqual(["[pageerror] visual-test-pageerror"]);
});
