import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

// 期待値は実装から import せずに書く（同じ一覧どうしを比べるだけのテストにしない）
const SITE = "https://yuuki1036.com";
const LOCALES = ["ja", "en"];
const STATIC_PATHS = ["", "/about", "/contact", "/service", "/works"];

// Works の一覧はここ 1 か所で数える（Works のデータの置き場所を変えたらここを直す）
const workPaths = (): string[] =>
  readdirSync(fileURLToPath(new URL("../_posts", import.meta.url)))
    .filter((file) => file.endsWith(".json"))
    .map((file) => `/works/${file.replace(/\.json$/, "")}`);

const paths = () => [...STATIC_PATHS, ...workPaths()];
const urls = () => sitemap().map((entry) => entry.url);

describe("sitemap.xml", () => {
  it("固定ページと Works を言語ごとに 1 件ずつ載せる", () => {
    expect(urls()).toHaveLength(paths().length * LOCALES.length);
    expect(new Set(urls()).size).toBe(urls().length);
    const expected = paths().flatMap((path) => LOCALES.map((locale) => `${SITE}/${locale}${path}`));
    expect([...urls()].sort()).toEqual(expected.sort());
  });

  it.each([
    `${SITE}/ja`,
    `${SITE}/en`,
    `${SITE}/ja/about`,
    `${SITE}/en/contact`,
    `${SITE}/ja/service`,
    `${SITE}/en/works`,
    `${SITE}/ja/works/hitokoto`,
    `${SITE}/en/works/netfjix`
  ])("%s を載せる", (url) => {
    expect(urls()).toContain(url);
  });

  it("各 URL に両方の言語の hreflang を付ける", () => {
    for (const entry of sitemap()) {
      const path = entry.url.replace(/^https:\/\/yuuki1036\.com\/(ja|en)/, "");
      expect(entry.alternates?.languages).toEqual({
        ja: `${SITE}/ja${path}`,
        en: `${SITE}/en${path}`
      });
    }
  });

  it("changefreq・priority・lastmod を出さない", () => {
    expect(sitemap().find((entry) => entry.url === `${SITE}/en/works/netfjix`)).toEqual({
      url: `${SITE}/en/works/netfjix`,
      alternates: {
        languages: { ja: `${SITE}/ja/works/netfjix`, en: `${SITE}/en/works/netfjix` }
      }
    });
    for (const entry of sitemap()) {
      expect(Object.keys(entry).sort()).toEqual(["alternates", "url"]);
    }
  });
});
