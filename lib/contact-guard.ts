import { createHash } from "node:crypto";
import { RECAPTCHA_TOKEN_FIELD, verifyRecaptcha } from "./recaptcha";

// 問い合わせの bot 判定と、自動返信・隔離通知の送信上限。
// 判定の結果は理由コードで表し、1 個以上付いた問い合わせは拒否せず隔離する
// （[要確認:理由コード] 件名で管理者に届け、自動返信は送らない）。
// 仕様: features/Userは、サイト運営者として、問い合わせフォームをbotと自動返信の悪用から守りたい/spec.md

// 並び順は件名に載せる優先順（spec の理由コード一覧の順）
export const REASON_CODES = [
  "recaptcha_missing_token",
  "recaptcha_malformed_token",
  "recaptcha_misconfigured",
  "recaptcha_unavailable",
  "recaptcha_unexpected_response",
  "recaptcha_not_success",
  "recaptcha_no_score",
  "recaptcha_low_score",
  "recaptcha_action_mismatch",
  "recaptcha_hostname_mismatch",
  "recaptcha_stale",
  "honeypot",
  "random_alpha",
  "origin_mismatch",
  "origin_missing"
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export const orderReasons = (reasons: ReasonCode[]): ReasonCode[] =>
  REASON_CODES.filter((code) => reasons.includes(code));

// ---- 設定（判定パラメータは公開リポジトリから読めないよう env で上書きできる） ----

const DEFAULT_MIN_SCORE = 0.5;
const DEFAULT_HONEYPOT_FIELD = "subject";
const DEFAULT_RANDOM_ALPHA_MIN_LENGTH = 12;
const DEFAULT_RANDOM_ALPHA_MIN_CASE = 3;
const HONEYPOT_FIELD_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
const RESERVED_FIELDS = ["name", "email", "inquiry", RECAPTCHA_TOKEN_FIELD];

type Env = Record<string, string | undefined>;

export type GuardConfig = {
  recaptchaSecret: string | undefined;
  minScore: number;
  allowedHostnames: string[];
  honeypotField: string;
  randomAlphaMinLength: number;
  randomAlphaMinCase: number;
  store: StoreConfig;
};

type StoreConfig = { url: string; token: string } | null;

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return value !== undefined && Number.isInteger(n) && n > 0 ? n : fallback;
};

const parseScore = (value: string | undefined): number => {
  const n = Number(value);
  return value !== undefined && value.trim() !== "" && n >= 0 && n <= 1 ? n : DEFAULT_MIN_SCORE;
};

// 問い合わせページと /api/sendMail の両方から読み、欄名をそろえる
export const resolveHoneypotField = (env: Env): string => {
  const field = env.CONTACT_HONEYPOT_FIELD?.trim();
  return field && HONEYPOT_FIELD_PATTERN.test(field) && !RESERVED_FIELDS.includes(field)
    ? field
    : DEFAULT_HONEYPOT_FIELD;
};

// URL と TOKEN は同じ組から取る（Marketplace 経由は KV_*、直接契約は UPSTASH_*）
const resolveStore = (env: Env): StoreConfig => {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return { url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN };
  }
  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    return { url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN };
  }
  return null;
};

export const loadGuardConfig = (env: Env, siteHostname: string): GuardConfig => {
  const hostnames = (env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host !== "");
  return {
    recaptchaSecret: env.RECAPTCHA_SERVER_SECRET_KEY || undefined,
    minScore: parseScore(env.RECAPTCHA_MIN_SCORE),
    allowedHostnames: hostnames.length > 0 ? hostnames : [siteHostname, `www.${siteHostname}`],
    honeypotField: resolveHoneypotField(env),
    randomAlphaMinLength: parsePositiveInt(
      env.CONTACT_RANDOM_ALPHA_MIN_LENGTH,
      DEFAULT_RANDOM_ALPHA_MIN_LENGTH
    ),
    randomAlphaMinCase: parsePositiveInt(
      env.CONTACT_RANDOM_ALPHA_MIN_CASE,
      DEFAULT_RANDOM_ALPHA_MIN_CASE
    ),
    store: resolveStore(env)
  };
};

// ---- フォームの判定 ----

export const hasHoneypotValue = (value: unknown): boolean =>
  value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "");

