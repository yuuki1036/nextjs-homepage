import fs from "fs";
import { join } from "path";
import { TPost } from "./types";

const postsDirectory = join(process.cwd(), "_posts");

export const getPostSlugs = () => {
  return fs.readdirSync(postsDirectory);
};

export const getPostBySlug = (slug: string) => {
  const realSlug = slug.replace(/\.json$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.json`);

  const fileContent: string = fs.readFileSync(fullPath, "utf8");
  const post: TPost = {
    slug: realSlug,
    ...JSON.parse(fileContent)
  };
  post.slug = realSlug;

  return post;
};

export const getAllPosts = () => {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
};
