type Props = {
  tag: string[];
};

const Tag = ({ tag }: Props) => (
  <>
    {tag.map((value, i) => (
      <span
        key={i}
        className="text-gray-600 dark:text-gray-400 text-xs border-[1px] border-gray-400 dark:border-gray-600 mr-2 px-2 py-0.5"
      >
        {value}
      </span>
    ))}
  </>
);

export default Tag;
