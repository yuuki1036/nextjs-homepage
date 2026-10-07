import type { ReasonCode } from "./contact-guard";

// クライアントからも import するので、サーバー専用のモジュールを runtime import しないこと
export const RECAPTCHA_ACTION = "contact";
export const RECAPTCHA_TOKEN_FIELD = "recaptchaToken";

const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SITEVERIFY_TIMEOUT_MS = 3000;
const TOKEN_MAX_LENGTH = 4096;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;
// Google のトークン有効期間（2 分）に時計のずれを見込んだ値
const MAX_TOKEN_AGE_MS = 5 * 60 * 1000;
// 無料枠超過時などの想定外の応答形を合格扱いにしないため、既知のキー以外は不合格にする
const KNOWN_RESPONSE_KEYS = new Set([
  "success",
  "score",
  "action",
  "hostname",
  "challenge_ts",
  "error-codes"
]);

export type RecaptchaResult = {
  reasons: ReasonCode[];
  score: number | null;
  // 失敗の手がかり（error-codes・HTTP ステータス・例外名）。設定ミスと bot を見分けるために管理者通知へ載せる
  detail: string | null;
};

// 秘密鍵の誤りは bot ではなく設定の問題なので、misconfigured として扱う
const SECRET_ERROR_CODES = ["missing-input-secret", "invalid-input-secret"];

type JudgeOptions = {
  minScore: number;
  allowedHostnames: string[];
  now: number;
};

type VerifyOptions = JudgeOptions & {
  secret: string | undefined;
  fetchFn: typeof fetch;
  timeoutMs?: number;
};

export const checkTokenShape = (token: unknown): ReasonCode | null => {
  if (token === undefined || token === "") return "recaptcha_missing_token";
  if (typeof token !== "string") return "recaptcha_malformed_token";
  if (token.length > TOKEN_MAX_LENGTH || !TOKEN_PATTERN.test(token)) {
    return "recaptcha_malformed_token";
  }
  return null;
};

export const judgeSiteverify = (json: unknown, options: JudgeOptions): RecaptchaResult => {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { reasons: ["recaptcha_unexpected_response"], score: null, detail: "not-an-object" };
  }
  const response = json as Record<string, unknown>;
  const reasons: ReasonCode[] = [];
  const details: string[] = [];

  const unknownKeys = Object.keys(response).filter((key) => !KNOWN_RESPONSE_KEYS.has(key));
  if (unknownKeys.length > 0) {
    reasons.push("recaptcha_unexpected_response");
    details.push(`unknown-keys=${unknownKeys.join(",")}`);
  }

  const errorCodes = response["error-codes"];
  const hasErrorCodes =
    errorCodes !== undefined && !(Array.isArray(errorCodes) && errorCodes.length === 0);
  if (response.success !== true || hasErrorCodes) reasons.push("recaptcha_not_success");
  if (hasErrorCodes) {
    const codes = Array.isArray(errorCodes) ? errorCodes.map(String) : [String(errorCodes)];
    details.push(`error-codes=${codes.join(",")}`);
    if (codes.some((code) => SECRET_ERROR_CODES.includes(code))) {
      reasons.push("recaptcha_misconfigured");
    }
  }

  const score =
    typeof response.score === "number" && Number.isFinite(response.score) ? response.score : null;
  if (score === null) reasons.push("recaptcha_no_score");
  else if (score < options.minScore) reasons.push("recaptcha_low_score");

  if (response.action !== RECAPTCHA_ACTION) reasons.push("recaptcha_action_mismatch");

  if (
    typeof response.hostname !== "string" ||
    !options.allowedHostnames.includes(response.hostname)
  ) {
    reasons.push("recaptcha_hostname_mismatch");
  }

  const issuedAt =
    typeof response.challenge_ts === "string" ? Date.parse(response.challenge_ts) : Number.NaN;
  if (Number.isNaN(issuedAt) || options.now - issuedAt > MAX_TOKEN_AGE_MS) {
    reasons.push("recaptcha_stale");
  }

  return { reasons, score, detail: details.length > 0 ? details.join("; ") : null };
};

// 例外は投げず、検証できなかった理由も理由コードとして返す（fail-closed）
export const verifyRecaptcha = async (
  token: unknown,
  options: VerifyOptions
): Promise<RecaptchaResult> => {
  const shapeReason = checkTokenShape(token);
  if (shapeReason !== null || typeof token !== "string") {
    return { reasons: [shapeReason ?? "recaptcha_malformed_token"], score: null, detail: null };
  }
  if (!options.secret) {
    return { reasons: ["recaptcha_misconfigured"], score: null, detail: "secret-not-set" };
  }

  const unavailable = (detail: string): RecaptchaResult => ({
    reasons: ["recaptcha_unavailable"],
    score: null,
    detail
  });
  let text: string;
  try {
    const res = await options.fetchFn(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: options.secret, response: token }),
      signal: AbortSignal.timeout(options.timeoutMs ?? SITEVERIFY_TIMEOUT_MS)
    });
    if (res.status !== 200) return unavailable(`http=${res.status}`);
    text = await res.text();
  } catch (err) {
    return unavailable(`error=${err instanceof Error ? err.name : "unknown"}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { reasons: ["recaptcha_unexpected_response"], score: null, detail: "invalid-json" };
  }
  return judgeSiteverify(json, options);
};
