import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
    watch,
    reset,
    formState: { errors }
  } = useForm<TInput>({
    resolver: yupResolver(schema)
  });

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
      reset();
      alert("送信OK");
    } catch (err) {
      console.log("fetch error", err);
      alert(JSON.stringify(err));
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            id="name"
            placeholder=" "
            className="max-w-xs block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            {...register("name")}
          />
          <label
            htmlFor="name"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
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
            className="max-w-xs block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            {...register("email")}
          />
          <label
            htmlFor="email"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
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
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            {...register("inquiry")}
          />
          <label
            htmlFor="inquiry"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            お問い合わせ内容
          </label>
          <p className="mt-2 text-sm text-red-600 dark:text-red-700">
            {errors.inquiry?.message}
          </p>
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
