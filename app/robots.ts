import type { MetadataRoute } from "next";
import { URL as SITE_URL } from "lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
