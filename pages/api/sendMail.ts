import { NextApiRequest, NextApiResponse } from "next";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { EmailData } from "@sendgrid/helpers/classes/email-address";
import { MY_NAME } from "lib/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const subjectToSys: string = "ホームページからの問い合わせ";
  const bodyToSys: string = `
ホームページから問い合わせがありました。
返信をお願いします。

お名前　　　　：${req.body.name} 様
メールアドレス：${req.body.email}
問い合わせ内容：
${req.body.inquiry}
`;

  const subjectToCst: string = `【${MY_NAME}】お問い合わせありがとうございます`;
  const bodyToCst: string = `
${req.body.name} 様

お世話になっております。
${MY_NAME}へのお問い合わせありがとうございました。

以下の内容でお問い合わせを受け付けいたしました。
担当者 ${process.env.LAST_NAME} より折り返しご連絡いたしますので
今しばらくお待ちくださいませ。

━━━━━━　お問い合わせ内容　━━━━━━
名前　　　　　：${req.body.name}
メールアドレス：${req.body.email}
問い合わせ内容：
${req.body.inquiry}
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

  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msgToCst: MailDataRequired = {
    to: req.body.email,
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
    res.status(200).json(msgToSys);
  } catch (err) {
    console.log("mail send failed");
    res.status(500).json(err);
  }
}
