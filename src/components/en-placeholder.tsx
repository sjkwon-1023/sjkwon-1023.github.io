import Link from "next/link";

/**
 * 영어 페이지는 라우트와 언어 토글만 먼저 만들고 본문은 아직 쓰지 않았다. 빈 화면을 내보내는
 * 대신 아직 없다는 사실과 한국어로 가는 길을 명시한다. 세 페이지 모두 noindex 라 이 상태가
 * 검색 결과에 잡히지는 않는다.
 *
 * 루트 레이아웃의 <html lang="ko"> 은 그대로여서 여기서 lang="en" 으로 덮는다. 영어 본문을
 * 제대로 채울 때는 route group 으로 레이아웃을 갈라 html lang 자체를 분리하는 편이 맞다.
 */
export function EnPlaceholder({
  title,
  body,
  koHref,
}: {
  title: string;
  body: string;
  koHref: string;
}) {
  return (
    <main lang="en" className="mx-auto max-w-(--container-prose) px-6 py-24 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-fg-muted">{body}</p>
      <p className="mt-8 text-sm">
        <Link href={koHref} hrefLang="ko" className="text-accent hover:underline">
          Read this page in Korean →
        </Link>
      </p>
    </main>
  );
}
