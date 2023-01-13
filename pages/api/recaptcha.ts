import { checkResponse } from "lib/util";
import { NextApiRequest, NextApiResponse } from "next";

const isBot = (response: any) => {
  const score = response.score * 10;
  // 1-10の数値. 数値が大きいほど判定が厳しくなる
  return score <= 5;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const serverSecretKey = `secret=${process.env.RECAPTCHA_SERVER_SECRET_KEY}&response=${req.body.token}`;

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
    res.status(500).json({ message: "the client may be a bot" });
  } else {
    res.status(200).json(resRecaptchaJson);
  }
};

export default handler;
