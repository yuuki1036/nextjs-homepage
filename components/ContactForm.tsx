import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

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

  const onSubmit: SubmitHandler<TInput> = async (data) => {
    try {
      const res = fetch("/api/sendMail", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      console.log("res ", res);
      setIsSend(true);
      reset();
    } catch (err) {
      console.log("fetch error", err);
      alert(JSON.stringify(err));
    }
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
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              id="name"
              placeholder=" "
              className="contact-input max-w-xs peer"
              {...register("name")}
            />
            <label htmlFor="name" className="contact-label">
              お名前
            </label>
            <p className="mt-2 text-sm text-red-600 dark:text-red-700">
              {errors.name?.message}
            </p>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              id="email"
              placeholder=" "
              className="contact-input max-w-xs peer"
              {...register("email")}
            />
            <label htmlFor="email" className="contact-label">
              メールアドレス
            </label>
            <p className="mt-2 text-sm text-red-600 dark:text-red-700">
              {errors.email?.message}
            </p>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <textarea
              id="inquiry"
              placeholder=" "
              rows={10}
              className="contact-input peer"
              {...register("inquiry")}
            />
            <label htmlFor="inquiry" className="contact-label">
              お問い合わせ内容
            </label>
            <p className="mt-2 text-sm text-red-600 dark:text-red-700">
              {errors.inquiry?.message}
            </p>
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
