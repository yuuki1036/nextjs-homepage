"use client";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import { contactErrorKey, getRecaptchaToken } from "lib/util";
import { RECAPTCHA_TOKEN_FIELD } from "lib/recaptcha";
import { TForm, TFormState } from "lib/types";
import LoadingSpinner from "./LoadingSpinner";
import { getTranslations } from "lib/i18n";

type Props = {
  locale: string;
  honeypotField: string;
};

const ContactForm = ({ locale, honeypotField }: Props) => {
  const t = getTranslations(locale);
  const txt = t.CONTACT.FORM;
  // validation schema
  const schema = z.object({
    name: z.string().min(1, txt.NAME.REQUIRED).max(60, txt.NAME.MAX),
    email: z.string().min(1, txt.MAIL.REQUIRED).email(txt.MAIL.FORMAT),
    inquiry: z.string().min(1, txt.INQUIRY.REQUIRED).max(500, txt.INQUIRY.MAX)
  });
  type FormInput = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormInput>({
    resolver: zodResolver(schema)
  });

  const [form, setForm] = useState<TFormState>({ state: TForm.Initial });
  const [sentEmail, setSentEmail] = useState("");
  const submittingRef = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // reCAPTCHA の準備待ちの間に最新の executeRecaptcha を参照できるよう ref に入れる
  const { executeRecaptcha } = useGoogleReCaptcha();
  const executeRef = useRef(executeRecaptcha);
  useEffect(() => {
    executeRef.current = executeRecaptcha;
  }, [executeRecaptcha]);

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setForm({ state: TForm.Loading });
    try {
      const token = await getRecaptchaToken(() => executeRef.current);
      let status: number | null = null;
      try {
        const res = await fetch("/api/sendMail", {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...data,
            [RECAPTCHA_TOKEN_FIELD]: token,
            [honeypotField]: honeypotRef.current?.value ?? ""
          })
        });
        status = res.status;
        if (res.ok) {
          setSentEmail(data.email);
          setForm({ state: TForm.Success });
          reset();
          return;
        }
      } catch {
        status = null;
      }
      // 入力内容は消さずに残し、そのまま再送できるようにする
      setForm({ state: TForm.Error, message: txt.ERROR[contactErrorKey(status)] });
    } finally {
      submittingRef.current = false;
    }
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
          <p className="mt-6">
            {txt.SENT_TO}
            {sentEmail}
          </p>
          <p className="mt-2 text-sm">{txt.SENT_TO_NOTE}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-6">
            <label htmlFor="name" className="contact-label">
              {txt.NAME.LABEL}
            </label>
            <input
              type="text"
              id="name"
              placeholder=" "
              autoComplete="name"
              className="contact-input max-w-xs"
              {...register("name")}
            />
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name?.message}</p>
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="contact-label">
              {txt.MAIL.LABEL}
            </label>
            <input
              type="email"
              id="email"
              placeholder=" "
              autoComplete="email"
              className="contact-input max-w-xs"
              {...register("email")}
            />

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email?.message}</p>
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

            <p className="mt-2 mb-2 text-sm text-red-600 dark:text-red-400">
              {errors.inquiry?.message}
            </p>
          </div>

          {/* bot 判定用のハニーポット。人には見えず、キーボードでも辿れない */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <input
              type="text"
              name={honeypotField}
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
              ref={honeypotRef}
            />
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

          {form.state === TForm.Error && (
            <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
              {form.message}
            </p>
          )}

          <button
            type="submit"
            disabled={form.state === TForm.Loading}
            className="text-gray-900 bg-gray-200 dark:text-white dark:bg-gray-600 font-medium rounded-lg text-sm w-auto px-5 py-2.5 text-center hover:ring-2 ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.state === TForm.Loading ? <LoadingSpinner /> : "Send"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
