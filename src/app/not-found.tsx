import Link from "next/link";

/** 정적 export 시 out/404.html 로 나가고, GitHub Pages 가 그대로 404 페이지로 쓴다. */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-(--container-prose) flex-col items-start px-6 py-24 md:px-8">
      <p className="font-mono text-sm text-fg-muted">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-fg-muted">
        주소가 바뀌었거나 삭제된 글일 수 있습니다.
      </p>
      <div className="mt-6 flex gap-5 text-sm">
        <Link href="/" className="text-accent hover:underline">
          홈으로
        </Link>
        <Link href="/blog/" className="text-accent hover:underline">
          글 목록
        </Link>
      </div>
    </main>
  );
}
