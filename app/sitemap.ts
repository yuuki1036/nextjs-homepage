import type { MetadataRoute } from "next";
import { getAllPosts } from "lib/api";
import { locales } from "lib/i18n";
import { URL as SITE_URL } from "lib/constants";

const STATIC_PATHS = ["", "/about", "/contact", "/service", "/works"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...STATIC_PATHS, ...getAllPosts().map((post) => `/works/${post.slug}`)];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
    );
    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: { languages }
    }));
  });
}
