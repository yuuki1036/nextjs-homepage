import { after, NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { MY_NAME, URL as SITE_URL } from "lib/constants";
import { loadGuardConfig, processSubmission, type OutgoingMail } from "lib/contact-guard";
import { checkRateLimit, sendMailRateLimit, getClientIp } from "lib/rate-limit";

// bot 判定用の欄（reCAPTCHA トークン・ハニーポット）はここに足さない。
// 欄の異常で問い合わせ全体が 400 にならないよう、判定側で本文から緩く読む
const inputSchema = z.object({
  name: z.string().min(1).max(60),
  email: z.string().min(1).email(),
  inquiry: z.string().min(1).max(500)
});

const SITE_HOSTNAME = new URL(SITE_URL).hostname;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success, remaining, reset } = checkRateLimit(ip, "sendmail", sendMailRateLimit);

  if (!success) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく経ってからお試しください。" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString()
        }
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = inputSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { RESEND_API_KEY, MAIL_FROM, MAIL_ADDRESS } = process.env;
  if (!RESEND_API_KEY || !MAIL_FROM || !MAIL_ADDRESS) {
    console.error("Missing required environment variables");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const resend = new Resend(RESEND_API_KEY);
  const sendMail = async (mail: OutgoingMail) => {
    const { error } = await resend.emails.send(mail);
    if (error) throw new Error(error.message);
  };

  const outcome = await processSubmission(
    {
      ...result.data,
      raw: body as Record<string, unknown>,
      headers: request.headers,
      host: request.headers.get("host") ?? request.nextUrl.host
    },
    {
      config: loadGuardConfig(process.env, SITE_HOSTNAME),
      fetchFn: fetch,
      sendMail,
      now: Date.now,
      mailFrom: MAIL_FROM,
      adminAddress: MAIL_ADDRESS,
      site: { siteName: MY_NAME, siteUrl: SITE_URL },
      // Vercel のログでレベルを絞り込めるよう、失敗は error、取りこぼしにつながるものは warn で出す
      log: (event, fields) => {
        const line = JSON.stringify({ event, ...fields });
        if (event.endsWith("_failed")) console.error(line);
        else if (event === "contact_store_unavailable" || event === "contact_quarantine_dropped") {
          console.warn(line);
        } else console.log(line);
      }
    }
  );

  if (outcome.status === 500) {
    return NextResponse.json(
      { error: "メール送信に失敗しました。しばらく経ってからお試しください。" },
      { status: 500 }
    );
  }
  // 自動返信は応答の後に送る（合格と隔離で応答時間に差を出さないため）
  if (outcome.deferred) after(outcome.deferred);
  return NextResponse.json({ success: true });
}
