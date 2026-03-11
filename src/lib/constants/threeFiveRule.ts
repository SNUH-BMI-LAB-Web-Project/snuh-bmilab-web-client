/**
 * 3책5공 필드 enum (API와 동일)
 * - RESPONSIBLE: 책임
 * - JOINT: 공동
 * - NOT_APPLICABLE: 해당없음
 */
export const THREE_FIVE_RULE = {
  RESPONSIBLE: 'RESPONSIBLE',
  JOINT: 'JOINT',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;

export type ThreeFiveRuleType =
  (typeof THREE_FIVE_RULE)[keyof typeof THREE_FIVE_RULE];

/** enum → 한글 라벨 */
export const THREE_FIVE_RULE_LABEL: Record<ThreeFiveRuleType, string> = {
  [THREE_FIVE_RULE.RESPONSIBLE]: '책임',
  [THREE_FIVE_RULE.JOINT]: '공동',
  [THREE_FIVE_RULE.NOT_APPLICABLE]: '해당없음',
};

/** 한글 라벨 → enum (폼 선택용) */
export const THREE_FIVE_RULE_OPTIONS: {
  value: ThreeFiveRuleType;
  label: string;
}[] = [
  { value: THREE_FIVE_RULE.RESPONSIBLE, label: '책임' },
  { value: THREE_FIVE_RULE.JOINT, label: '공동' },
  { value: THREE_FIVE_RULE.NOT_APPLICABLE, label: '해당없음' },
];

const VALID_THREE_FIVE_RULE = new Set<string>([
  THREE_FIVE_RULE.RESPONSIBLE,
  THREE_FIVE_RULE.JOINT,
  THREE_FIVE_RULE.NOT_APPLICABLE,
]);

/**
 * API 전송/응답용: null·빈 문자열·잘못된 값을 NOT_APPLICABLE로 정규화.
 * 백엔드 ThreeFiveRuleType enum과 동일한 값만 허용 (500 InvalidDataAccessApiUsageException 방지).
 */
export function normalizeThreeFiveRuleForApi(
  value: string | null | undefined,
): ThreeFiveRuleType {
  if (value == null || value === '') return THREE_FIVE_RULE.NOT_APPLICABLE;
  const v = String(value).toUpperCase();
  if (VALID_THREE_FIVE_RULE.has(v)) return v as ThreeFiveRuleType;
  return THREE_FIVE_RULE.NOT_APPLICABLE;
}

export function getThreeFiveRuleLabel(
  value: ThreeFiveRuleType | string | undefined | null,
): string {
  if (value == null || value === '') return '-';
  return THREE_FIVE_RULE_LABEL[value as ThreeFiveRuleType] ?? value;
}
