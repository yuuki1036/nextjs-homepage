import * as yup from "yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import { checkResponse } from "lib/util";
import { TForm, TFormState, TInput } from "lib/types";
import LoadingSpinner from "./LoadingSpinner";
import { UseLocale } from "lib/hook/useLocale";

const ContactForm = () => {
  const { locale, t } = UseLocale();
  const txt = t.CONTACT.FORM;
  // validation schema
  const schema = yup.object({
    name: yup.string().required(txt.NAME.REQUIRED).max(60, txt.NAME.MAX),
    email: yup.string().required(txt.MAIL.REQUIRED).email(txt.MAIL.FORMAT),
    inquiry: yup
      .string()
      .required(txt.INQUIRY.REQUIRED)
      .max(500, txt.INQUIRY.MAX)
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TInput>({
    resolver: yupResolver(schema)
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
          alert(txt.FAILED);
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
      alert(txt.FAILED);
      reset();
      return;
    }
    // メール送信
    await mailSendHandler(data);
  };

  return (
    <div className="mb-16 w-full">
      {form.state === TForm.Success ? (
        <div className="h-96 text-gray-600 dark:text-gray-400 transition-all">
          <p>
            {txt.SUCCESS[0]}
            <br></br>
            {txt.SUCCESS[1]}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label htmlFor="name" className="contact-label">
              {txt.NAME.LABEL}
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
              {txt.MAIL.LABEL}
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
              {txt.INQUIRY.LABEL}
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