// 観測した bot は名前・本文とも空白なしの英大小文字ランダム列だった。
// 先頭以外に大文字と小文字が混ざる長い英字列だけを対象にし、CamelCase の短い名前や英文は外す
export const isRandomAlpha = (value: string, minLength: number, minCase: number): boolean => {
  const text = value.trim();
  if (text.length < minLength || !/^[A-Za-z]+$/.test(text)) return false;
  const rest = text.slice(1);
  const upper = rest.match(/[A-Z]/g)?.length ?? 0;
  const lower = rest.match(/[a-z]/g)?.length ?? 0;
  return upper >= minCase && lower >= minCase;
};

export const isOriginMismatch = (origin: string | null, host: string): boolean => {
  if (origin === null) return false;
  try {
    return new URL(origin).host.toLowerCase() !== host.toLowerCase();
  } catch {
    return true;
  }
};

type FormSignals = {
  raw: Record<string, unknown>;
  name: string;
  inquiry: string;
  origin: string | null;
  host: string;
};

export const collectFormReasons = (signals: FormSignals, config: GuardConfig): ReasonCode[] => {
  const reasons: ReasonCode[] = [];
  // 欄名がプロトタイプのメンバー名（constructor 等）でも誤判定しないよう、本文自身のキーだけを見る
  const honeypot = Object.hasOwn(signals.raw, config.honeypotField)
    ? signals.raw[config.honeypotField]
    : undefined;
  if (hasHoneypotValue(honeypot)) reasons.push("honeypot");
  const random = (text: string) =>
    isRandomAlpha(text, config.randomAlphaMinLength, config.randomAlphaMinCase);
  if (random(signals.name) && random(signals.inquiry)) reasons.push("random_alpha");
  if (isOriginMismatch(signals.origin, signals.host)) reasons.push("origin_mismatch");
  // ブラウザは POST に必ず Origin を付ける（Fetch 仕様）ので、無いのはヘッダーを組み立てないスクリプト
  if (signals.origin === null) reasons.push("origin_missing");
  return reasons;
};

// ---- 送信上限（Upstash の REST API を直接呼ぶ） ----

export const SEND_QUOTA = {
  autoReplyGlobal: 10,
  autoReplyPerRecipient: 1,
  // 強い bot 信号のある隔離は観測中の bot の量を見込んだ値。弱い理由だけの隔離は正当な送信者を
  // 含みうるので高めにし、Resend の無料枠（100 通/日）を使い切らせないことだけを目的にする
  quarantineStrong: 20,
  quarantineWeak: 50
} as const;

const QUOTA_TTL_SECONDS = 2 * 24 * 60 * 60;
const STORE_TIMEOUT_MS = 1000;

