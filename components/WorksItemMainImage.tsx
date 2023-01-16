import ExternalLink from "./ExternalLink";
import ExternalLinkIcon from "./ExternalLinkIcon";
import Image from "./Image";

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
        className={"image-border dark-image-layer"}
        src={src}
        alt={title}
        priority
        width={448}
        height={252}
      />

      <div className="flex flex-row flex-start mt-4">
        {launch && (
          <ExternalLink href={launch} className="no-underline">
            <div className="flex items-center text-sm mr-7 text-gray-700 dark:text-gray-300">
              {"View demo"}
              <ExternalLinkIcon />
            </div>
          </ExternalLink>
        )}

        {source && (
          <ExternalLink href={source} className="no-underline">
            <div className="flex items-center text-sm mr-7 text-gray-700 dark:text-gray-300">
              {"View source"}
              <ExternalLinkIcon />
            </div>
          </ExternalLink>
        )}
      </div>
    </>
  );
};

export default WorksItemMainImage;
