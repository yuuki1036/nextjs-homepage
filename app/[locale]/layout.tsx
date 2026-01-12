import type { Metadata } from "next";
import { SITE_NAME, MY_NAME, URL as SITE_URL } from "lib/constants";
import NavBar from "components/NavBar";
import FooterClient from "components/FooterClient";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`
    },
    description:
      locale === "ja"
        ? `${MY_NAME}のポートフォリオ・ビジネスサイト`
        : `Portfolio and business site of ${MY_NAME}`,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: SITE_NAME,
      description:
        locale === "ja"
          ? `${MY_NAME}のポートフォリオ・ビジネスサイト`
          : `Portfolio and business site of ${MY_NAME}`,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: locale === "ja" ? "ja_JP" : "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description:
        locale === "ja"
          ? `${MY_NAME}のポートフォリオ・ビジネスサイト`
          : `Portfolio and business site of ${MY_NAME}`
    }
  };
}

export async function generateStaticParams() {
  return [{ locale: "ja" }, { locale: "en" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <div lang={locale} className="bg-gray-50 dark:bg-gray-900">
      <NavBar locale={locale} />
      <main
        id="skip"
        className="flex flex-col justify-center px-8 bg-gray-50 dark:bg-gray-900"
      >
        {children}
        <FooterClient locale={locale} />
      </main>
    </div>
  );
}
