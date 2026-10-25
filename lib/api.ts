import fs from "fs";
import { join } from "path";
import { TWorks } from "./types";

const postsDirectory = join(process.cwd(), "_posts");

export const getPostSlugs = () => {
  return fs.readdirSync(postsDirectory);
};

const readPost = (fileName: string): TWorks => {
  const fileContent: string = fs.readFileSync(join(postsDirectory, fileName), "utf8");
  return {
    ...JSON.parse(fileContent),
    slug: fileName.replace(/\.json$/, "")
  };
};

// URL から来た slug は、_posts の一覧と完全一致するものだけ読む（.. や .json 付きは undefined）
export const getPostBySlug = (slug: string): TWorks | undefined => {
  const fileName = `${slug}.json`;
  if (!getPostSlugs().includes(fileName)) return undefined;
  return readPost(fileName);
};

export const getAllPosts = () => {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((fileName) => readPost(fileName))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
};
