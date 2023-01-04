import { TSpec } from 'lib/types';
import { createRows } from 'lib/util';

type Props = { spec: TSpec };

const PostItemSpec = ({ spec }: Props) => {
  const rows = createRows(spec);

  return (
    <div className="mt-8 w-full">
      <h3 className="text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
        {'開発経緯'}
      </h3>
      <table className="w-full border-collapse text-gray-600 dark:text-gray-400">
        <tbody className="w-full">
          {rows.map((row, i) => (
            <tr key={i} className="border-b-[1px]">
              <td className="text pr-40">{row.name}</td>
              <td className="text-sm">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostItemSpec;
