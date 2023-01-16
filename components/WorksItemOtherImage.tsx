import Image from "./Image";

type Props = {
  title: string;
  slug: string;
};

const WorksItemOtherImage = ({ title, slug }: Props) => {
  const src = `/images/works/${slug}-add.png`;
  return (
    <div className="mt-10">
      <Image
        className={"image-border dark-image-layer"}
        src={src}
        alt={title}
        width={448}
        height={252}
      />
    </div>
  );
};

export default WorksItemOtherImage;
