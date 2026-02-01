import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkResponse } from "lib/util";
import { checkRateLimit, recaptchaRateLimit, getClientIp } from "lib/rate-limit";

const inputSchema = z.object({
  token: z.string().min(1).max(2048)
});

// ボット判定 1-10の数値. 数値が大きいほど判定が厳しくなる
const isBot = (response: { score: number }) => response.score * 10 <= 7;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success, remaining, reset } = checkRateLimit(ip, "recaptcha", recaptchaRateLimit);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString()
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

  const { token } = result.data;

  if (!process.env.RECAPTCHA_SERVER_SECRET_KEY) {
    console.error("Missing RECAPTCHA_SERVER_SECRET_KEY");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const serverSecretKey = `secret=${process.env.RECAPTCHA_SERVER_SECRET_KEY}&response=${token}`;

  try {
    const resRecaptcha = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: serverSecretKey
    });

    checkResponse(resRecaptcha);
    const resRecaptchaJson = await resRecaptcha.json();

    if (isBot(resRecaptchaJson)) {
      return NextResponse.json({ message: "the client may be a bot" }, { status: 403 });
    }

    return NextResponse.json(resRecaptchaJson);
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
