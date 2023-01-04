import Image from 'next/image';
import { parseISO, format } from 'date-fns';
import { PropsWithChildren, Suspense } from 'react';

import Container from 'components/Container';
import { TPost } from 'lib/types';
import { createRows } from 'lib/util';
import PostItemSpec from 'components/PostItemSpec';

export default function BlogLayout({
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
        <div className="mb-8 flex flex-row items-baseline justify-between w-full">
          <h1 className="text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
            {post.title}
          </h1>
          <time
            dateTime={post.date}
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            {format(parseISO(post.date), 'MMMM, yyyy')}
          </time>
        </div>

        <Image
          alt={post.title}
          height={252}
          width={448}
          src={`/images/works/${post.slug}-main.png`}
          priority
          className="rounded-lg border-2 border-gray-300"
        />

        <div className="flex flex-row flex-start mt-4">
          {post.launch && (
            <a
              aria-label="demo"
              target="_blank"
              rel="noopener noreferrer"
              href={post.launch}
            >
              <div className="flex items-center text-sm mr-7 text-gray-700 dark:text-gray-300">
                {'View demo'}
                <svg
                  className="h-4 w-4 ml-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          )}
          {post.source && (
            <a
              aria-label="source"
              target="_blank"
              rel="noopener noreferrer"
              href={post.source}
            >
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                {'View source'}
                <svg
                  className="h-4 w-4 ml-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            {'概要'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{post.overView}</p>
        </div>

        {post.chronology && (
          <div className="mt-8">
            <h3 className="text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
              {'開発経緯'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {post.chronology}
            </p>
          </div>
        )}

        <PostItemSpec spec={post.spec} />
      </article>
    </Container>
  );
}
