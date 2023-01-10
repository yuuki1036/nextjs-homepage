import { NextApiRequest, NextApiResponse } from "next";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { EmailData } from "@sendgrid/helpers/classes/email-address";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msg: MailDataRequired = {
    to: process.env.MAIL_TO,
    from: process.env.MAIL_FROM as EmailData,
    subject: "おためし",
    text: `${req.body.name}さん（職場：${req.body.email}）からの問い合わせ: ${req.body.inquiry}`,
    html: `
    <strong>${req.body.name}さんからの問い合わせ</strong>
    <p>職場：${req.body.email}</p>
    <p>${req.body.inquiry}</p>
    `
  };
  console.log("req.body: ", req.body);
  console.log("TO: ", process.env.MAIL_TO);

  try {
    await sgMail.send(msg);
    res.status(200).json(msg);
  } catch (err) {
    res.status(500).json(err);
  }
}
