"use client";

import { ThemeProvider } from "next-themes";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

type Props = {
  children: React.ReactNode;
};

const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY;

export function Providers({ children }: Props) {
  const content = <ThemeProvider attribute="class">{children}</ThemeProvider>;

  // reCAPTCHA キーがない場合（開発環境など）はスキップ
  if (!recaptchaKey) {
    return content;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey} language="ja">
      {content}
    </GoogleReCaptchaProvider>
  );
}
