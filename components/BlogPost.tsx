import Image from 'next/image';
import Link from 'next/link';
import { TypeFlags } from 'typescript';

export default function BlogPost({
  slug,
  title,
  excerpt,
  tag
}: {
  slug: string;
  title: string;
  excerpt: string;
  tag: string[];
}) {
  return (
    <Link href={`/works/${slug}`} className="w-full">
      <div className="w-full mb-9">
        <div className="flex flex-col justify-between md:flex-row">
          <div>
            <h4 className="w-full mb-1 text-lg font-medium text-gray-900 md:text-xl dark:text-gray-100">
              {title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">{excerpt}</p>
            {tag.map((v) => (
              <span
                key={v}
                className="text-gray-600 text-xs border-[1px] border-gray-400 mr-2 px-2 py-0.5"
              >
                {v}
              </span>
            ))}
          </div>

          <div className="hidden md:inline-block">
            <Image
              alt={title}
              height={100}
              width={100}
              src={`/images/works/${slug}-preview.png`}
              priority
              className="rounded-lg border-2 border-gray-300"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
