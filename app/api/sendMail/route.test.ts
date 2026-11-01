import { after, NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { quarantineQuotaKey, type OutgoingMail } from "lib/contact-guard";
import {
  BACKEND_ENV,
  SITE_HOST,
  TEST_TOKEN,
  createContactBackend,
  siteverifyReply,
  type ContactBackend
} from "lib/testing/contact-backend";
import { POST } from "./route";

type SendResult = { data: { id: string } | null; error: { message: string } | null };

const { resendSend } = vi.hoisted(() => ({
  resendSend: vi.fn(async (_mail: OutgoingMail): Promise<SendResult> => ({
    data: { id: "stub" },
    error: null
  }))
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: resendSend };
  }
}));

// NextRequest と NextResponse は本物を使い、after だけ差し替える
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn()
}));

const ADMIN_SUBJECT = "ホームページからの問い合わせ";
const VALID = {
  name: "山田 太郎",
  email: "taro@example.com",
  inquiry: "お見積りの相談です",
  recaptchaToken: TEST_TOKEN,
  subject: ""
};

let backend: ContactBackend;
let seq = 0;

beforeEach(() => {
  const env = {
    ...BACKEND_ENV,
    RESEND_API_KEY: "re_dummy",
    MAIL_FROM: "noreply@yuuki1036.com",
    MAIL_ADDRESS: "owner@example.invalid",
    LAST_NAME: "LASTNAME_X",
    FIRST_NAME: "FIRSTNAME_X",
    PHONE_NUMBER: "090-0000-0000"
  };
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  // 判定のしきい値は既定値で確かめる（手元の shell の値を混ぜない）
  for (const key of [
    "RECAPTCHA_MIN_SCORE",
    "RECAPTCHA_ALLOWED_HOSTNAMES",
    "CONTACT_HONEYPOT_FIELD",
    "CONTACT_RANDOM_ALPHA_MIN_LENGTH",
    "CONTACT_RANDOM_ALPHA_MIN_CASE",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN"
  ]) {
    vi.stubEnv(key, undefined);
  }
  // route は実時刻で判定するので、応答も実時刻で作る（固定時刻の応答を流すと stale になる）
  backend = createContactBackend({ siteverifyReply: siteverifyReply(Date.now()) });
  vi.stubGlobal("fetch", backend.fetch);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// lib/rate-limit は IP ごとに 1 分 3 回までなので、既定ではリクエストごとに IP を変える
const post = (
  body: unknown,
  {
    raw = false,
    headers = {},
    ip
  }: { raw?: boolean; headers?: Record<string, string>; ip?: string } = {}
) =>
  new NextRequest(`https://${SITE_HOST}/api/sendMail`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: SITE_HOST,
      origin: `https://${SITE_HOST}`,
      "x-forwarded-for": ip ?? `2001:db8::${(++seq).toString(16)}`,
      ...headers
    },
    body: raw ? String(body) : JSON.stringify(body)
  });

const sentMails = () => resendSend.mock.calls.map(([mail]) => mail);
const afterTasks = () => vi.mocked(after).mock.calls.map(([task]) => task);
const runAfterTasks = async () => {
  for (const task of afterTasks()) {
    await (typeof task === "function" ? task() : task);
  }
};

describe("Scenario 6: 400 になるのは名前・メールアドレス・問い合わせ内容の不正だけ", () => {
  it.each<[string, 200 | 400, string | null, Record<string, unknown>]>([
    ["名前 60 文字", 200, null, { ...VALID, name: "あ".repeat(60) }],
    ["名前 61 文字", 400, null, { ...VALID, name: "あ".repeat(61) }],
    ["問い合わせ内容 500 文字", 200, null, { ...VALID, inquiry: "あ".repeat(500) }],
    ["問い合わせ内容 501 文字", 400, null, { ...VALID, inquiry: "あ".repeat(501) }],
    ["メールアドレスの形が不正", 400, null, { ...VALID, email: "not-an-email" }],
    ["名前が空", 400, null, { ...VALID, name: "" }],
    ["トークンが null", 200, "recaptcha_malformed_token", { ...VALID, recaptchaToken: null }],
    [
      "トークン 4097 文字",
      200,
      "recaptcha_malformed_token",
      { ...VALID, recaptchaToken: "A".repeat(4097) }
    ],
    ["ハニーポット 201 文字", 200, "honeypot", { ...VALID, subject: "x".repeat(201) }],
    [
      "トークンを含まない旧クライアント",
      200,
      "recaptcha_missing_token",
      { name: VALID.name, email: VALID.email, inquiry: "旧タブから" }
    ]
  ])("%s → %s（%s）", async (_label, status, code, body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(status);
    if (status === 400) {
      expect(resendSend).not.toHaveBeenCalled();
      return;
    }
    expect(await res.json()).toEqual({ success: true });
    expect(sentMails()[0]?.subject).toBe(
      code ? `[要確認:${code}] ${ADMIN_SUBJECT}` : ADMIN_SUBJECT
    );
    // 自動返信は合格したときだけ応答の後に送る
    expect(afterTasks()).toHaveLength(code ? 0 : 1);
  });

  it("本文が JSON でなければ 400", async () => {
    const res = await POST(post("hello", { raw: true, headers: { "content-type": "text/plain" } }));
    expect(res.status).toBe(400);
    expect(resendSend).not.toHaveBeenCalled();
  });
});

