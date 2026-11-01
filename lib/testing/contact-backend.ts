// 問い合わせの判定が呼ぶ外部サービス（reCAPTCHA siteverify と Upstash REST）の偽物。
// *.test.ts からだけ import する（本番のコードから import しない）

// 本番の定数を import すると本番側の URL の誤りに気づけないので、ここに直接書く
const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export const SITE_HOST = "yuuki1036.com";
// 同値分割表の「トークン = 正常」の代表値
export const TEST_TOKEN = "A".repeat(2190);
export const STORE_URL = "https://store.example";
export const STORE_TOKEN = "st";

// processSubmission の config と route の env の両方で、この偽物に向ける
export const BACKEND_ENV = {
  RECAPTCHA_SERVER_SECRET_KEY: "S",
  UPSTASH_REDIS_REST_URL: STORE_URL,
  UPSTASH_REDIS_REST_TOKEN: STORE_TOKEN
};

// 合格する siteverify の応答（challenge_ts は now の 10 秒前）。
// now は判定に使う時計と同じものを渡す（processSubmission のテストは固定時刻、route は Date.now()）
export const siteverifyReply = (
  now: number,
  over: Record<string, unknown> = {}
): Record<string, unknown> => ({
  success: true,
  score: 0.9,
  action: "contact",
  hostname: SITE_HOST,
  challenge_ts: new Date(now - 10_000).toISOString(),
  ...over
});

export type ContactBackend = {
  fetch: typeof fetch;
  // hang にすると、呼び出し側の signal が abort されるまで応答しない
  siteverify: { reply: unknown; hang: boolean; calls: number };
  // counts は INCR したキーの値、commands は受け取ったコマンド列。
  // delayMs を付けると応答を遅らせ、fail で例外を投げる。reply を入れると、数えずにその値をそのまま返す
  store: {
    counts: Map<string, number>;
    commands: string[][];
    delayMs: number;
    fail: boolean;
    reply: unknown;
    calls: number;
  };
};

// abort されたら reject する。signal が無ければ決着しない（呼び出し側が時間切れを付け忘れると
// テストの timeout で落ち、例外として吸収されて素通りすることがない）
const abortError = (signal: AbortSignal | null | undefined): Promise<never> =>
  new Promise((_resolve, reject) => {
    if (!signal) return;
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });

export const createContactBackend = (init: { siteverifyReply: unknown }): ContactBackend => {
  const siteverify = { reply: init.siteverifyReply, hang: false, calls: 0 };
  const store = {
    counts: new Map<string, number>(),
    commands: [] as string[][],
    delayMs: 0,
    fail: false,
    reply: undefined as unknown,
    calls: 0
  };

  const pipeline = async (requestInit: RequestInit | undefined): Promise<Response> => {
    store.calls++;
    if (new Headers(requestInit?.headers).get("authorization") !== `Bearer ${STORE_TOKEN}`) {
      return new Response("unauthorized", { status: 401 });
    }
    if (store.fail) throw new Error("store down");
    if (store.delayMs > 0) {
      const signal = requestInit?.signal;
      let timer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        new Promise((resolve) => {
          timer = setTimeout(resolve, store.delayMs);
        }),
        abortError(signal)
      ]).finally(() => clearTimeout(timer));
    }
    const commands = JSON.parse(String(requestInit?.body)) as string[][];
    store.commands.push(...commands);
    if (store.reply !== undefined) return Response.json(store.reply);
    const results = commands.map(([command, key = ""]) => {
      if (command === "INCR") {
        const value = (store.counts.get(key) ?? 0) + 1;
        store.counts.set(key, value);
        return { result: value };
      }
      if (command === "EXPIRE") return { result: 1 };
      return { error: `unknown command ${command}` };
    });
    return Response.json(results);
  };

  const fakeFetch = async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url === SITEVERIFY_URL) {
      siteverify.calls++;
      if (siteverify.hang) return abortError(requestInit?.signal);
      return new Response(JSON.stringify(siteverify.reply));
    }
    if (url === `${STORE_URL}/pipeline`) return pipeline(requestInit);
    // 外への通信を塞ぐ
    throw new Error(`fake backend: 想定外の URL ${url}`);
  };

  return { fetch: fakeFetch as typeof fetch, siteverify, store };
};
