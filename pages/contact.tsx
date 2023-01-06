import Container from "components/Container";
import { NextPage } from "next";
import React from "react";
import { useForm } from "react-hook-form";

const Contact: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const onSubmit = (data: any) => console.log(data);
  console.log(errors);

  return (
    <Container
      title="Contact – yuuki1036"
      description="Thoughts on the software industry, programming, tech, videography, music, and my personal life."
    >
      <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
          Contact
        </h1>
        <p className="mb-16 text-gray-600 dark:text-gray-400">
          開発依頼・ご相談などお気軽にお問い合わせください。
          下記フォームよりわかる範囲でご記入ください。必須の項目は必ずご記入お願いします。
        </p>
        <div className="block p-6 rounded-lg shadow-lg bg-white max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group mb-6">
              <input
                type="text"
                placeholder="名前"
                className="form-control block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                {...register("name", {
                  required: true,
                  max: 60,
                  min: 1,
                  maxLength: 80
                })}
              />
            </div>
            <div className="form-group mb-6">
              <input
                type="text"
                placeholder="貴社名"
                className="form-control block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                {...register("companyName", {
                  required: false,
                  max: 60,
                  min: 1,
                  maxLength: 80
                })}
              />
            </div>
            <div className="form-group mb-6">
              <input
                type="text"
                placeholder="email"
                className="form-control block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                {...register("Email", {
                  required: true,
                  pattern: /^\S+@\S+$/i
                })}
              />
            </div>
            <div className="form-group mb-6">
              <textarea
                placeholder="Message"
                rows={3}
                className="
          form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
        "
                {...register("Email")}
              ></textarea>
            </div>
            <button
              type="submit"
              className="
        w-full
        px-6
        py-2.5
        bg-blue-600
        text-white
        font-medium
        text-xs
        leading-tight
        uppercase
        rounded
        shadow-md
        hover:bg-blue-700 hover:shadow-lg
        focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
        active:bg-blue-800 active:shadow-lg
        transition
        duration-150
        ease-in-out"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Contact;
