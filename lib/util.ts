import { TSpec } from "./types";

const createData = (name: string, value: string) => {
  return { name, value };
};

// データ構造変換
export const createRows = (specs: TSpec) => {
  return [
    ...Object.entries(specs).map(([name, value]) => createData(name, value))
  ];
};

// fetch レスポンス確認
export const checkResponse = (res: Response) => {
  if (res.ok) return;
  console.log("status:", res.status);
  console.log("statusText:", res.statusText);
  throw new Error(res.statusText);
};
