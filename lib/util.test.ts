import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contactErrorKey, getRecaptchaToken, withTimeout } from "./util";

type Execute = (action: string) => Promise<string>;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Scenario 7: reCAPTCHA が使えない送信者も問い合わせを送れる（getRecaptchaToken）", () => {
  it("3 秒たっても準備が整わなければ空文字", async () => {
    const token = getRecaptchaToken(() => undefined);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(token).resolves.toBe("");
  });

  it("準備が 3 秒の手前（2.9 秒）で整えばトークンを取る", async () => {
    let execute: Execute | undefined;
    setTimeout(() => {
      execute = async (action) => `late-${action}`;
    }, 2900);
    const token = getRecaptchaToken(() => execute);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(token).resolves.toBe("late-contact");
  });

  it("発行が 5 秒で終わらなければ空文字", async () => {
    const token = getRecaptchaToken(() => () => new Promise<string>(() => {}));
    await vi.advanceTimersByTimeAsync(5000);
    await expect(token).resolves.toBe("");
  });

  it("発行が 5 秒の手前（4.9 秒）で終わればトークンを返す", async () => {
    const slow: Execute = (action) =>
      new Promise((resolve) => setTimeout(() => resolve(`slow-${action}`), 4900));
    const token = getRecaptchaToken(() => slow);
    await vi.advanceTimersByTimeAsync(4900);
    await expect(token).resolves.toBe("slow-contact");
  });

  it.each<[string, Execute]>([
    [
      "同期で throw",
      () => {
        throw new Error("no provider");
      }
    ],
    ["reject", () => Promise.reject(new Error("x"))],
    ["文字列以外", (async () => null) as unknown as Execute]
  ])("発行が %s なら空文字", async (_label, execute) => {
    await expect(getRecaptchaToken(() => execute)).resolves.toBe("");
  });

  it("発行できればトークンを返す", async () => {
    await expect(getRecaptchaToken(() => async (action) => `tok-${action}`)).resolves.toBe(
      "tok-contact"
    );
  });
});

describe("withTimeout", () => {
  it("時間内に終われば値を返す", async () => {
    const result = withTimeout(
      new Promise<string>((resolve) => setTimeout(() => resolve("ok"), 50)),
      100
    );
    await vi.advanceTimersByTimeAsync(50);
    await expect(result).resolves.toBe("ok");
  });

  it("reject は null", async () => {
    await expect(withTimeout(Promise.reject(new Error("x")), 100)).resolves.toBeNull();
  });

  it("時間切れは null", async () => {
    const result = withTimeout(new Promise<string>(() => {}), 100);
    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBeNull();
  });
});

describe("Scenario 5: 応答のステータスを画面のエラー表示に対応させる（contactErrorKey）", () => {
  it.each<[number | null, ReturnType<typeof contactErrorKey>]>([
    [400, "VAL"],
    [429, "RATE"],
    [500, "SYS"],
    [503, "SYS"],
    [null, "SYS"]
  ])("%s → %s", (status, expected) => {
    expect(contactErrorKey(status)).toBe(expected);
  });
});
