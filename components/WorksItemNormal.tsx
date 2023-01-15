type Props = {
  title: string;
  sentences: string[];
  isList: boolean;
};

const WorksItemNormal = ({ title, sentences, isList }: Props) => {
  return (
    <div className="mt-8">
      <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
        {title}
      </h3>

      {isList ? (
        <ul>
          {sentences.map((sentence, i) => (
            <li key={i} className="text-gray-600 dark:text-gray-400">
              {sentence}
            </li>
          ))}
        </ul>
      ) : (
        sentences.map((sentence, i) => (
          <p key={i} className="text-gray-600 dark:text-gray-400">
            {sentence}
          </p>
        ))
      )}
    </div>
  );
};

export default WorksItemNormal;
