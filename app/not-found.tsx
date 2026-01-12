import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="mb-10 font-bold text-3xl md:text-5xl tracking-tight text-black dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="mb-10 text-gray-600 dark:text-gray-400">
          お探しのページは見つかりませんでした。URLが間違っている可能性があります。
          <br />
          The cosmic object you are looking for has disappeared beyond the event
          horizon.
        </p>
        <Link
          href="/ja"
          className="p-4 w-64 inline-block font-bold bg-gray-200 dark:bg-gray-800 text-center rounded-md text-black dark:text-white hover:ring-2 ring-gray-300 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
