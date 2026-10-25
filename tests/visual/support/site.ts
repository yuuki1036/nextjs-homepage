// スクリーンショット比較とコンソール検査で回すページの目録。
// サイトについての知識（どこを待つか・どこを隠すか）はここにだけ置く。

export const LOCALES = ["ja", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const COLOR_SCHEMES = ["light", "dark"] as const;

export type SitePage = {
  id: string;
  path: string;
  status: 200 | 404;
  // 表示されるまで待つ要素（ハイドレーション済みの目印）
  ready: readonly string[];
  // 撮るたびに変わるので隠す領域
  masks: readonly MaskedRegion[];
};

// 隠す領域と、その中身が出たことの目印を 1 組で持つ。
// 固定高のコンテナは空でも表示されるので、region の表示だけでは待ちにならない
export type MaskedRegion = {
  region: string;
  drawn: string;
};

// components/Image.tsx が読み込み完了まで付けるクラス（opacity 0）
export const IMAGE_PENDING_CLASS = "onload";

// テーマ切替のアイコンは mount の後に描画される
const THEME_ICON = 'button[aria-label="Toggle Dark Mode"] svg';
// amCharts の ForceDirected は配置が毎回変わるので隠す。
// SkillMap が mount したかは canvas で待つ（canvas は描画の前に作られる）
const SKILL_MAP: MaskedRegion = { region: "#chartdiv", drawn: "#chartdiv canvas" };

// _posts から導出しない。データの移行で 1 件落ちても比較で気づけるようにする
const WORKS_SLUGS = ["53st", "hitokoto", "inorganiclikes", "netfjix", "reversi", "vegetalism"];

const localePage = (id: string, path: string, masks: readonly MaskedRegion[] = []): SitePage => ({
  id,
  path,
  status: 200,
  ready: [THEME_ICON],
  masks
});

export const PAGES: readonly SitePage[] = [
  localePage("home", "/"),
  localePage("works", "/works"),
  ...WORKS_SLUGS.map((slug) => localePage(`works-${slug}`, `/works/${slug}`)),
  localePage("service", "/service"),
  localePage("about", "/about", [SKILL_MAP]),
  localePage("contact", "/contact"),
  // /works/ の下の存在しない slug は 404 ではなく 500 を返すので使わない。
  // . を含むパスは proxy の matcher から外れて CSP が付かないので使わない
  { id: "not-found", path: "/not-found-check", status: 404, ready: [], masks: [] }
];

// locale は URL のパスだけで決まる（proxy.ts）
export const urlFor = (page: SitePage, locale: Locale): string =>
  page.path === "/" ? `/${locale}` : `/${locale}${page.path}`;
