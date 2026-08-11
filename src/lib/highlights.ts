/**
 * 홈 상단에 앞세우는 성과 지표.
 *
 * 프로젝트 자체는 `content/projects/` 가 단일 출처이고, 홈에는 frontmatter 의 `featured` 가
 * 켜진 것만 요약으로 노출한다. 여기 있는 지표는 특정 프로젝트에 속하지 않는 경력 전반의
 * 성과라서 별도로 둔다.
 *
 * 모든 수치는 `data/` 의 원본에서 확인된 것만 쓴다. 홈은 가장 먼저 읽히는 곳이라 과장의
 * 대가가 가장 크다.
 */
export const metrics = [
  { value: "10% → 70%", label: "수능 영어 문항 최초 검수 합격률", context: "북아이피스" },
  { value: "약 1/10", label: "LLM 검증 비용 (PoC 기준)", context: "북아이피스" },
  { value: "20~30% → 80~90%", label: "특허명세서 생성 품질 (내부 변리사 평가 기준)", context: "Drift Patent" },
] as const;
