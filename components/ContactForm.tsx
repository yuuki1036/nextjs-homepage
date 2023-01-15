import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import { checkResponse } from "lib/util";
import { contactFailedMsg, contactFormSchema } from "lib/validation";
import { TForm, TFormState, TInput } from "lib/types";
import LoadingSpinner from "./LoadingSpinner";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TInput>({
    resolver: yupResolver(contactFormSchema)
  });

  const [form, setForm] = useState<TFormState>({ state: TForm.Initial });
  const { executeRecaptcha } = useGoogleReCaptcha();

  const recaptchaHandler = async () => {
    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      return false;
    }
    // クライアントサイドのトークンを発行
    const token = await executeRecaptcha("contact");
    let decitionRecaptcha = false;
    // サーバーサイドへ
    await fetch("/api/recaptcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    })
      .then((res) => {
        checkResponse(res);
        if (res.status === 200) decitionRecaptcha = true;
      })
      .catch((err) => {
        console.log("recaptcha fetch error", err);
      });
    return decitionRecaptcha;
  };

  const mailSendHandler = async (inputs: TInput) => {
    await fetch("/api/sendMail", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputs)
    })
      .then((res) => {
        checkResponse(res);
        if (res.status === 200) {
          setForm({ state: TForm.Success });
          reset();
        } else {
          setForm({ state: TForm.Initial });
          alert(contactFailedMsg);
          reset();
        }
      })
      .catch((err) => {
        console.log("mail send fetch error ", err);
      });
  };

  const onSubmit: SubmitHandler<TInput> = async (data) => {
    if (form.state === TForm.Loading) return;
    setForm({ state: TForm.Loading });
    // Google ReCaptchaによるbot判定
    const decitionRecaptcha = await recaptchaHandler();
    if (!decitionRecaptcha) {
      setForm({ state: TForm.Initial });
      alert(contactFailedMsg);
      reset();
      return;
    }
    // メール送信
    await mailSendHandler(data);
  };

  return (
    <div className="mb-16 w-full">
      {form.state === TForm.Success ? (
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
              rows={9}
              className="contact-input"
              {...register("inquiry")}
            />

            <p className="mt-2 mb-2 text-sm text-red-600 dark:text-red-700">
              {errors.inquiry?.message}
            </p>
          </div>

          <div className="mb-12 text-gray-600 dark:text-gray-400 text-xs">
            <p>This site is protected by reCAPTCHA and the Google</p>
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
            className="text-gray-900 bg-gray-200 dark:text-white dark:bg-gray-600 font-medium rounded-lg text-sm w-auto px-5 py-2.5 text-center hover:ring-2 ring-gray-300 "
          >
            {form.state === TForm.Loading ? <LoadingSpinner /> : "Send"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
