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
export const THREE_FIVE_RULE_OPTIONS: { value: ThreeFiveRuleType; label: string }[] = [
  { value: THREE_FIVE_RULE.RESPONSIBLE, label: '책임' },
  { value: THREE_FIVE_RULE.JOINT, label: '공동' },
  { value: THREE_FIVE_RULE.NOT_APPLICABLE, label: '해당없음' },
];

export function getThreeFiveRuleLabel(
  value: ThreeFiveRuleType | string | undefined | null,
): string {
  if (value == null || value === '') return '-';
  return THREE_FIVE_RULE_LABEL[value as ThreeFiveRuleType] ?? value;
}
