import * as yup from "yup";

export const contactFormSchema = yup.object({
  name: yup
    .string()
    .required("名前を入力してください")
    .max(60, "60文字以内で入力してください"),
  email: yup
    .string()
    .required("メールアドレスを入力してください")
    .email("メールアドレスの形式ではありません。"),
  inquiry: yup
    .string()
    .required("お問い合わせ内容を入力してください")
    .max(500, "500文字以内で入力してください")
});

export const contactFailedMsg: string =
  "お問い合わせの送信に失敗しました。お手数ですがもう一度お試しください。";
