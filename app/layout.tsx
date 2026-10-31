import "styles/globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";
import { Providers } from "components/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "ja";
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicons/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          content="max-snippet:-1, max-image-preview:large, max-video-preview:-1"
          name="robots"
        />
      </head>
      <body
        className={`${inter.variable} font-sans bg-white dark:bg-black text-black dark:text-white`}
      >
        <Providers nonce={nonce}>
          {children}
          <Analytics />
        </Providers>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} nonce={nonce} />}
    </html>
  );
}
