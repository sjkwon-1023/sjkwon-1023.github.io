import Link from "next/link";

export default function EnglishNotFound() {
  return (
    <main
      lang="en"
      className="mx-auto flex max-w-(--container-prose) flex-col items-start px-6 py-24 md:px-8"
    >
      <p className="font-mono text-sm text-fg-muted">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-fg-muted">The page may have moved or no longer exists.</p>
      <div className="mt-6 flex gap-5 text-sm">
        <Link href="/en/" className="text-accent hover:underline">
          Home
        </Link>
        <Link href="/en/projects/" className="text-accent hover:underline">
          Projects
        </Link>
      </div>
    </main>
  );
}
