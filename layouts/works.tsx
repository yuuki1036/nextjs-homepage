import { PropsWithChildren, Suspense } from 'react';
import Container from 'components/Container';
import { TPost } from 'lib/types';
import WorksItemNormal from 'components/WorksItemNormal';
import WorksItemSpec from 'components/WorksItemSpec';
import WorksItemTitle from 'components/WorksItemTitle';
import WorksItemMainImage from 'components/WorksItemMainImage';
import WorksItemOtherImage from 'components/WorksItemOtherImage';

export default function WorksLayout({
  children,
  post
}: PropsWithChildren<{ post: TPost }>) {
  return (
    <Container
      title={`${post.title} – Lee Robinson`}
      description={post.excerpt}
      image={''}
      date={new Date(post.date).toISOString()}
      type="article"
    >
      <article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
        <WorksItemTitle title={post.title} date={post.date} />

        <WorksItemMainImage
          title={post.title}
          slug={post.slug}
          launch={post.launch}
          source={post.source}
        />

        <WorksItemNormal title="概要" sentences={post.overView} />

        {post.chronology && (
          <WorksItemNormal title="開発経緯" sentences={post.chronology} />
        )}

        <WorksItemSpec spec={post.spec} />

        {post.others && (
          <WorksItemNormal title="その他機能" sentences={post.others} />
        )}

        <WorksItemOtherImage title={post.title} slug={post.slug} />
      </article>
    </Container>
  );
}
