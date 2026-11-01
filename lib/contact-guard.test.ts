import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  autoReplyQuotaKeys,
  decideAutoReply,
  decideQuarantineNotice,
  hasHoneypotValue,
  hasStrongBotSignal,
  isOriginMismatch,
  isRandomAlpha,
  loadGuardConfig,
  orderReasons,
  processSubmission,
  quarantineQuotaKey,
  toRecipientKey,
  type ContactDeps,
  type ContactInput,
  type GuardConfig,
  type OutgoingMail,
  type ReasonCode
} from "./contact-guard";
import {
  BACKEND_ENV,
  SITE_HOST,
  STORE_URL,
  TEST_TOKEN,
  createContactBackend,
  siteverifyReply
} from "./testing/contact-backend";

const NOW = Date.parse("2026-10-07T12:00:00Z");
const ADMIN = "owner@example.invalid";
const ADMIN_SUBJECT = "ホームページからの問い合わせ";
const quarantinedSubject = (code: ReasonCode) => `[要確認:${code}] ${ADMIN_SUBJECT}`;

// 観測した bot の名前と本文（spec の同値分割表「ランダム英字」）
const RANDOM_PAIRS = [
  ["gdBMwxGSWLEOeDjYMJ", "AJqeHRsKIjkJgeCT"],
  ["XTZQJIAygIMUTybRQzH", "gRXVwaqhZzJdWbRgCzZR"],
  ["eCSLGCxaOJklyhtutbaQ", "oEssVoBEwNFqtiYKw"],
  ["pbRHNjXzohpENEkoF", "MVhSCMJUbCxTKRlSy"]
] as const;
const [SPAM_NAME, SPAM_INQUIRY] = RANDOM_PAIRS[0];

const STRONG_REASONS: ReasonCode[] = [
  "recaptcha_malformed_token",
  "honeypot",
  "random_alpha",
  "origin_mismatch",
  "origin_missing"
];
const WEAK_REASONS: ReasonCode[] = [
  "recaptcha_missing_token",
  "recaptcha_low_score",
  "recaptcha_unavailable",
  "recaptcha_misconfigured",
  "recaptcha_not_success",
  "recaptcha_no_score",
  "recaptcha_stale",
  "recaptcha_unexpected_response",
  "recaptcha_action_mismatch",
  "recaptcha_hostname_mismatch"
];

describe("bot 判定の部品", () => {
  it.each(RANDOM_PAIRS)("ランダム英字 %s / %s", (name, inquiry) => {
    expect(isRandomAlpha(name, 12, 3)).toBe(true);
    expect(isRandomAlpha(inquiry, 12, 3)).toBe(true);
  });

  it.each([
    "John Smith",
    "McDonald",
    "Christopherson",
    "Hello",
    "I'd like to ask about a web development project.",
    "山田 太郎"
  ])("ランダム英字にしない: %s", (text) => {
    expect(isRandomAlpha(text, 12, 3)).toBe(false);
  });

  it.each<[string | null, boolean]>([
    [null, false],
    ["https://yuuki1036.com", false],
    ["https://evil.example", true],
    ["null", true]
  ])("Origin %s は不一致 = %s", (origin, expected) => {
    expect(isOriginMismatch(origin, SITE_HOST)).toBe(expected);
  });

  it.each<[unknown, boolean]>([
    ["", false],
    ["  ", false],
    ["x", true],
    [0, true]
  ])("ハニーポットの値 %j は入力あり = %s", (value, expected) => {
    expect(hasHoneypotValue(value)).toBe(expected);
  });

  it("理由コードは件名に載せる優先順に並べる", () => {
    expect(orderReasons(["origin_mismatch", "honeypot", "recaptcha_missing_token"])).toEqual([
      "recaptcha_missing_token",
      "honeypot",
      "origin_mismatch"
    ]);
  });

  it.each(STRONG_REASONS)("強い bot 信号: %s", (reason) => {
    expect(hasStrongBotSignal([reason])).toBe(true);
  });

  it.each(WEAK_REASONS)("強い bot 信号ではない: %s", (reason) => {
    expect(hasStrongBotSignal([reason])).toBe(false);
  });
});

