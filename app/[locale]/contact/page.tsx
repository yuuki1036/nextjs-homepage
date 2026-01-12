import type { Metadata } from "next";
import { getTranslations } from "lib/i18n";
import ContactForm from "components/ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale);

  return {
    title: "Contact",
    description: t.CONTACT.SUMMARY
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16 w-full">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
        Contact
      </h1>
      <p className="mb-16 text-gray-600 dark:text-gray-400">{t.CONTACT.SUMMARY}</p>
      <ContactForm locale={locale} />
    </div>
  );
}
