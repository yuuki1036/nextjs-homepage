import Image from "next/image";
import type { Metadata } from "next";
import ExternalLink from "components/ExternalLink";
import SkillMapWrapper from "components/SkillMapWrapper";
import avatarImg from "public/images/avatar.png";
import { getTranslations } from "lib/i18n";
import { MY_NAME, URL as SITE_URL } from "lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale);

  return {
    title: "About",
    description: t.ABOUT.DESCRIPT
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <div className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
      <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
        About Me
      </h1>
      <div className="mb-8 prose dark:prose-dark leading-6 w-full">
        <h2>Bio</h2>
        <div className="flex items-end">
          <h3 className="my-0 mr-2">{MY_NAME}</h3>
          <Image
            className="rounded-full filter bg-gray-100 dark-image-layer"
            src={avatarImg}
            alt={MY_NAME}
            height={35}
            width={35}
            priority
          />
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t.ABOUT.BIO.SUPPLEMENT}
        </p>
        {t.ABOUT.BIO.DETAILS.map((str, i) => (
          <p className="my-[0.1rem] text-gray-600 dark:text-gray-400" key={i}>
            {str}
          </p>
        ))}

        <h2>Skill Map</h2>
        <SkillMapWrapper />

        <h2>Certification</h2>
        <ul>
          <li>
            <ExternalLink
              href={
                "https://www.credly.com/badges/122e88cb-c759-469d-908b-d5a010882623/public_url"
              }
            >
              {t.ABOUT.CERTIFICATION[0]}
            </ExternalLink>
          </li>
        </ul>

        <h2>Links</h2>
        <ul>
          <li>
            GitHub:{" "}
            <ExternalLink href="https://github.com/yuuki1036">
              @yuuki1036
            </ExternalLink>
          </li>
          <li>
            Stackshare:{" "}
            <ExternalLink href="https://stackshare.io/yuuki1036/my-stack">
              https://stackshare.io/yuuki1036/my-stack
            </ExternalLink>
          </li>
          <li>
            Website:{" "}
            <ExternalLink href="https://yuuki1036.com">{SITE_URL}</ExternalLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
