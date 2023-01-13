import { Suspense } from "react";
import Container from "components/Container";
import { TWorks } from "lib/types";
import WorksItemNormal from "components/WorksItemNormal";
import WorksItemSpec from "components/WorksItemSpec";
import WorksItemTitle from "components/WorksItemTitle";
import WorksItemMainImage from "components/WorksItemMainImage";
import WorksItemOtherImage from "components/WorksItemOtherImage";

type Props = {
  post: TWorks;
};

const WorksLayout = ({ post }: Props) => (
  <Container
    title={`${post.title} – Lee Robinson`}
    description={post.excerpt}
    image={""}
    date={new Date(post.date).toISOString()}
    type="article"
  >
    <article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
      <WorksItemTitle title={post.title} date={post.date} />

      <Suspense fallback={null}>
        <WorksItemMainImage
          title={post.title}
          slug={post.slug}
          launch={post.launch}
          source={post.source}
        />
      </Suspense>

      <WorksItemNormal title="概要" sentences={post.overView} />

      {post.chronology && (
        <WorksItemNormal title="開発経緯" sentences={post.chronology} />
      )}

      <WorksItemSpec spec={post.spec} />
      {post.otherImage && (
        <Suspense fallback={null}>
          <WorksItemOtherImage title={post.title} slug={post.slug} />
        </Suspense>
      )}

      {post.others && (
        <WorksItemNormal title="その他機能" sentences={post.others} />
      )}
    </article>
  </Container>
);

export default WorksLayout;
