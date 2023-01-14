import { NextApiRequest, NextApiResponse } from "next";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { EmailData } from "@sendgrid/helpers/classes/email-address";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const subjectToSys: string = "ホームページからの問い合わせ";
  const bodyToSys: string = `
お名前　　　　：${req.body.name} 様
メールアドレス：${req.body.email}
問い合わせ内容：
${req.body.inquiry}
  `;

  const subjectToCst: string = "【yuuki1036】お問い合わせありがとうございます";
  const bodyToCst: string = `

${req.body.name} 様

お世話になっております。
yuuki1036へのお問い合わせありがとうございました。

以下の内容でお問い合わせを受け付けいたしました。
担当者 藤岡 より折り返しご連絡いたしますので
今しばらくお待ちくださいませ。

━━━━━━　お問い合わせ内容　━━━━━━
お名前　　　　　：${req.body.name}
メールアドレス　：${req.body.email}
お問い合わせ内容：
${req.body.inquiry}
━━━━━━━━━━━━━━━━━━━━━━

このメールは配信専用です。返信しないようお願いいたします。

——————————————————————
yuuki1036
藤岡勇樹
tel：${process.env.PHONE_NUMBER}
mail：${process.env.MAIL_ADDRESS}
https://yuuki1036.com
———————————————————————
  `;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msgToCst: MailDataRequired = {
    to: req.body.email,
    from: process.env.MAIL_FROM as EmailData,
    subject: subjectToCst,
    text: bodyToCst
  };

  const msgToSys: MailDataRequired = {
    to: process.env.MAIL_TO,
    from: process.env.MAIL_FROM as EmailData,
    subject: subjectToSys,
    text: bodyToSys
  };

  try {
    await sgMail.send(msgToCst);
    await sgMail.send(msgToSys);
    console.log("mail send complete");
    res.status(200).json(msgToSys);
  } catch (err) {
    console.log("mail send failed");
    res.status(500).json(err);
  }
}
