import { describe, expect, it } from "vitest";
import { checkTokenShape, judgeSiteverify, verifyRecaptcha } from "./recaptcha";
import { SITE_HOST, TEST_TOKEN, siteverifyReply } from "./testing/contact-backend";

const NOW = Date.parse("2026-10-07T12:00:00Z");
const judgeOpts = { minScore: 0.5, allowedHostnames: [SITE_HOST, `www.${SITE_HOST}`], now: NOW };
const okReply = (over: Record<string, unknown> = {}) => siteverifyReply(NOW, over);

describe("checkTokenShape", () => {
  it.each([
    ["undefined", "recaptcha_missing_token", undefined],
    ["空文字", "recaptcha_missing_token", ""],
    ["null", "recaptcha_malformed_token", null],
    ["4097 文字", "recaptcha_malformed_token", "A".repeat(4097)],
    ["4096 文字", null, "A".repeat(4096)],
    ["&secret= を含む", "recaptcha_malformed_token", "x&secret=ATTACKER"],
    ["base64url", null, "03AF_c-We9"]
  ])("%s → %s", (_label, expected, token) => {
    expect(checkTokenShape(token)).toBe(expected);
  });
});

describe("judgeSiteverify", () => {
  it("合格の応答は理由コードなし", () => {
    expect(judgeSiteverify(okReply(), judgeOpts)).toEqual({
      reasons: [],
      score: 0.9,
      detail: null
    });
  });

  it.each<[string, unknown, string[]]>([
    ["score がちょうど合格スコア（0.5）", okReply({ score: 0.5 }), []],
    ["score 0.49", okReply({ score: 0.49 }), ["recaptcha_low_score"]],
    ["score 0.3", okReply({ score: 0.3 }), ["recaptcha_low_score"]],
    ["オブジェクトでない", "x", ["recaptcha_unexpected_response"]],
    ["配列", [], ["recaptcha_unexpected_response"]],
    ["未知のキー", okReply({ message: "quota" }), ["recaptcha_unexpected_response"]],
    ["空の error-codes", okReply({ "error-codes": [] }), []],
    ["error-codes あり", okReply({ "error-codes": ["x"] }), ["recaptcha_not_success"]],
    ["score が文字列", okReply({ score: "0.9" }), ["recaptcha_no_score"]],
    ["action 不一致", okReply({ action: "login" }), ["recaptcha_action_mismatch"]],
    ["hostname 不一致", okReply({ hostname: "evil.example" }), ["recaptcha_hostname_mismatch"]],
    [
      "challenge_ts がちょうど 5 分前",
      okReply({ challenge_ts: new Date(NOW - 5 * 60_000).toISOString() }),
      []
    ],
    [
      "challenge_ts が 5 分 + 1 ms 前",
      okReply({ challenge_ts: new Date(NOW - 5 * 60_000 - 1).toISOString() }),
      ["recaptcha_stale"]
    ],
    [
      "challenge_ts が 10 分前",
      okReply({ challenge_ts: new Date(NOW - 10 * 60_000).toISOString() }),
      ["recaptcha_stale"]
    ],
    ["challenge_ts が読めない", okReply({ challenge_ts: "yesterday" }), ["recaptcha_stale"]]
  ])("%s", (_label, reply, expected) => {
    expect(judgeSiteverify(reply, judgeOpts).reasons).toEqual(expected);
  });

  it.each(["invalid-input-secret", "missing-input-secret"])(
    "秘密鍵のエラー %s は設定の問題（misconfigured）",
    (code) => {
      expect(
        judgeSiteverify({ success: false, "error-codes": [code] }, judgeOpts).reasons
      ).toContain("recaptcha_misconfigured");
    }
  );

  it("失敗応答の先頭は not_success、score なしは no_score", () => {
    expect(
      judgeSiteverify({ success: false, "error-codes": ["invalid-input-response"] }, judgeOpts)
        .reasons[0]
    ).toBe("recaptcha_not_success");
    expect(judgeSiteverify({ success: true }, judgeOpts).reasons[0]).toBe("recaptcha_no_score");
  });

  it("失敗の手がかりを detail に載せる", () => {
    expect(
      judgeSiteverify({ success: false, "error-codes": ["invalid-input-response", "x"] }, judgeOpts)
        .detail
    ).toBe("error-codes=invalid-input-response,x");
    expect(judgeSiteverify(okReply({ message: "quota" }), judgeOpts).detail).toBe(
      "unknown-keys=message"
    );
  });
});

describe("verifyRecaptcha", () => {
  const replying =
    (response: () => Response | Promise<Response>) =>
    (calls: { count: number; body?: unknown }): typeof fetch =>
      (async (_input: RequestInfo | URL, init?: RequestInit) => {
        calls.count++;
        calls.body = init?.body;
        return response();
      }) as typeof fetch;
  const options = (fetchFn: typeof fetch) => ({ ...judgeOpts, secret: "S", fetchFn });

  it.each([
    ["トークンなし", undefined, "S", "recaptcha_missing_token"],
    ["形の崩れたトークン", "x&secret=y", "S", "recaptcha_malformed_token"],
    ["秘密鍵なし", TEST_TOKEN, undefined, "recaptcha_misconfigured"]
  ])("%s は siteverify を呼ばない", async (_label, token, secret, code) => {
    const calls = { count: 0 };
    const fetchFn = replying(() => new Response("{}"))(calls);
    const result = await verifyRecaptcha(token, { ...options(fetchFn), secret });
    expect(result.reasons).toEqual([code]);
    expect(calls.count).toBe(0);
  });

  it("合格の応答を判定し、secret と response を 1 つずつ送る", async () => {
    const calls: { count: number; body?: unknown } = { count: 0 };
    const fetchFn = replying(() => new Response(JSON.stringify(okReply())))(calls);
    expect(await verifyRecaptcha("tok_en-1", options(fetchFn))).toEqual({
      reasons: [],
      score: 0.9,
      detail: null
    });
    const params = new URLSearchParams(String(calls.body));
    expect([params.getAll("secret"), params.getAll("response")]).toEqual([["S"], ["tok_en-1"]]);
  });

  it("時間内に応答が無ければ unavailable", async () => {
    const hang = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      })) as typeof fetch;
    expect(await verifyRecaptcha(TEST_TOKEN, { ...options(hang), timeoutMs: 50 })).toEqual({
      reasons: ["recaptcha_unavailable"],
      score: null,
      detail: "error=TimeoutError"
    });
  });

  it("通信の例外は unavailable", async () => {
    const fetchFn = (async () => {
      throw new Error("net");
    }) as typeof fetch;
    expect((await verifyRecaptcha(TEST_TOKEN, options(fetchFn))).reasons).toEqual([
      "recaptcha_unavailable"
    ]);
  });

  it("200 以外は HTTP ステータスを detail に載せる", async () => {
    const fetchFn = replying(() => new Response("x", { status: 500 }))({ count: 0 });
    expect(await verifyRecaptcha(TEST_TOKEN, options(fetchFn))).toEqual({
      reasons: ["recaptcha_unavailable"],
      score: null,
      detail: "http=500"
    });
  });

  it("JSON でない応答は unexpected_response", async () => {
    const fetchFn = replying(() => new Response("<html>"))({ count: 0 });
    expect((await verifyRecaptcha(TEST_TOKEN, options(fetchFn))).reasons).toEqual([
      "recaptcha_unexpected_response"
    ]);
  });
});
