import { NextRequest, NextResponse } from "next/server";
import { checkResponse } from "lib/util";

const isBot = (response: { score: number }) => {
  const score = response.score * 10;
  // 1-10の数値. 数値が大きいほど判定が厳しくなる
  return score <= 5;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const serverSecretKey = `secret=${process.env.RECAPTCHA_SERVER_SECRET_KEY}&response=${body.token}`;

  const resRecaptcha = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: serverSecretKey
    }
  );

  checkResponse(resRecaptcha);
  const resRecaptchaJson = await resRecaptcha.json();

  if (isBot(resRecaptchaJson)) {
    return NextResponse.json(
      { message: "the client may be a bot" },
      { status: 500 }
    );
  } else {
    return NextResponse.json(resRecaptchaJson);
  }
}
