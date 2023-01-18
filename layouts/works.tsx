import { Suspense } from "react";
import Container from "components/Container";
import { TWorks } from "lib/types";
import WorksItemNormal from "components/WorksItemNormal";
import WorksItemSpec from "components/WorksItemSpec";
import WorksItemTitle from "components/WorksItemTitle";
import WorksItemMainImage from "components/WorksItemMainImage";
import WorksItemOtherImage from "components/WorksItemOtherImage";
import { useRouter } from "next/router";
import { UseLocale } from "lib/hook/useLocale";

type Props = {
  post: TWorks;
};

const WorksLayout = ({ post }: Props) => {
  const { locale, t } = UseLocale();
  return (
    <Container
      pageName={post.title}
      description={post.overView}
      date={new Date(post.date).toISOString()}
      type="article"
    >
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
            <WorksItemNormal
              title="その他"
              sentences={post.others}
              isList={true}
            />
          )}
        </div>
      </article>
    </Container>
  );
};

export default WorksLayout;
