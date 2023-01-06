import { DARK_IMAGE_CLASS, IMAGE_BORDER_CLASS } from "lib/constants";
import Image from "next/image";

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
        width={448}
        height={252}
        src={src}
        className={`${IMAGE_BORDER_CLASS} ${DARK_IMAGE_CLASS}`}
      />
    </div>
  );
};

export default WorksItemOtherImage;
