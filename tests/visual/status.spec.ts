import { expect, test } from "./support/fixtures";

// locale の無いパスは PAGES に書けない（urlFor が locale を付ける）ので、status だけを見る。
// proxy の matcher から外れて [locale] に届くパスと、.json の付いた Works の slug
const NOT_FOUND_PATHS = ["/foo.xml", "/sitemap-0.xml", "/ja/works/reversi.json"];

for (const path of NOT_FOUND_PATHS) {
  test(`${path} は 404`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
  });
}
