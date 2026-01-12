"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import cn from "classnames";
import MobileMenuClient from "components/MobileMenuClient";

type TNavItem = { href: string; text: string; locale: string };

function NavItem({ href, text, locale }: TNavItem) {
  const pathname = usePathname();
  const localePath = `/${locale}${href === "/" ? "" : href}`;
  const isActive = pathname === localePath || (href === "/" && pathname === `/${locale}`);

  return (
    <NextLink
      href={localePath}
      className={cn(
        isActive
          ? "font-semibold text-gray-800 dark:text-gray-200"
          : "font-normal text-gray-600 dark:text-gray-400",
        "hidden md:inline-block p-1 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
      )}
    >
      <span className="capsize">{text}</span>
    </NextLink>
  );
}

type NavBarProps = {
  locale: string;
};

export default function NavBar({ locale }: NavBarProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme, systemTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // 言語切替用のパス生成
  const switchLocalePath = () => {
    const newLocale = locale === "en" ? "ja" : "en";
    // /ja/about → /en/about のように変換
    const currentPath = pathname ?? `/${locale}`;
    const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
    return `/${newLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  };

  return (
    <div className="flex flex-col justify-center px-8">
      <nav className="flex items-center justify-between w-full relative max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pt-8 pb-8 sm:pb-16 text-gray-900 bg-gray-50 dark:bg-gray-900 bg-opacity-60 dark:text-gray-100">
        <a href="#skip" className="skip-nav">
          Skip to content
        </a>
        <div className="ml-[-0.60rem]">
          <MobileMenuClient locale={locale} />
          <NavItem href="/" text="Home" locale={locale} />
          <NavItem href="/works" text="Works" locale={locale} />
          <NavItem href="/service" text="Service" locale={locale} />
          <NavItem href="/about" text="About" locale={locale} />
          <NavItem href="/contact" text="Contact" locale={locale} />
        </div>
        <div className="flex flex-row">
          <NextLink
            href={switchLocalePath()}
            aria-label="Switch Language"
            className="mr-4 w-16 h-9 text-sm text-gray-600 dark:text-gray-200 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300 transition-all"
          >
            {locale === "en" ? "日本語" : "English"}
          </NextLink>
          <button
            aria-label="Toggle Dark Mode"
            type="button"
            className="w-9 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300 transition-all"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 text-gray-800 dark:text-gray-200"
              >
                {systemTheme === "dark" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                )}
              </svg>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
