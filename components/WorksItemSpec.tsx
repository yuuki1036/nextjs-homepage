import { TSpec } from "lib/types";
import { createRows } from "lib/util";

type Props = { spec: TSpec };

const WorksItemSpec = ({ spec }: Props) => {
  const rows = createRows(spec);

  return (
    <div className="mt-8 w-full">
      <h3 className="mb-2 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
        {"仕様"}
      </h3>

      <div className="max-w-xl text-gray-600 dark:text-gray-400 text-sm md:text-base">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex flex-row border-b border-gray-200 dark:border-gray-700 py-[0.2rem]"
          >
            <p className="basis-2/5">{row.name}</p>
            <p className="basis-3/5">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorksItemSpec;
