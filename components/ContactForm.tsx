import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCallback, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";

type TInput = {
  name: string;
  email: string;
  inquiry: string;
};

// validation schema
const schema = yup.object({
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

const mailsendFailedMsg =
  "お問い合わせの送信に失敗しました。お手数ですがもう一度お試しください。";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TInput>({
    resolver: yupResolver(schema)
  });

  const [isSend, setIsSend] = useState<boolean>(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const recaptchaHandler = async () => {
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return false;
    }
    // クライアント側のトークンを発行
    const token = await executeRecaptcha("contact");
    try {
      const res = await fetch("/api/recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });
      if (res.status === 200) {
        console.log("the client may be a human");
        return true;
      } else {
        console.log("the client may be a bot");
      }
    } catch (err) {
      console.log("recaptcha fetch error ", err);
    }
    return false;
  };

  const mailSendHandler = async (data: TInput) => {
    try {
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (res.status === 200) {
        setIsSend(true);
        reset();
      } else {
        alert(mailsendFailedMsg);
      }
    } catch (err) {
      console.log("mail send fetch error ", err);
    }
  };

  const onSubmit: SubmitHandler<TInput> = async (data) => {
    // Google ReCaptchaによるbot判定
    const decitionRecaptcha = await recaptchaHandler();
    if (!decitionRecaptcha) {
      reset();
      alert(mailsendFailedMsg);
      return;
    }
    await mailSendHandler(data);
  };

  return (
    <div className="mb-16 w-full">
      {isSend ? (
        <div className="h-96 text-gray-600 dark:text-gray-400">
          <p>
            お問い合わせを送信しました。<br></br>
            後ほど折り返しご連絡いたします。今しばらくお待ちくださいませ。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label htmlFor="name" className="contact-label">
              お名前
            </label>
            <input
              type="text"
              id="name"
              placeholder=" "
              className="contact-input max-w-xs"
              {...register("name")}
            />
            <p className="mt-2 text-sm text-red-600 dark:text-red-700">
              {errors.name?.message}
            </p>
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="contact-label">
              メールアドレス
            </label>
            <input
              type="text"
              id="email"
              placeholder=" "
              className="contact-input max-w-xs"
              {...register("email")}
            />

            <p className="mt-2 text-sm text-red-600 dark:text-red-700">
              {errors.email?.message}
            </p>
          </div>
          <div className="">
            <label htmlFor="inquiry" className="contact-label">
              お問い合わせ内容
            </label>
            <textarea
              id="inquiry"
              placeholder=" "
              rows={10}
              className="contact-input"
              {...register("inquiry")}
            />

            <p className="mt-2 text-sm text-red-600 dark:text-red-700">
              {errors.inquiry?.message}
            </p>
          </div>

          <div className="mb-8 text-gray-600 dark:text-gray-400 text-xs">
            <p className="">
              This site is protected by reCAPTCHA and the Google
            </p>
            <Link
              className="text-blue-500 hover:text-blue-700"
              href="https://policies.google.com/privacy"
              target={"_blank"}
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              className="text-blue-500 hover:text-blue-700"
              href="https://policies.google.com/terms"
              target={"_blank"}
            >
              Terms of Service
            </Link>{" "}
            apply.
          </div>

          <button
            type="submit"
            className="text-gray-900 bg-gray-200 dark:text-white dark:bg-gray-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center hover:ring-2 ring-gray-300 "
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
