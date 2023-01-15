import Image from "next/image";
import Tag from "./Tag";

type Props = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string[];
};

const WorksCard = ({ slug, title, excerpt, tag }: Props) => {
  const href = `/works/${slug}`;
  const src = `/images/works/${slug}-preview.png`;
  return (
    <a href={href} className="w-full">
      <div className="w-full mb-9 transform hover:scale-[1.01] transition-all">
        <div className="flex flex-col justify-between md:flex-row">
          <div>
            <h4 className="w-full text-lg font-medium text-gray-900 md:text-xl dark:text-gray-100">
              {title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">{excerpt}</p>
            <Tag tag={tag} />
          </div>

          <div className="hidden md:inline-block">
            <Image
              className={"image-border dark-image-layer"}
              src={src}
              alt={title}
              priority
              height={100}
              width={100}
            />
          </div>
        </div>
      </div>
    </a>
  );
};

export default WorksCard;
