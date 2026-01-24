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
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ja: `${SITE_URL}/ja`,
        en: `${SITE_URL}/en`
      }
    }
  };
}

export async function generateStaticParams() {
  return [{ locale: "ja" }, { locale: "en" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: ["ja", "en"],
        publisher: { "@id": `${SITE_URL}/#person` }
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: MY_NAME,
        url: SITE_URL,
        sameAs: ["https://github.com/yuuki1036", "https://stackshare.io/yuuki1036/my-stack"]
      }
    ]
  };

  return (
    <div lang={locale} className="bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar locale={locale} />
      <main id="skip" className="flex flex-col justify-center px-8 bg-gray-50 dark:bg-gray-900">
        {children}
        <FooterClient locale={locale} />
      </main>
    </div>
  );
}
