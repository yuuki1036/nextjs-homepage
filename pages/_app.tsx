import "styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { Inter } from "@next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { usePageView } from "lib/usePageView";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export default function App({ Component, pageProps }: AppProps) {
  // GoogleAnalyticsのPVをカウントするhook
  usePageView();
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY}
      language="ja"
    >
      <ThemeProvider attribute="class">
        <main className={`${inter.variable} font-sans`}>
          <Component {...pageProps} />
          <Analytics />
        </main>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  );
}
