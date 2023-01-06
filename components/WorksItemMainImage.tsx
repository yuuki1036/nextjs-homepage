import Image from 'next/image';

type Props = {
  title: string;
  slug: string;
  launch?: string;
  source?: string;
};

const WorksItemMainImage = ({ title, slug, launch, source }: Props) => {
  const src = `/images/works/${slug}-main.png`;
  return (
    <>
      <Image
        alt={title}
        height={252}
        width={448}
        src={src}
        priority
        className="rounded-lg border-2 border-gray-300"
      />

      <div className="flex flex-row flex-start mt-4">
        {launch && (
          <a
            aria-label="demo"
            target="_blank"
            rel="noopener noreferrer"
            href={launch}
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

        {source && (
          <a
            aria-label="source"
            target="_blank"
            rel="noopener noreferrer"
            href={source}
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
    </>
  );
};

export default WorksItemMainImage;
