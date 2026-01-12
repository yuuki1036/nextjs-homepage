import "styles/globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { Providers } from "components/Providers";
import { GA_ID } from "lib/gtag";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <link href="/favicons/favicon.ico" rel="shortcut icon" />
        <link href="/favicons/site.webmanifest" rel="manifest" />
        <link href="/favicons/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <link href="/favicons/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicons/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
        <link color="#4a9885" href="/favicons/safari-pinned-tab.svg" rel="mask-icon" />
        <meta content="#ffffff" name="theme-color" />
        <meta content="#ffffff" name="msapplication-TileColor" />
        <meta content="/favicons/browserconfig.xml" name="msapplication-config" />
        <meta
          content="max-snippet:-1, max-image-preview:large, max-video-preview:-1"
          name="robots"
        />
      </head>
      <body
        className={`${inter.variable} font-sans bg-white dark:bg-black text-black dark:text-white`}
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
