type Props = { title: string; sentences: string[] };

const WorksItemNormal = ({ title, sentences }: Props) => {
  return (
    <div className="mt-8">
      <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
        {title}
      </h3>
      {sentences.map((sentence, i) => (
        <p key={i} className="text-gray-600 dark:text-gray-400">
          {sentence}
        </p>
      ))}
    </div>
  );
};

export default WorksItemNormal;