describe("Scenario 1: 合格すると応答の後（after）に自動返信を送る", () => {
  it("自動返信にはサイト運営者の本名・電話番号・アドレスを載せない", async () => {
    const res = await POST(post(VALID));
    expect(res.status).toBe(200);
    await runAfterTasks();
    const [adminMail, autoReply] = sentMails();
    expect(sentMails()).toHaveLength(2);
    expect(adminMail?.replyTo).toBe(VALID.email);
    expect(autoReply?.to).toBe(VALID.email);
    for (const secret of ["LASTNAME_X", "FIRSTNAME_X", "090-0000-0000", "owner@"]) {
      expect(autoReply?.text).not.toContain(secret);
    }
  });
});

describe("Scenario 5: 管理者通知の送信に失敗したら 500", () => {
  it("自動返信を登録しない", async () => {
    resendSend.mockResolvedValueOnce({ data: null, error: { message: "quota exceeded" } });
    const res = await POST(post(VALID));
    expect(res.status).toBe(500);
    expect(afterTasks()).toHaveLength(0);
  });
});

describe("サーバー設定の不足", () => {
  it.each(["RESEND_API_KEY", "MAIL_FROM", "MAIL_ADDRESS"])("%s が無ければ 500", async (key) => {
    vi.stubEnv(key, undefined);
    const res = await POST(post(VALID));
    expect(res.status).toBe(500);
    expect(resendSend).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Missing required environment variables");
  });
});

describe("IP 単位のレート制限", () => {
  it("同じ IP から 1 分に 4 回目は 429", async () => {
    const ip = "198.51.100.7";
    for (let i = 0; i < 3; i++) {
      expect((await POST(post("x", { raw: true, ip }))).status).toBe(400);
    }
    const res = await POST(post("x", { raw: true, ip }));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
});

describe("ログのレベル", () => {
  const logged = (spy: unknown, event: string) =>
    expect(spy).toHaveBeenCalledWith(expect.stringContaining(`"event":"${event}"`));

  it("判定は log", async () => {
    await POST(post(VALID));
    logged(console.log, "contact_verdict");
  });

  it("ストアが使えないときは warn", async () => {
    backend.store.fail = true;
    await POST(post(VALID));
    logged(console.warn, "contact_store_unavailable");
  });

  it("隔離通知の破棄は warn", async () => {
    // テストと route で同じ日付のキーになるよう時計を止める（UTC の 0 時をまたがない）
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    // 強い区分の当日カウントを上限（20）まで埋め、ランダム英字の問い合わせを破棄させる
    backend.store.counts.set(quarantineQuotaKey(now, true), 20);
    const res = await POST(
      post({ ...VALID, name: "gdBMwxGSWLEOeDjYMJ", inquiry: "AJqeHRsKIjkJgeCT" })
    );
    expect(res.status).toBe(200);
    expect(resendSend).not.toHaveBeenCalled();
    logged(console.warn, "contact_quarantine_dropped");
  });

  it("管理者通知の失敗は error", async () => {
    resendSend.mockResolvedValueOnce({ data: null, error: { message: "quota exceeded" } });
    await POST(post(VALID));
    logged(console.error, "contact_admin_notice_failed");
  });

  it("自動返信の失敗は error", async () => {
    resendSend
      .mockResolvedValueOnce({ data: { id: "admin" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "quota exceeded" } });
    await POST(post(VALID));
    await runAfterTasks();
    logged(console.error, "contact_autoreply_failed");
  });
});
