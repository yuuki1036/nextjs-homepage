import { COLOR_SCHEMES, LOCALES, PAGES } from "./support/site";
import { expect, test } from "./support/fixtures";

for (const colorScheme of COLOR_SCHEMES) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const target of PAGES) {
      for (const locale of LOCALES) {
        test(`${target.id} ${locale}`, async ({ page, visit }) => {
          const { masks } = await visit(target, locale);
          await expect(page).toHaveScreenshot(`${target.id}-${locale}-${colorScheme}.png`, {
            fullPage: true,
            mask: masks
          });
        });
      }
    }
  });
}
