import Link from "next/link";
import Container from "components/Container";

export default function NotFound() {
  return (
    <Container pageName="404">
      <div className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16">
        <h1 className="mb-10 font-bold text-3xl md:text-5xl tracking-tight text-black dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="mb-10 text-gray-600 dark:text-gray-400">
          お探しのページは見つかりませんでした。URLが間違っている可能性があります。
          <br></br>
          The cosmic object you are looking for has disappeared beyond the event
          horizon.
        </p>
        <Link
          href="/"
          className="p-1 sm:p-4 w-64 font-bold mx-auto bg-gray-200 dark:bg-gray-800 text-center rounded-md text-black dark:text-white"
        >
          Return Home
        </Link>
      </div>
    </Container>
  );
}
