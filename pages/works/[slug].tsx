import WorksLayout from "layouts/works";
import { getAllPosts, getPostBySlug } from "lib/api";
import { TWorks } from "lib/types";
import { NextPage } from "next";
import Error from "next/error";
import { useRouter } from "next/router";

type Props = {
  post: TWorks;
};

const WorksPage: NextPage<Props> = ({ post }) => {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <Error statusCode={404} />;
  }

  return <WorksLayout post={post} />;
};

export default WorksPage;

export async function getStaticPaths() {
  const posts = getAllPosts();
  const paths = posts.map((posts) => ({
    params: {
      slug: posts.slug
    },
    locale: "ja"
  }));
  paths.push(...paths.map((path) => ({ ...path, locale: "en" })));
  return {
    paths,
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
