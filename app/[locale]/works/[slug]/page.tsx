import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "lib/api";
import { getTranslations } from "lib/i18n";
import WorksItemNormal from "components/WorksItemNormal";
import WorksItemSpec from "components/WorksItemSpec";
import WorksItemTitle from "components/WorksItemTitle";
import WorksItemMainImage from "components/WorksItemMainImage";
import WorksItemOtherImage from "components/WorksItemOtherImage";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  const params: { locale: string; slug: string }[] = [];

  for (const post of posts) {
    params.push({ locale: "ja", slug: post.slug });
    params.push({ locale: "en", slug: post.slug });
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    description: post.overView.join(" "),
    openGraph: {
      title: post.title,
      description: post.overView.join(" "),
      type: "article",
      publishedTime: new Date(post.date).toISOString()
    }
  };
}

export default async function WorksDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  const t = getTranslations(locale);

  if (!post) {
    notFound();
  }

  return (
    <article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
      <WorksItemTitle title={post.title} date={post.date} />
      <div className="prose dark:prose-dark leading-6">
        <Suspense fallback={null}>
          <WorksItemMainImage
            title={post.title}
            slug={post.slug}
            launch={post.launch}
            source={post.source}
          />
        </Suspense>

        <WorksItemNormal
          title={t.WORKS.CONTENTS.OVERVIEW}
          sentences={locale === "en" ? post.overViewEn : post.overView}
          isList={false}
        />

        {post.chronology && locale === "ja" && (
          <WorksItemNormal
            title="開発経緯"
            sentences={post.chronology}
            isList={true}
          />
        )}

        <WorksItemSpec title={t.WORKS.CONTENTS.SPEC} spec={post.spec} />

        {post.otherImage && (
          <Suspense fallback={null}>
            <WorksItemOtherImage title={post.title} slug={post.slug} />
          </Suspense>
        )}

        {post.others && locale === "ja" && (
          <WorksItemNormal title="その他" sentences={post.others} isList={true} />
        )}
      </div>
    </article>
  );
}
