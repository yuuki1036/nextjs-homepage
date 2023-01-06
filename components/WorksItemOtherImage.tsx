import Image from 'next/image';

type Props = {
  title: string;
  slug: string;
};

const WorksItemOtherImage = ({ title, slug }: Props) => {
  const src = `/images/works/${slug}-add.png`;
  return (
    <div className="mt-10">
      <Image
        alt={title}
        height={252}
        width={448}
        src={src}
        priority
        className="rounded-lg border-2 border-gray-300"
      />
    </div>
  );
};

export default WorksItemOtherImage;
