import Link from "next/link";

/** 한국어 라우트 안에서 notFound()가 호출됐을 때 쓰는 화면. 전역 404는 global-not-found.tsx. */
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
