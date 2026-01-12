import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "lib/i18n";
import homepageImg from "public/images/service/homepage.png";
import ecImg from "public/images/service/ec.png";
import systemImg from "public/images/service/system.png";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale);

  return {
    title: "Service",
    description: t.SERVICE.SUMMARY
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
        Service
      </h1>
      <div className="mb-8 prose dark:prose-dark leading-6 w-full">
        <p className="mb-14 text-gray-600 dark:text-gray-400">
          {t.SERVICE.SUMMARY}
        </p>
        <ul className="text-gray-600 dark:text-gray-400">
          {t.SERVICE.LIST.map((str, i) => (
            <li key={i}>{str}</li>
          ))}
        </ul>

        <div id="homepage" className="pt-2 mb-14">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            {t.SERVICE.HOMEPAGE.TITLE}
          </h3>
          <p className="mb-3 text-gray-600 dark:text-gray-400">
            {t.SERVICE.HOMEPAGE.SUMMARY}
          </p>
          <Image
            className="mb-4 dark:saturate-[80%] dark:brightness-[80%] rounded-lg border-2 border-gray-300"
            src={homepageImg}
            alt="homepage"
            placeholder="blur"
            width={400}
            height={279}
          />
          <div className="text-gray-600 dark:text-gray-400">
            {t.SERVICE.HOMEPAGE.DETAIL.map((str, i) => (
              <p key={i}>{str}</p>
            ))}
          </div>
        </div>

        <div id="ec" className="pt-2 mb-14">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            {t.SERVICE.EC.TITLE}
          </h3>
          <p className="mb-3 text-gray-600 dark:text-gray-400">
            {t.SERVICE.EC.SUMMARY}
          </p>
          <Image
            className="mb-4 dark:saturate-[80%] dark:brightness-[80%] rounded-lg border-2 border-gray-300"
            src={ecImg}
            alt="ec site"
            placeholder="blur"
            width={400}
            height={278}
          />
          <div className="text-gray-600 dark:text-gray-400">
            {t.SERVICE.EC.DETAIL.map((str, i) => (
              <p key={i}>{str}</p>
            ))}
          </div>
        </div>

        <div id="system" className="pt-2 mb-14">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            {t.SERVICE.SYSTEM.TITLE}
          </h3>
          <p className="mb-3 text-gray-600 dark:text-gray-400">
            {t.SERVICE.SYSTEM.SUMMARY}
          </p>
          <Image
            className="mb-4 dark:saturate-[80%] dark:brightness-[80%] rounded-lg border-2 border-gray-300"
            src={systemImg}
            alt="web system"
            placeholder="blur"
            width={400}
            height={234}
          />
          <div className="text-gray-600 dark:text-gray-400">
            {t.SERVICE.SYSTEM.DETAIL.map((str, i) => (
              <p key={i}>{str}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
