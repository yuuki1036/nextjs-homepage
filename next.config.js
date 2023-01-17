/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    fontLoaders: [
      { loader: "@next/font/google", options: { subsets: ["latin"] } }
    ]
  },
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "ja"
  }
};

module.exports = nextConfig;
