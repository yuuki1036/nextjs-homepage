import { format, parseISO } from "date-fns";

type Props = { title: string; date: string };

const WorksItemTitle = ({ title, date }: Props) => {
  const formatDate = format(parseISO(date), "MMMM, yyyy");
  return (
    <div className="mb-6 flex flex-row items-baseline justify-between w-full">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
        {title}
      </h1>
      <time dateTime={date} className="text-sm text-gray-700 dark:text-gray-300">
        {formatDate}
      </time>
    </div>
  );
};

export default WorksItemTitle;