describe("loadGuardConfig（env の上書きと既定値）", () => {
  it("未設定なら既定値", () => {
    expect(loadGuardConfig({}, SITE_HOST)).toEqual({
      recaptchaSecret: undefined,
      minScore: 0.5,
      allowedHostnames: [SITE_HOST, `www.${SITE_HOST}`],
      honeypotField: "subject",
      randomAlphaMinLength: 12,
      randomAlphaMinCase: 3,
      store: null
    });
  });

  it("env で上書きできる", () => {
    const config = loadGuardConfig(
      {
        RECAPTCHA_MIN_SCORE: "0.7",
        RECAPTCHA_ALLOWED_HOSTNAMES: " A.example , b.example ",
        CONTACT_HONEYPOT_FIELD: "fax_no",
        CONTACT_RANDOM_ALPHA_MIN_LENGTH: "16",
        CONTACT_RANDOM_ALPHA_MIN_CASE: "4",
        KV_REST_API_URL: "https://kv",
        KV_REST_API_TOKEN: "kt"
      },
      SITE_HOST
    );
    expect(config).toMatchObject({
      minScore: 0.7,
      allowedHostnames: ["a.example", "b.example"],
      honeypotField: "fax_no",
      randomAlphaMinLength: 16,
      randomAlphaMinCase: 4,
      store: { url: "https://kv", token: "kt" }
    });
  });

  it("不正な値は既定値に戻す（URL と TOKEN の組が揃わないストアは未設定）", () => {
    const config = loadGuardConfig(
      {
        RECAPTCHA_MIN_SCORE: "2",
        CONTACT_HONEYPOT_FIELD: "email",
        CONTACT_RANDOM_ALPHA_MIN_LENGTH: "-1",
        UPSTASH_REDIS_REST_URL: "https://u",
        KV_REST_API_TOKEN: "kt"
      },
      SITE_HOST
    );
    expect(config).toMatchObject({
      minScore: 0.5,
      honeypotField: "subject",
      randomAlphaMinLength: 12,
      store: null
    });
  });

  it("空の合格スコアは既定値", () => {
    expect(loadGuardConfig({ RECAPTCHA_MIN_SCORE: "" }, SITE_HOST).minScore).toBe(0.5);
  });

  it("UPSTASH_* の組を KV_* より先に使う", () => {
    const config = loadGuardConfig(
      {
        UPSTASH_REDIS_REST_URL: "https://u",
        UPSTASH_REDIS_REST_TOKEN: "ut",
        KV_REST_API_URL: "https://kv",
        KV_REST_API_TOKEN: "kt"
      },
      SITE_HOST
    );
    expect(config.store).toEqual({ url: "https://u", token: "ut" });
  });
});

describe("送信上限の判定", () => {
  it.each([
    ["Gmail のドットと + 以降", "Ta.Ro+x@gmail.com", "taro@gmail.com"],
    ["googlemail.com は gmail.com", "t.a.r.o@GoogleMail.com", "taro@gmail.com"],
    ["Gmail 以外はドットを残す", "Ta.ro+news@Example.com", "ta.ro@example.com"]
  ])("宛先キー: %s", (_label, email, expected) => {
    expect(toRecipientKey(email)).toBe(expected);
  });

  it.each<[number[] | null, ReturnType<typeof decideAutoReply>]>([
    [null, { send: false, reason: "limiter_unavailable" }],
    [[1, 10], { send: true }],
    [[1, 11], { send: false, reason: "global_limit" }],
    [[2, 3], { send: false, reason: "recipient_limit" }]
  ])("自動返信: カウント %j", (counts, expected) => {
    expect(decideAutoReply(counts)).toEqual(expected);
  });

  it.each<[number[] | null, boolean, ReturnType<typeof decideQuarantineNotice>]>([
    [null, true, "notify"],
    [[19], true, "notify"],
    [[20], true, "notify_limit_reached"],
    [[21], true, "drop"],
    [[49], false, "notify"],
    [[50], false, "notify_limit_reached"],
    [[51], false, "drop"],
    [null, false, "notify"]
  ])("隔離通知: カウント %j・強い = %s → %s", (counts, strong, expected) => {
    expect(decideQuarantineNotice(counts, strong)).toBe(expected);
  });
});

