import { NextApiRequest, NextApiResponse } from "next";

const isBot = (response: any) => {
  const score = response.score * 10;
  return score <= 5;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const serverSecretKey = `secret=${process.env.RECAPTCHA_SERVER_SECRET_KEY}&response=${req.body.token}`;
  try {
    const responseRecaptcha = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: serverSecretKey
      }
    );
    const responseJsonRecaptcha = await responseRecaptcha.json();
    console.log(responseJsonRecaptcha);
    if (isBot(responseJsonRecaptcha)) {
      res.status(500).json({ message: "the client may be a bot" });
    } else {
      res.status(200).json(responseJsonRecaptcha);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

export default handler;
