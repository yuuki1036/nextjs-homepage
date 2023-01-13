import Link from "next/link";

type TExternalLink = { href: string; children: any };

const ExternalLink = ({ href, children }: TExternalLink) => (
  <a
    className="text-gray-500 hover:text-gray-600 transition"
    target="_blank"
    rel="noopener noreferrer"
    href={href}
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-start max-w-2xl mx-auto w-full mb-8">
      <hr className="w-full border-1 border-gray-200 dark:border-gray-800 mb-8" />
      <div className="w-full max-w-2xl grid grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
        <div className="flex flex-col space-y-4">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-600 transition"
          >
            Home
          </Link>
          <Link
            href="/works"
            className="text-gray-500 hover:text-gray-600 transition"
          >
            Works
          </Link>
        </div>
        <div className="flex flex-col space-y-4">
          <Link
            href="/service"
            className="text-gray-500 hover:text-gray-600 transition"
          >
            Service
          </Link>
          <Link
            href="/about"
            className="text-gray-500 hover:text-gray-600 transition"
          >
            About
          </Link>
        </div>
        <div className="flex flex-col space-y-4">
          <Link
            href="/contact"
            className="text-gray-500 hover:text-gray-600 transition"
          >
            Contact
          </Link>
          <ExternalLink href="https://github.com/yuuki1036">
            GitHub
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}
