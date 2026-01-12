import { TSpec } from "lib/types";
import { createRows } from "lib/util";

type Props = {
  title: string;
  spec: TSpec;
};

const WorksItemSpec = ({ title, spec }: Props) => {
  const rows = createRows(spec);

  return (
    <div className="mt-8 w-full">
      <h3 className="mb-2 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
        {title}
      </h3>

      <div className="max-w-xl text-gray-600 dark:text-gray-400 text-sm md:text-base">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-row border-b border-gray-200 dark:border-gray-700">
            <p className="basis-2/5 my-[0.3rem]">{row.name}</p>
            <p className="basis-3/5 my-[0.3rem]">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorksItemSpec;
