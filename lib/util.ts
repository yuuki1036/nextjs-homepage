import type { TSpec } from "./types";
import { RECAPTCHA_ACTION } from "./recaptcha";

const createData = (name: string, value: string) => {
  return { name, value };
};

// データ構造変換
export const createRows = (specs: TSpec) => {
  return Object.entries(specs).map(([name, value]) => createData(name, value));
};

// 時間内に終わらない・reject した Promise は null にする
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T | null> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      }
    );
  });

type ExecuteRecaptcha = (action: string) => Promise<string>;

// reCAPTCHA のトークンを取る。スクリプトが遮断された・準備が終わらない・発行に失敗した
// ときは空文字を返し、送信自体は止めない（サーバー側でトークンなしとして隔離される）
export const getRecaptchaToken = async (
  getExecute: () => ExecuteRecaptcha | undefined,
  { readyTimeoutMs = 3000, executeTimeoutMs = 5000, intervalMs = 100 } = {}
): Promise<string> => {
  const deadline = Date.now() + readyTimeoutMs;
  let execute = getExecute();
  while (!execute && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    execute = getExecute();
  }
  if (!execute) return "";
  try {
    const token = await withTimeout(execute(RECAPTCHA_ACTION), executeTimeoutMs);
    return typeof token === "string" ? token : "";
  } catch {
    return "";
  }
};

// /api/sendMail の応答ステータスを画面に出すエラー文言の種類に対応させる（null は通信失敗）
export const contactErrorKey = (status: number | null): "VAL" | "RATE" | "SYS" => {
  if (status === 400) return "VAL";
  if (status === 429) return "RATE";
  return "SYS";
};