export const toRecipientKey = (email: string): string => {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf("@");
  if (at < 0) return address;
  let local = address.slice(0, at);
  let domain = address.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replaceAll(".", "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
};

const utcDay = (now: number): string => new Date(now).toISOString().slice(0, 10);

// メールアドレスを外部ストアのキーに残さないようハッシュにする
export const autoReplyQuotaKeys = (email: string, now: number): [string, string] => {
  const day = utcDay(now);
  const hash = createHash("sha256").update(toRecipientKey(email)).digest("hex").slice(0, 32);
  return [`contact:autoreply:to:${day}:${hash}`, `contact:autoreply:global:${day}`];
};

// 強い兆候の有無で分けて数え、それぞれの上限で判定する
export const quarantineQuotaKey = (now: number, strong: boolean): string =>
  `contact:quarantine:${strong ? "strong" : "weak"}:${utcDay(now)}`;

export type StoreResult = {
  // 各キーを INCR した後の値。ストアが使えないときは null
  counts: number[] | null;
  // 使えなかった理由（未設定・HTTP ステータス・例外名・応答の形）。管理者通知とログに載せる
  detail: string | null;
};

// 例外は投げず、使えなかった理由を detail で返す
export const incrDailyCounts = async (
  keys: string[],
  store: StoreConfig,
  fetchFn: typeof fetch,
  timeoutMs = STORE_TIMEOUT_MS
): Promise<StoreResult> => {
  if (store === null) return { counts: null, detail: "not-configured" };
  const commands = keys.flatMap((key) => [
    ["INCR", key],
    ["EXPIRE", key, String(QUOTA_TTL_SECONDS)]
  ]);
  try {
    const res = await fetchFn(`${store.url.replace(/\/+$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${store.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) return { counts: null, detail: `http=${res.status}` };
    const json: unknown = await res.json();
    if (!Array.isArray(json) || json.length !== commands.length) {
      return { counts: null, detail: "unexpected-shape" };
    }
    const counts: number[] = [];
    for (let i = 0; i < keys.length; i++) {
      const item: unknown = json[i * 2];
      const result =
        typeof item === "object" && item !== null ? (item as { result?: unknown }).result : null;
      if (typeof result !== "number") return { counts: null, detail: "item-error" };
      counts.push(result);
    }
    return { counts, detail: null };
  } catch (err) {
    return { counts: null, detail: `error=${err instanceof Error ? err.name : "unknown"}` };
  }
};

export type AutoReplyDecision =
  | { send: true }
  | {
      send: false;
      reason: "quarantined" | "recipient_limit" | "global_limit" | "limiter_unavailable";
    };

// 第三者への送信なので、上限を確かめられないときは送らない（fail-closed）
export const decideAutoReply = (counts: number[] | null): AutoReplyDecision => {
  const [toRecipient, global] = counts ?? [];
  if (toRecipient === undefined || global === undefined) {
    return { send: false, reason: "limiter_unavailable" };
  }
  if (toRecipient > SEND_QUOTA.autoReplyPerRecipient) {
    return { send: false, reason: "recipient_limit" };
  }
  if (global > SEND_QUOTA.autoReplyGlobal) return { send: false, reason: "global_limit" };
  return { send: true };
};

// 正当な送信者には付かない bot の兆候。トークンなし・低スコア・siteverify の障害などは
// 拡張機能や VPN を使う正当な送信者にも付くので含めない
const STRONG_BOT_REASONS: readonly ReasonCode[] = [
  "recaptcha_malformed_token",
  "honeypot",
  "random_alpha",
  "origin_mismatch",
  "origin_missing"
];

export const hasStrongBotSignal = (reasons: ReasonCode[]): boolean =>
  reasons.some((reason) => STRONG_BOT_REASONS.includes(reason));

export type QuarantineNotice = "notify" | "notify_limit_reached" | "drop";

// 上限ちょうどの件には上限到達を書いて届け、それを超えた分は破棄する
export const decideQuarantineNotice = (
  counts: number[] | null,
  strong: boolean
): QuarantineNotice => {
  const count = counts?.[0];
  // 自分宛ての通知なので、上限を確かめられないときは届ける（fail-open）
  if (count === undefined) return "notify";
  const limit = strong ? SEND_QUOTA.quarantineStrong : SEND_QUOTA.quarantineWeak;
  if (count < limit) return "notify";
  return count === limit ? "notify_limit_reached" : "drop";
};

// ---- メール文面 ----

export type Diagnostics = {
  userAgent: string | null;
  origin: string | null;
  secFetchSite: string | null;
  country: string | null;
};

export type SiteIdentity = {
  siteName: string;
  siteUrl: string;
};

const ADMIN_SUBJECT = "ホームページからの問い合わせ";
const HEADER_VALUE_MAX_LENGTH = 200;

const AUTO_REPLY_SKIP_LABELS = {
  quarantined: "隔離のため",
  recipient_limit: "同じ宛先への送信上限",
  global_limit: "1 日の送信上限",
  limiter_unavailable: "送信上限を確認できない"
} as const;

const formatHeaderValue = (value: string | null): string => {
  if (value === null) return "(なし)";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, HEADER_VALUE_MAX_LENGTH);
};

type AdminMailInput = {
  name: string;
  email: string;
  inquiry: string;
  reasons: ReasonCode[];
  score: number | null;
  diagnostics: Diagnostics;
  autoReply: AutoReplyDecision;
  recaptchaDetail: string | null;
  storeDetail: string | null;
  // 隔離通知が上限に達したときの区分（強い兆候ありか）。達していなければ null
  quarantineLimitReached: { strong: boolean } | null;
};

// text/plain なので入力値はエスケープせずにそのまま載せる
export const buildAdminMail = (input: AdminMailInput): { subject: string; text: string } => {
  const quarantined = input.reasons.length > 0;
  const subject = quarantined ? `[要確認:${input.reasons[0]}] ${ADMIN_SUBJECT}` : ADMIN_SUBJECT;
  const lead = quarantined
    ? [
        "bot の可能性があるため、自動返信は送っていません。",
        "メールアドレスは第三者のものの可能性があります。返信する前に内容を確認してください。",
        ...(input.quarantineLimitReached
          ? [
              input.quarantineLimitReached.strong
                ? `本日の隔離通知（bot の強い兆候あり）が上限（${SEND_QUOTA.quarantineStrong} 件）に達しました。以降、同じ区分の問い合わせは通知せずに破棄します。`
                : `本日の隔離通知（弱い理由のみ）が上限（${SEND_QUOTA.quarantineWeak} 件）に達しました。以降、同じ区分の問い合わせは通知せずに破棄します。`
            ]
          : [])
      ]
    : ["返信をお願いします。"];
  const autoReply = input.autoReply.send
    ? "送る"
    : `送らない（${AUTO_REPLY_SKIP_LABELS[input.autoReply.reason]}）`;
  const { diagnostics } = input;
  const text = [
    "ホームページから問い合わせがありました。",
    ...lead,
    "",
    `お名前　　　　：${input.name} 様`,
    `メールアドレス：${input.email}`,
    "問い合わせ内容：",
    input.inquiry,
    "",
    "―――― 診断情報 ――――",
    `判定　　　　　：${quarantined ? "隔離" : "合格"}`,
    `理由コード　　：${quarantined ? input.reasons.join(", ") : "(なし)"}`,
    `reCAPTCHA score：${input.score ?? "(なし)"}`,
    `reCAPTCHA 詳細 ：${formatHeaderValue(input.recaptchaDetail)}`,
    `送信上限ストア：${formatHeaderValue(input.storeDetail ?? "正常")}`,
    `自動返信　　　：${autoReply}`,
    `User-Agent　　：${formatHeaderValue(diagnostics.userAgent)}`,
    `Origin　　　　：${formatHeaderValue(diagnostics.origin)}`,
    `Sec-Fetch-Site：${formatHeaderValue(diagnostics.secFetchSite)}`,
    `国　　　　　　：${formatHeaderValue(diagnostics.country)}`
  ].join("\n");
  return { subject, text };
};

// 第三者に届きうるメールなので、入力値を受け取らない（引用できない）形にしている
export const buildAutoReplyMail = (site: SiteIdentity): { subject: string; text: string } => ({
  subject: `【${site.siteName}】お問い合わせを受け付けました`,
  text: [
    "お問い合わせいただいた方へ",
    "",
    `${site.siteName} の問い合わせフォームからのお問い合わせを受け付けました。`,
    "内容を確認のうえ、折り返しご連絡いたします。",
    "お心当たりのない場合は、このメールを破棄してください。",
    "",
    "We have received your inquiry and will get back to you shortly.",
    "If you did not send this inquiry, please disregard this email.",
    "",
    "このメールは送信専用です。返信はできません。",
    "This is a send-only address. Please do not reply.",
    "",
    "――――――――――――――――",
    site.siteName,
    site.siteUrl
  ].join("\n")
});

// ---- 受付の本体 ----

export type OutgoingMail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type ContactInput = {
  name: string;
  email: string;
  inquiry: string;
  // JSON の本文そのもの。bot 判定用の欄（トークン・ハニーポット）はここから読む
  raw: Record<string, unknown>;
  headers: Headers;
  host: string;
};

export type ContactDeps = {
  config: GuardConfig;
  fetchFn: typeof fetch;
  // 失敗時は throw する
  sendMail: (mail: OutgoingMail) => Promise<void>;
  now: () => number;
  // 破棄の経路で応答時間をそろえるための待ち。未指定なら setTimeout で待つ
  pause?: (ms: number) => Promise<void>;
  mailFrom: string;
  adminAddress: string;
  site: SiteIdentity;
  log: (event: string, fields: Record<string, unknown>) => void;
};

// 破棄の経路の待ち時間。Resend への管理者通知の往復（数百 ms）に近い幅でばらつかせる
const DROP_PAUSE_MIN_MS = 250;
const DROP_PAUSE_JITTER_MS = 400;

const defaultPause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type ContactOutcome = {
  status: 200 | 500;
  // 応答の後に 1 回だけ実行する自動返信。中で throw しない
  deferred: (() => Promise<void>) | null;
};

export const processSubmission = async (
  input: ContactInput,
  deps: ContactDeps
): Promise<ContactOutcome> => {
  const { config } = deps;
  const now = deps.now();
  const origin = input.headers.get("origin");

  // 形の整ったトークンがあれば他の判定に関係なく siteverify を呼び、応答時間から判定が漏れないようにする
  const recaptcha = await verifyRecaptcha(input.raw[RECAPTCHA_TOKEN_FIELD], {
    secret: config.recaptchaSecret,
    minScore: config.minScore,
    allowedHostnames: config.allowedHostnames,
    now,
    fetchFn: deps.fetchFn
  });
  const reasons = orderReasons([
    ...recaptcha.reasons,
    ...collectFormReasons(
      { raw: input.raw, name: input.name, inquiry: input.inquiry, origin, host: input.host },
      config
    )
  ]);
  const quarantined = reasons.length > 0;
  deps.log("contact_verdict", { reasons, score: recaptcha.score, detail: recaptcha.detail });

  let autoReply: AutoReplyDecision;
  let quarantineLimitReached: { strong: boolean } | null = null;
  let storeDetail: string | null;
  if (quarantined) {
    const strong = hasStrongBotSignal(reasons);
    const store = await incrDailyCounts(
      [quarantineQuotaKey(now, strong)],
      config.store,
      deps.fetchFn
    );
    storeDetail = store.detail;
    if (storeDetail !== null) deps.log("contact_store_unavailable", { detail: storeDetail });
    const notice = decideQuarantineNotice(store.counts, strong);
    if (notice === "drop") {
      deps.log("contact_quarantine_dropped", { reasons });
      // 管理者通知の送信を飛ばすぶん応答が速くなり、判定が外から分かるので待ってから返す
      await (deps.pause ?? defaultPause)(
        DROP_PAUSE_MIN_MS + Math.floor(Math.random() * DROP_PAUSE_JITTER_MS)
      );
      return { status: 200, deferred: null };
    }
    if (notice === "notify_limit_reached") quarantineLimitReached = { strong };
    autoReply = { send: false, reason: "quarantined" };
  } else {
    // 管理者通知に送否を書くため、通知より先に上限を消費する
    const store = await incrDailyCounts(
      autoReplyQuotaKeys(input.email, now),
      config.store,
      deps.fetchFn
    );
    storeDetail = store.detail;
    if (storeDetail !== null) deps.log("contact_store_unavailable", { detail: storeDetail });
    autoReply = decideAutoReply(store.counts);
  }

  const adminMail = buildAdminMail({
    name: input.name,
    email: input.email,
    inquiry: input.inquiry,
    reasons,
    score: recaptcha.score,
    diagnostics: {
      userAgent: input.headers.get("user-agent"),
      origin,
      secFetchSite: input.headers.get("sec-fetch-site"),
      country: input.headers.get("x-vercel-ip-country")
    },
    autoReply,
    recaptchaDetail: recaptcha.detail,
    storeDetail,
    quarantineLimitReached
  });
  try {
    await deps.sendMail({
      from: `${deps.site.siteName} - system <${deps.mailFrom}>`,
      to: deps.adminAddress,
      ...adminMail,
      // 隔離した問い合わせのアドレスは第三者のものかもしれないので、返信ボタンで送れないようにする
      ...(quarantined ? {} : { replyTo: input.email })
    });
  } catch (err) {
    deps.log("contact_admin_notice_failed", {
      message: err instanceof Error ? err.message : String(err)
    });
    return { status: 500, deferred: null };
  }

  if (!autoReply.send) return { status: 200, deferred: null };
  const autoReplyMail: OutgoingMail = {
    from: `${deps.site.siteName} <${deps.mailFrom}>`,
    to: input.email,
    ...buildAutoReplyMail(deps.site)
  };
  return {
    status: 200,
    deferred: async () => {
      try {
        await deps.sendMail(autoReplyMail);
      } catch (err) {
        deps.log("contact_autoreply_failed", {
          message: err instanceof Error ? err.message : String(err)
        });
      }
    }
  };
};
