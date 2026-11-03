import { describe, expect, it } from "vitest";
import { getTranslations } from "./i18n";
import { contactFieldErrorText, contactSchema, type ContactMessageKey } from "./contact-schema";

type Field = "name" | "email" | "inquiry";

const VALID = { name: "山田 太郎", email: "taro@example.com", inquiry: "お見積りの相談です" };

// zodResolver と同じく、欄ごとに最初の issue の message を取る
const firstMessage = (field: Field, value: string) => {
  const result = contactSchema.safeParse({ ...VALID, [field]: value });
  if (result.success) return null;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message ?? null;
};

describe("contactSchema: 欄ごとに最初に出る訳文キー", () => {
  it.each<[string, ContactMessageKey | null, Field, string]>([
    ["名前が空", "NAME.REQUIRED", "name", ""],
    ["名前が空白だけ（trim しない）", null, "name", " "],
    ["名前 60 文字", null, "name", "あ".repeat(60)],
    ["名前 61 文字", "NAME.MAX", "name", "あ".repeat(61)],
    ["メールが空", "MAIL.REQUIRED", "email", ""],
    ["メールの形が不正", "MAIL.FORMAT", "email", "not-an-email"],
    ["メールが正しい", null, "email", "taro@example.com"],
    ["内容が空", "INQUIRY.REQUIRED", "inquiry", ""],
    ["内容 500 文字", null, "inquiry", "あ".repeat(500)],
    ["内容 501 文字", "INQUIRY.MAX", "inquiry", "あ".repeat(501)]
  ])("%s → %s", (_label, expected, field, value) => {
    expect(firstMessage(field, value)).toBe(expected);
  });
});

describe("contactFieldErrorText: 訳文キーを表示する訳文に引く", () => {
  const ja = getTranslations("ja").CONTACT.FORM;
  const en = getTranslations("en").CONTACT.FORM;

  it.each<[ContactMessageKey, string, string]>([
    ["NAME.REQUIRED", "名前を入力してください", "Please enter your name"],
    ["NAME.MAX", "60文字以内で入力してください", "Please enter up to 60 characters"],
    ["MAIL.REQUIRED", "メールアドレスを入力してください", "Please enter your email address"],
    ["MAIL.FORMAT", "メールアドレスの形式ではありません。", "Not in the form of an email address"],
    ["INQUIRY.REQUIRED", "お問い合わせ内容を入力してください", "Please enter your inquiry"],
    ["INQUIRY.MAX", "500文字以内で入力してください", "Please enter up to 500 characters"]
  ])("%s → ja「%s」/ en「%s」", (key, jaText, enText) => {
    expect(contactFieldErrorText(ja, key)).toBe(jaText);
    expect(contactFieldErrorText(en, key)).toBe(enText);
  });

  it("エラーが無ければ undefined", () => {
    expect(contactFieldErrorText(ja, undefined)).toBeUndefined();
  });

  it.each(["Invalid input", "constructor"])(
    "知らないメッセージ %s は入力誤りの汎用文",
    (message) => {
      expect(contactFieldErrorText(ja, message)).toBe("入力内容に誤りがあります。");
    }
  );
});
