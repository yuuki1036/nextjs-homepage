import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { MailDataRequired } from "@sendgrid/helpers/classes/mail";
import { EmailData } from "@sendgrid/helpers/classes/email-address";
import { z } from "zod";
import { MY_NAME } from "lib/constants";
import { sanitizeInput } from "lib/util";
import { checkRateLimit, sendMailRateLimit, getClientIp } from "lib/rate-limit";

const inputSchema = z.object({
  name: z.string().min(1).max(60),
  email: z.string().min(1).email(),
  inquiry: z.string().min(1).max(500)
});

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

  const { name, email, inquiry } = result.data;

  if (!process.env.SENDGRID_API_KEY || !process.env.MAIL_FROM || !process.env.MAIL_ADDRESS) {
    console.error("Missing required environment variables");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const safeName = sanitizeInput(name);
  const safeEmail = sanitizeInput(email);
  const safeInquiry = sanitizeInput(inquiry);

  const subjectToSys: string = "ホームページからの問い合わせ";
  const bodyToSys: string = `
ホームページから問い合わせがありました。
返信をお願いします。

お名前　　　　：${safeName} 様
メールアドレス：${safeEmail}
問い合わせ内容：
${safeInquiry}
`;

  const subjectToCst: string = `【${MY_NAME}】お問い合わせありがとうございます`;
  const bodyToCst: string = `
${safeName} 様

お世話になっております。
${MY_NAME}へのお問い合わせありがとうございました。

以下の内容でお問い合わせを受け付けいたしました。
担当者 ${process.env.LAST_NAME} より折り返しご連絡いたしますので
今しばらくお待ちくださいませ。

━━━━━━　お問い合わせ内容　━━━━━━
名前　　　　　：${safeName}
メールアドレス：${safeEmail}
問い合わせ内容：
${safeInquiry}
━━━━━━━━━━━━━━━━━━━━━━

このメールは配信専用です。返信しないようお願いいたします。

——————————————————————
${MY_NAME}
${process.env.LAST_NAME} ${process.env.FIRST_NAME}
tel：${process.env.PHONE_NUMBER}
mail：${process.env.MAIL_ADDRESS}
website：https://yuuki1036.com
———————————————————————
`;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msgToCst: MailDataRequired = {
    to: email,
    from: {
      email: process.env.MAIL_FROM,
      name: MY_NAME
    } as EmailData,
    subject: subjectToCst,
    text: bodyToCst
  };

  const msgToSys: MailDataRequired = {
    to: process.env.MAIL_ADDRESS,
    from: {
      email: process.env.MAIL_FROM,
      name: `${MY_NAME} - system`
    } as EmailData,
    subject: subjectToSys,
    text: bodyToSys
  };

  try {
    await sgMail.send(msgToCst);
    await sgMail.send(msgToSys);
    console.log("mail send complete");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("mail send failed:", err);
    return NextResponse.json(
      { error: "メール送信に失敗しました。しばらく経ってからお試しください。" },
      { status: 500 }
    );
  }
}
