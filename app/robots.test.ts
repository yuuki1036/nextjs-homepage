import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots.txt", () => {
  it("sitemap.xml を指す", () => {
    expect(robots().sitemap).toBe("https://yuuki1036.com/sitemap.xml");
  });

  it("全体を許可する", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://yuuki1036.com/sitemap.xml",
      host: "https://yuuki1036.com"
    });
  });
});