// ---- processSubmission ----

type InputOverrides = {
  fields?: Partial<Pick<ContactInput, "name" | "email" | "inquiry">>;
  raw?: Record<string, unknown>;
  headers?: Headers;
};

type DepsOverrides = Partial<Omit<ContactDeps, "config">> & { config?: Partial<GuardConfig> };

const browserHeaders = (over: Record<string, string> = {}) =>
  new Headers({
    origin: `https://${SITE_HOST}`,
    "user-agent": "Mozilla/5.0 Test",
    "sec-fetch-site": "same-origin",
    "x-vercel-ip-country": "JP",
    ...over
  });

const contactInput = (over: InputOverrides = {}): ContactInput => {
  const fields = {
    name: "山田 太郎",
    email: "o'brien@example.com",
    inquiry: `<b>Tom & Jerry's "x"</b>\n2 行目`,
    ...over.fields
  };
  return {
    ...fields,
    raw: { ...fields, recaptchaToken: TEST_TOKEN, subject: "", ...over.raw },
    headers: over.headers ?? browserHeaders(),
    host: SITE_HOST
  };
};

// テストごとに作り直す（偽物の状態・送ったメール・ログ）
const createWorld = () => {
  const backend = createContactBackend({ siteverifyReply: siteverifyReply(NOW) });
  const sent: OutgoingMail[] = [];
  const logs: ({ event: string } & Record<string, unknown>)[] = [];
  const pauses: number[] = [];
  const baseConfig = loadGuardConfig(BACKEND_ENV, SITE_HOST);

  const deps = ({ config, ...over }: DepsOverrides = {}): ContactDeps => ({
    config: { ...baseConfig, ...config },
    fetchFn: backend.fetch,
    sendMail: async (mail) => {
      sent.push(mail);
    },
    now: () => NOW,
    mailFrom: "noreply@yuuki1036.com",
    adminAddress: ADMIN,
    site: { siteName: "yuuki1036", siteUrl: `https://${SITE_HOST}` },
    log: (event, fields) => {
      logs.push({ event, ...fields });
    },
    pause: async (ms) => {
      pauses.push(ms);
    },
    ...over
  });

  const submit = (input: InputOverrides = {}, over: DepsOverrides = {}) =>
    processSubmission(contactInput(input), deps(over));

  return { backend, sent, logs, pauses, submit };
};

const admin = (sent: OutgoingMail[]) => {
  const [mail] = sent;
  if (!mail) throw new Error("管理者通知が送られていない");
  return mail;
};

