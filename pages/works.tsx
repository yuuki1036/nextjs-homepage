import { Suspense } from "react";
import Container from "components/Container";
import { InferGetStaticPropsType } from "next";
import { getAllPosts } from "lib/api";
import WorksCard from "components/WorksCard";
import { UseLocale } from "lib/hook/useLocale";

export default function Works({
  posts
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { locale, t } = UseLocale();
  return (
    <Suspense fallback={null}>
      <Container pageName="Works" description={t.WORKS.SUMMARY}>
        <div className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
            Works
          </h1>
          <p className="mb-16 text-gray-600 dark:text-gray-400">
            {t.WORKS.SUMMARY}
          </p>
          <Suspense fallback={null}>
            {posts.map((post) => (
              <WorksCard
                key={post.title}
                slug={post.slug}
                title={post.title}
                excerpt={locale === "en" ? post.excerptEn : post.excerpt}
                tag={post.tag}
              />
            ))}
          </Suspense>
        </div>
      </Container>
    </Suspense>
  );
}

export const getStaticProps = async () => {
  const posts = getAllPosts();

  return {
    props: { posts }
  };
};
