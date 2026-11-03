import { z } from "zod";
import type { getTranslations } from "./i18n";

type ContactFormText = ReturnType<typeof getTranslations>["CONTACT"]["FORM"];

// スキーマのエラーに入れる訳文キーと、その訳文。ja / en のどちらかに訳文が無いと型検査で落ちる
const MESSAGE_TEXT = {
  "NAME.REQUIRED": (txt) => txt.NAME.REQUIRED,
  "NAME.MAX": (txt) => txt.NAME.MAX,
  "MAIL.REQUIRED": (txt) => txt.MAIL.REQUIRED,
  "MAIL.FORMAT": (txt) => txt.MAIL.FORMAT,
  "INQUIRY.REQUIRED": (txt) => txt.INQUIRY.REQUIRED,
  "INQUIRY.MAX": (txt) => txt.INQUIRY.MAX
} satisfies Record<string, (txt: ContactFormText) => string>;

export type ContactMessageKey = keyof typeof MESSAGE_TEXT;

const key = (k: ContactMessageKey) => k;

// 問い合わせフォームと /api/sendMail が共有する入力の制約。
// - 上限の数字は訳文（「60文字以内」など）にも書いてあるので、変えたら訳文も直す
// - 空のメールで「入力してください」を先に出すため、min(1) を email() の前に置く
// - 表示を今と変えないため trim しない
// - bot 判定用の欄（reCAPTCHA トークン・ハニーポット）はここに足さない。
//   欄の異常で問い合わせ全体が 400 にならないよう、判定側で本文から緩く読む
export const contactSchema = z.object({
  name: z.string().min(1, key("NAME.REQUIRED")).max(60, key("NAME.MAX")),
  email: z.string().min(1, key("MAIL.REQUIRED")).email(key("MAIL.FORMAT")),
  inquiry: z.string().min(1, key("INQUIRY.REQUIRED")).max(500, key("INQUIRY.MAX"))
});

export type ContactFields = z.infer<typeof contactSchema>;

const isMessageKey = (message: string): message is ContactMessageKey =>
  Object.hasOwn(MESSAGE_TEXT, message);

// 欄のエラーを表示する訳文にする。訳文キーでないメッセージは入力誤りの汎用文にする
export const contactFieldErrorText = (
  txt: ContactFormText,
  message: string | undefined
): string | undefined => {
  if (message === undefined) return undefined;
  return isMessageKey(message) ? MESSAGE_TEXT[message](txt) : txt.ERROR.VAL;
};
