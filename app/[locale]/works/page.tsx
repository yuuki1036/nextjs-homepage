import type { Metadata } from "next";
import { getAllPosts } from "lib/api";
import { getTranslations } from "lib/i18n";
import WorksCard from "components/WorksCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale);

  return {
    title: "Works",
    description: t.WORKS.SUMMARY
  };
}

export default async function WorksPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const posts = getAllPosts();

  return (
    <div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
        Works
      </h1>
      <p className="mb-16 text-gray-600 dark:text-gray-400">{t.WORKS.SUMMARY}</p>
      {posts.map((post) => (
        <WorksCard
          key={post.title}
          slug={post.slug}
          title={post.title}
          excerpt={locale === "en" ? post.excerptEn : post.excerpt}
          tag={post.tag}
          locale={locale}
        />
      ))}
    </div>
  );
}
