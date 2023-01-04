import BlogLayout from 'layouts/blog';
import { getAllPosts, getPostBySlug } from 'lib/api';
import { TPost } from 'lib/types';
import { NextPage } from 'next';
import Error from 'next/error';
import { useRouter } from 'next/router';

type Props = {
  post: TPost;
};

const WorksPage: NextPage<Props> = ({ post }) => {
  // 404リダイレクト
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <Error statusCode={404} />;
  }

  return <BlogLayout post={post} />;
};

export default WorksPage;

export async function getStaticPaths() {
  const posts = getAllPosts();
  return {
    paths: posts.map((posts) => {
      return {
        params: {
          slug: posts.slug
        }
      };
    }),
    fallback: false
  };
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug);

  return {
    props: {
      post: {
        ...post
      }
    }
  };
}
