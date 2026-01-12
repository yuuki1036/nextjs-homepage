import Link from "next/link";
import Image from "next/image";
import ServiceCard from "components/ServiceCard";
import WorksFeatureCard from "components/WorksFeatuteCard";
import avatarImg from "public/images/avatar.png";
import { getTranslations } from "lib/i18n";
import { MY_NAME, SITE_NAME } from "lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <div className="flex flex-col justify-center items-start max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
      <div className="flex flex-col-reverse sm:flex-row items-start">
        <div className="flex flex-col md:pr-8 max-w-[555px]">
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-1 text-black dark:text-white">
            {SITE_NAME}
          </h1>
          <h2 className="text-gray-700 dark:text-gray-200 mb-4">
            WEB/Application Engineer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-16">
            {t.INDEX.SUMMARY}
          </p>
        </div>
        <div className="w-[80px] sm:w-[117px] relative mb-8 sm:mb-0 mr-auto">
          <Image
            className="rounded-full filter bg-magenta-icon dark-image-layer"
            src={avatarImg}
            alt={MY_NAME}
            priority
            height={117}
            width={117}
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
          tag={["Next.js", "TypeScript"]}
          gradient={"from-[#D8B4FE] to-[#818CF8]"}
          locale={locale}
        />
        <WorksFeatureCard
          title={"Netflix clone App."}
          slug={"netfjix"}
          tag={["Next.js", "TypeScript"]}
          gradient={"from-[#6EE7B7] via-[#3B82F6] to-[#9333EA]"}
          locale={locale}
        />
        <WorksFeatureCard
          title={"Refuse disposal support Line Bot."}
          slug={"53st"}
          tag={["Python3", "AWS"]}
          gradient={"from-[#FDE68A] via-[#FCA5A5] to-[#FECACA]"}
          locale={locale}
        />
      </div>
      <Link
        href={`/${locale}/works`}
        className="flex items-center mt-8 text-gray-600 dark:text-gray-400 leading-7 rounded-lg hover:text-gray-800 dark:hover:text-gray-200 transition-all h-6"
      >
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
      </Link>

      <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-4 mt-16 text-black dark:text-white">
        Service
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t.INDEX.SERVICE}</p>
      <ServiceCard
        index="01"
        id="homepage"
        title={t.INDEX.SERVICE_CARDS.HOMEPAGE}
        locale={locale}
      />
      <ServiceCard
        index="02"
        id="ec"
        title={t.INDEX.SERVICE_CARDS.EC}
        locale={locale}
      />
      <ServiceCard
        index="03"
        id="system"
        title={t.INDEX.SERVICE_CARDS.SYSTEM}
        locale={locale}
      />
      <Link
        href={`/${locale}/service`}
        className="flex items-center mt-8 text-gray-600 dark:text-gray-400 leading-7 rounded-lg hover:text-gray-800 dark:hover:text-gray-200 transition-all h-6"
      >
        {"Read more"}
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
      </Link>
      <span className="h-16" />
    </div>
  );
}
