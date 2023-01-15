import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "components/Container";
import ServiceCard from "components/ServiceCard";
import { NextPage } from "next";
import WorksFeatureCard from "components/WorksFeatuteCard";

const Home: NextPage = () => (
  <Suspense fallback={null}>
    <Container>
      <div className="flex flex-col justify-center items-start max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
        <div className="flex flex-col-reverse sm:flex-row items-start">
          <div className="flex flex-col md:pr-8  max-w-[555px]">
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-1 text-black dark:text-white">
              yuuki1036
            </h1>
            <h2 className="text-gray-700 dark:text-gray-200 mb-4">
              WEB/Application Engineer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-16">
              北陸在住のフリーランスエンジニアです。WEBサイトの制作や業務用WEBシステムの開発を行っています。
            </p>
          </div>
          <div className="w-[80px] sm:w-[176px] relative mb-8 sm:mb-0 mr-auto">
            <Image
              alt="Lee Robinson"
              height={176}
              width={176}
              src="/images/avatar.png"
              sizes="30vw"
              priority
              className="rounded-full filter bg-magenta-icon dark-image-layer"
            />
          </div>
        </div>

        <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-6 text-black dark:text-white">
          Works
        </h3>
        <div className="flex gap-6 flex-col md:flex-row">
          <WorksFeatureCard
            title={"Twitter clone App."}
            slug={"hitokoto"}
            tag={["React", "Laravel"]}
            gradient={"from-[#D8B4FE] to-[#818CF8]"}
          />
          <WorksFeatureCard
            title={"Netflix clone App."}
            slug={"netfjix"}
            tag={["Next.js", "TypeScript"]}
            gradient={"from-[#6EE7B7] via-[#3B82F6] to-[#9333EA]"}
          />
          <WorksFeatureCard
            title={"Refuse disposal support Line Bot."}
            slug={"53st"}
            tag={["Python3", "AWS"]}
            gradient={"from-[#FDE68A] via-[#FCA5A5] to-[#FECACA]"}
          />
        </div>
        <Link
          href="/works"
          className="flex items-center mt-8 text-gray-600 dark:text-gray-400 leading-7 rounded-lg hover:text-gray-800 dark:hover:text-gray-200 transition-all h-6"
        >
          <>
            {"Check all works"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 ml-1"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.5 12h-15m11.667-4l3.333 4-3.333-4zm3.333 4l-3.333 4 3.333-4z"
              />
            </svg>
          </>
        </Link>

        <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-4 mt-16 text-black dark:text-white">
          Service
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          WEBサービスの開発に特化しています。ご要望を実現するための適切な方法・技術を選択し開発を進めていきます。
        </p>
        <ServiceCard index="01" id="homepage" title="ホームページ作成" />
        <ServiceCard index="02" id="ec" title="ECサイト構築" />
        <ServiceCard index="03" id="system" title="業務用WEBシステム構築" />
        <Link
          href="/service"
          className="flex items-center mt-8 text-gray-600 dark:text-gray-400 leading-7 rounded-lg hover:text-gray-800 dark:hover:text-gray-200 transition-all h-6"
        >
          <>
            {"More info"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 ml-1"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.5 12h-15m11.667-4l3.333 4-3.333-4zm3.333 4l-3.333 4 3.333-4z"
              />
            </svg>
          </>
        </Link>
        <span className="h-16" />
        {/* <Subscribe /> */}
      </div>
    </Container>
  </Suspense>
);

export default Home;