describe("processSubmission", () => {
  describe("Scenario 1: 合格した問い合わせは管理者通知が届き、自動返信が送られる", () => {
    it("管理者通知は入力値をそのまま載せ、返信先は送信者", async () => {
      const { sent, backend, submit } = createWorld();
      const out = await submit();
      expect(out.status).toBe(200);
      expect(sent).toHaveLength(1);
      const mail = admin(sent);
      expect(mail.subject).toBe(ADMIN_SUBJECT);
      expect(mail.replyTo).toBe("o'brien@example.com");
      expect(mail.from).toBe("yuuki1036 - system <noreply@yuuki1036.com>");
      expect(mail.to).toBe(ADMIN);
      expect(mail.text).toContain("山田 太郎 様");
      expect(mail.text).toContain("o'brien@example.com");
      expect(mail.text).toContain(`<b>Tom & Jerry's "x"</b>`);
      expect(mail.text.split("\n")).toEqual(
        expect.arrayContaining([
          "判定　　　　　：合格",
          "reCAPTCHA score：0.9",
          "自動返信　　　：送る",
          "User-Agent　　：Mozilla/5.0 Test",
          `Origin　　　　：https://${SITE_HOST}`,
          "Sec-Fetch-Site：same-origin",
          "国　　　　　　：JP"
        ])
      );
      expect(backend.store.calls).toBe(1);
    });

    it("自動返信は応答の後に送り、入力値を引用しない", async () => {
      const { sent, submit } = createWorld();
      const out = await submit();
      expect(out.deferred).toBeTypeOf("function");
      await out.deferred?.();
      expect(sent).toHaveLength(2);
      const reply = sent[1];
      expect(reply?.to).toBe("o'brien@example.com");
      expect(reply?.subject).toBe("【yuuki1036】お問い合わせを受け付けました");
      expect(reply?.replyTo).toBeUndefined();
      for (const quoted of ["山田", "Tom", "o'brien", "owner@"]) {
        expect(reply?.text).not.toContain(quoted);
      }
    });
  });

  describe("Scenario 2: 理由コードが付いた問い合わせは隔離される", () => {
    type QuarantineCase = {
      label: string;
      code: ReasonCode;
      input?: InputOverrides;
      config?: Partial<GuardConfig>;
      reply?: unknown;
      siteverifyCalls: 0 | 1;
    };
    const cases: QuarantineCase[] = [
      {
        label: "トークンなし",
        code: "recaptcha_missing_token",
        input: { raw: { recaptchaToken: undefined } },
        siteverifyCalls: 0
      },
      {
        label: "トークン 4097 文字",
        code: "recaptcha_malformed_token",
        input: { raw: { recaptchaToken: "A".repeat(4097) } },
        siteverifyCalls: 0
      },
      {
        label: "トークンに &secret=",
        code: "recaptcha_malformed_token",
        input: { raw: { recaptchaToken: "x&secret=y" } },
        siteverifyCalls: 0
      },
      {
        label: "秘密鍵なし",
        code: "recaptcha_misconfigured",
        config: { recaptchaSecret: undefined },
        siteverifyCalls: 0
      },
      {
        label: "siteverify の失敗応答",
        code: "recaptcha_not_success",
        reply: { success: false, "error-codes": ["invalid-input-response"] },
        siteverifyCalls: 1
      },
      {
        label: "score なし",
        code: "recaptcha_no_score",
        reply: { success: true },
        siteverifyCalls: 1
      },
      {
        label: "score 0.3",
        code: "recaptcha_low_score",
        reply: siteverifyReply(NOW, { score: 0.3 }),
        siteverifyCalls: 1
      },
      {
        label: "score 0.49",
        code: "recaptcha_low_score",
        reply: siteverifyReply(NOW, { score: 0.49 }),
        siteverifyCalls: 1
      },
      {
        label: "未知のキー",
        code: "recaptcha_unexpected_response",
        reply: siteverifyReply(NOW, { extra: 1 }),
        siteverifyCalls: 1
      },
      {
        label: "action login",
        code: "recaptcha_action_mismatch",
        reply: siteverifyReply(NOW, { action: "login" }),
        siteverifyCalls: 1
      },
      {
        label: "hostname evil.example",
        code: "recaptcha_hostname_mismatch",
        reply: siteverifyReply(NOW, { hostname: "evil.example" }),
        siteverifyCalls: 1
      },
      {
        label: "challenge_ts が 10 分前",
        code: "recaptcha_stale",
        reply: siteverifyReply(NOW, { challenge_ts: new Date(NOW - 600_000).toISOString() }),
        siteverifyCalls: 1
      },
      {
        label: "ハニーポット",
        code: "honeypot",
        input: { raw: { subject: "x" } },
        siteverifyCalls: 1
      },
      {
        label: "ランダム英字",
        code: "random_alpha",
        input: { fields: { name: SPAM_NAME, inquiry: SPAM_INQUIRY } },
        siteverifyCalls: 1
      },
      {
        label: "Origin が別ホスト",
        code: "origin_mismatch",
        input: { headers: browserHeaders({ origin: "https://evil.example" }) },
        siteverifyCalls: 1
      },
      {
        label: "Origin なし",
        code: "origin_missing",
        input: { headers: new Headers({ "user-agent": "curl/8.0" }) },
        siteverifyCalls: 1
      }
    ];

    it.each(cases)("$label → $code", async ({ code, input, config, reply, siteverifyCalls }) => {
      const { sent, backend, submit } = createWorld();
      if (reply !== undefined) backend.siteverify.reply = reply;
      const out = await submit(input, { config });
      expect(out.status).toBe(200);
      expect(out.deferred).toBeNull();
      expect(sent).toHaveLength(1);
      expect(admin(sent).subject).toBe(quarantinedSubject(code));
      expect(admin(sent).replyTo).toBeUndefined();
      expect(backend.store.calls).toBe(1);
      expect(backend.siteverify.calls).toBe(siteverifyCalls);
    });

    it("理由コードが複数なら、件名は先頭、本文は全件", async () => {
      const { sent, submit } = createWorld();
      await submit({ raw: { recaptchaToken: undefined, subject: "x" } });
      expect(admin(sent).subject).toBe(quarantinedSubject("recaptcha_missing_token"));
      expect(admin(sent).text).toContain("理由コード　　：recaptcha_missing_token, honeypot");
    });

    it.each([
      ["John Smith", "I'd like to ask about a web development project."],
      ["McDonald", "Hello"],
      ["MacGyverTheGreat", "Please contact me about a new site."]
    ])("正当な英語・CamelCase は隔離しない: %s", async (name, inquiry) => {
      const { sent, submit } = createWorld();
      await submit({ fields: { name, inquiry } });
      expect(admin(sent).subject).toBe(ADMIN_SUBJECT);
    });

    it("ハニーポットの欄名がプロトタイプのメンバー名でも誤判定しない", async () => {
      const { sent, submit } = createWorld();
      await submit({}, { config: { honeypotField: "constructor" } });
      expect(admin(sent).subject).toBe(ADMIN_SUBJECT);
    });

    it("siteverify の失敗理由を管理者通知とログに載せる", async () => {
      const { sent, logs, backend, submit } = createWorld();
      backend.siteverify.reply = { success: false, "error-codes": ["invalid-input-secret"] };
      const out = await submit();
      expect(out.status).toBe(200);
      expect(out.deferred).toBeNull();
      expect(sent).toHaveLength(1);
      expect(admin(sent).replyTo).toBeUndefined();
      expect(admin(sent).subject).toBe(quarantinedSubject("recaptcha_misconfigured"));
      expect(admin(sent).text).toContain("reCAPTCHA 詳細 ：error-codes=invalid-input-secret");
      expect(logs).toContainEqual(
        expect.objectContaining({
          event: "contact_verdict",
          detail: "error-codes=invalid-input-secret"
        })
      );
    });

    // siteverify の時間切れは注入できないので、実時間で 3 秒待つ
    it(
      "siteverify が 3 秒以内に応答しなければ unavailable で隔離する",
      { timeout: 10_000 },
      async () => {
        const { sent, backend, submit } = createWorld();
        backend.siteverify.hang = true;
        const started = performance.now();
        const out = await submit();
        const elapsed = performance.now() - started;
        expect(out.status).toBe(200);
        expect(out.deferred).toBeNull();
        expect(sent).toHaveLength(1);
        expect(admin(sent).replyTo).toBeUndefined();
        expect(admin(sent).subject).toBe(quarantinedSubject("recaptcha_unavailable"));
        expect(elapsed).toBeGreaterThanOrEqual(2900);
        expect(elapsed).toBeLessThan(3500);
      }
    );
  });

  describe("Scenario 3: 自動返信は送信上限を超えて送られない", () => {
    const repliesTo = (sent: OutgoingMail[], email: string) =>
      sent.filter((mail) => mail.to === email);

    it("全体のカウントが 9 なら送る", async () => {
      const { sent, backend, submit } = createWorld();
      const [, globalKey] = autoReplyQuotaKeys("a@example.com", NOW);
      backend.store.counts.set(globalKey, 9);
      const out = await submit({ fields: { email: "a@example.com" } });
      await out.deferred?.();
      expect(repliesTo(sent, "a@example.com")).toHaveLength(1);
      expect(admin(sent).text).toContain("自動返信　　　：送る");
    });

    it("全体のカウントが 10 なら送らず、管理者通知にそう書く", async () => {
      const { sent, backend, submit } = createWorld();
      const [, globalKey] = autoReplyQuotaKeys("b@example.com", NOW);
      backend.store.counts.set(globalKey, 10);
      const out = await submit({ fields: { email: "b@example.com" } });
      expect(out.status).toBe(200);
      expect(out.deferred).toBeNull();
      expect(admin(sent).subject).toBe(ADMIN_SUBJECT);
      expect(admin(sent).text).toContain("送らない（1 日の送信上限）");
    });

    it("同じ宛先（Gmail の正規化後）には 1 日 1 通まで", async () => {
      const { sent, backend, submit } = createWorld();
      const first = await submit({ fields: { email: "Ta.Ro+x@gmail.com" } });
      await first.deferred?.();
      expect(repliesTo(sent, "Ta.Ro+x@gmail.com")).toHaveLength(1);

      sent.length = 0;
      const second = await submit({ fields: { email: "taro@gmail.com" } });
      expect(second.deferred).toBeNull();
      expect(admin(sent).text).toContain("送らない（同じ宛先への送信上限）");
      // メールアドレスを外部ストアのキーに残さない
      for (const key of backend.store.counts.keys()) {
        expect(key).not.toContain("@");
        expect(key.toLowerCase()).not.toContain("taro");
      }
    });

    it("ストアが未設定なら送らない", async () => {
      const { sent, submit } = createWorld();
      const out = await submit({}, { config: { store: null } });
      expect(out.deferred).toBeNull();
      expect(admin(sent).text).toContain("送らない（送信上限を確認できない）");
      expect(admin(sent).text).toContain("送信上限ストア：not-configured");
    });

    it("ストアの認証が通らなければ送らない", async () => {
      const { sent, submit } = createWorld();
      const out = await submit({}, { config: { store: { url: STORE_URL, token: "wrong" } } });
      expect(out.deferred).toBeNull();
      expect(admin(sent).text).toContain("送信上限ストア：http=401");
      expect(admin(sent).text).toContain("送らない（送信上限を確認できない）");
    });

    it("ストアが例外を投げたら送らない", async () => {
      const { backend, submit } = createWorld();
      backend.store.fail = true;
      const out = await submit();
      expect(out.deferred).toBeNull();
    });

    it.each<[string, string, (results: unknown[]) => unknown]>([
      [
        "INCR の要素がエラー",
        "item-error",
        (results) => [{ error: "WRONGTYPE" }, ...results.slice(1)]
      ],
      ["要素数が足りない", "unexpected-shape", (results) => results.slice(1)],
      ["配列でない", "unexpected-shape", () => ({ result: 1 })]
    ])("ストアの応答が%sなら送らない（%s）", async (_label, detail, reshape) => {
      const { sent, backend, submit } = createWorld();
      // 正常な応答の形（INCR と EXPIRE が 2 キーぶん）を崩して返させる
      backend.store.reply = reshape([{ result: 1 }, { result: 1 }, { result: 1 }, { result: 1 }]);
      const out = await submit();
      expect(out.deferred).toBeNull();
      expect(admin(sent).text).toContain(`送信上限ストア：${detail}`);
      expect(admin(sent).text).toContain("送らない（送信上限を確認できない）");
    });

    it("ストアが使えるときは正常と書く", async () => {
      const { sent, submit } = createWorld();
      await submit();
      expect(admin(sent).text).toContain("送信上限ストア：正常");
    });

    // ストアの時間切れは注入できないので、実時間で 1 秒待つ
    it("ストアが 1 秒以内に応答しなければ送らない", { timeout: 10_000 }, async () => {
      const { sent, backend, submit } = createWorld();
      backend.store.delayMs = 1500;
      const started = performance.now();
      const out = await submit();
      const elapsed = performance.now() - started;
      expect(out.deferred).toBeNull();
      expect(admin(sent).text).toContain("送信上限ストア：error=TimeoutError");
      expect(admin(sent).text).toContain("送らない（送信上限を確認できない）");
      expect(elapsed).toBeGreaterThanOrEqual(900);
      expect(elapsed).toBeLessThan(1500);
    });

    it("ストアが 1 秒以内に応答すれば送る", { timeout: 10_000 }, async () => {
      const { backend, submit } = createWorld();
      backend.store.delayMs = 300;
      const out = await submit();
      expect(out.deferred).toBeTypeOf("function");
    });

    it("カウンタは INCR の後に 2 日の TTL を付ける", async () => {
      const { backend, submit } = createWorld();
      await submit({ fields: { email: "a@example.com" } });
      const [toKey, globalKey] = autoReplyQuotaKeys("a@example.com", NOW);
      expect(backend.store.commands).toEqual([
        ["INCR", toKey],
        ["EXPIRE", toKey, "172800"],
        ["INCR", globalKey],
        ["EXPIRE", globalKey, "172800"]
      ]);
    });

    it("全体のカウントは UTC の日付ごとに数え直す", async () => {
      const { sent, backend, submit } = createWorld();
      const nextDay = NOW + 24 * 60 * 60 * 1000;
      const [, todayKey] = autoReplyQuotaKeys("a@example.com", NOW);
      backend.store.counts.set(todayKey, 10);
      // 判定の時計を進めたら、siteverify の応答も同じ時計で作り直す（stale にしない）
      backend.siteverify.reply = siteverifyReply(nextDay);
      const out = await submit({ fields: { email: "a@example.com" } }, { now: () => nextDay });
      await out.deferred?.();
      expect(repliesTo(sent, "a@example.com")).toHaveLength(1);
    });

    it("自動返信の送信に失敗しても例外を投げず、ログに残す", async () => {
      const { logs, submit } = createWorld();
      let calls = 0;
      const out = await submit(
        {},
        {
          sendMail: async () => {
            calls++;
            if (calls === 2) throw new Error("resend error");
          }
        }
      );
      await expect(out.deferred?.()).resolves.toBeUndefined();
      expect(logs).toContainEqual({ event: "contact_autoreply_failed", message: "resend error" });
    });
  });

  describe("送信上限のキー", () => {
    // CI のランナーは UTC で動くので、UTC 以外の TZ にしてローカル日付の実装と見分ける
    beforeEach(() => {
      vi.stubEnv("TZ", "Asia/Tokyo");
    });

    it.each([
      ["2026-10-07T23:59:59Z", "2026-10-07"],
      ["2026-10-08T00:00:00Z", "2026-10-08"]
    ])("%s は UTC の %s で数える", (at, day) => {
      const now = Date.parse(at);
      expect(autoReplyQuotaKeys("a@example.com", now)[1]).toBe(`contact:autoreply:global:${day}`);
      expect(autoReplyQuotaKeys("a@example.com", now)[0]).toMatch(
        new RegExp(`^contact:autoreply:to:${day}:[0-9a-f]{32}$`)
      );
      expect(quarantineQuotaKey(now, true)).toBe(`contact:quarantine:strong:${day}`);
      expect(quarantineQuotaKey(now, false)).toBe(`contact:quarantine:weak:${day}`);
    });
  });

  describe("Scenario 4: 隔離通知は区分ごとの送信上限を超えたら破棄する", () => {
    const spam: InputOverrides = {
      fields: { name: SPAM_NAME, inquiry: SPAM_INQUIRY },
      raw: { recaptchaToken: undefined }
    };
    const weakOnly: InputOverrides = { raw: { recaptchaToken: undefined } };
    const STRONG_NOTE = "本日の隔離通知（bot の強い兆候あり）が上限（20 件）に達しました";
    const WEAK_NOTE = "本日の隔離通知（弱い理由のみ）が上限（50 件）に達しました";

    // 当日のカウントは、この問い合わせより前の件数
    it.each([
      { strong: true, before: 18, result: "notify" },
      { strong: true, before: 19, result: "limit" },
      { strong: true, before: 20, result: "drop" },
      { strong: false, before: 48, result: "notify" },
      { strong: false, before: 49, result: "limit" },
      { strong: false, before: 50, result: "drop" }
    ] as const)("強い = $strong・前に $before 件 → $result", async ({ strong, before, result }) => {
      const { sent, logs, pauses, backend, submit } = createWorld();
      backend.store.counts.set(quarantineQuotaKey(NOW, strong), before);
      const out = await submit(strong ? spam : weakOnly);
      expect(out.status).toBe(200);
      expect(out.deferred).toBeNull();
      const note = strong ? STRONG_NOTE : WEAK_NOTE;
      if (result === "drop") {
        expect(sent).toHaveLength(0);
        expect(logs).toContainEqual(
          expect.objectContaining({
            event: "contact_quarantine_dropped",
            reasons: expect.arrayContaining([strong ? "random_alpha" : "recaptcha_missing_token"])
          })
        );
        // 破棄した分だけ応答が速くならないよう待つ
        expect(pauses).toHaveLength(1);
        expect(pauses[0]).toBeGreaterThanOrEqual(250);
        expect(pauses[0]).toBeLessThan(650);
      } else {
        expect(sent).toHaveLength(1);
        expect(pauses).toHaveLength(0);
        if (result === "limit") expect(admin(sent).text).toContain(note);
        else expect(admin(sent).text).not.toContain(note);
      }
    });

    it("弱い理由だけの隔離は、強い枠が埋まっていても別枠で数える", async () => {
      const { sent, backend, submit } = createWorld();
      backend.store.counts.set(quarantineQuotaKey(NOW, true), 21);
      backend.store.counts.set(quarantineQuotaKey(NOW, false), 48);
      await submit(weakOnly);
      expect(sent).toHaveLength(1);
      expect(admin(sent).subject).toBe(quarantinedSubject("recaptcha_missing_token"));
      expect(backend.store.counts.get(quarantineQuotaKey(NOW, false))).toBe(49);
      expect(backend.store.counts.get(quarantineQuotaKey(NOW, true))).toBe(21);
    });

    it("Origin なしのトークンなし直接 POST は強い区分で数える", async () => {
      const { sent, backend, submit } = createWorld();
      await submit({
        raw: { recaptchaToken: undefined },
        headers: new Headers({ "user-agent": "curl/8.0" })
      });
      expect(backend.store.counts.get(quarantineQuotaKey(NOW, true))).toBe(1);
      expect(backend.store.counts.has(quarantineQuotaKey(NOW, false))).toBe(false);
      expect(admin(sent).text).toContain("理由コード　　：recaptcha_missing_token, origin_missing");
    });

    it("ストアが使えなくても隔離通知は届け、理由を載せる", async () => {
      const { sent, logs, backend, submit } = createWorld();
      backend.store.fail = true;
      await submit(spam);
      expect(sent).toHaveLength(1);
      expect(admin(sent).text).toContain("送信上限ストア：error=Error");
      expect(logs).toContainEqual({ event: "contact_store_unavailable", detail: "error=Error" });
    });
  });

  describe("Scenario 5: 管理者通知の送信に失敗したら 500", () => {
    it("自動返信も送らない", async () => {
      const { logs, submit } = createWorld();
      const attempts: OutgoingMail[] = [];
      const out = await submit(
        {},
        {
          sendMail: async (mail) => {
            attempts.push(mail);
            throw new Error("resend error");
          }
        }
      );
      expect(out).toEqual({ status: 500, deferred: null });
      expect(attempts).toHaveLength(1);
      expect(logs).toContainEqual({
        event: "contact_admin_notice_failed",
        message: "resend error"
      });
    });
  });

  it("ログにメールアドレスを出さない", async () => {
    const { logs, backend, submit } = createWorld();
    await submit();
    await submit({ raw: { recaptchaToken: undefined } });
    backend.store.fail = true;
    await submit(
      {},
      {
        sendMail: async () => {
          throw new Error("resend error");
        }
      }
    );
    expect(logs.length).toBeGreaterThan(0);
    expect(JSON.stringify(logs)).not.toContain("@");
  });
});
