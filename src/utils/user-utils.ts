export function formatSeatNumber(raw: string): string {
  const parts = raw.split('-');

  if (parts.length !== 3) return raw; // 예외 형식이면 원본 그대로 반환

  const floor = parts[1].replace(/^0+/, ''); // 앞자리 0 제거
  const number = parts[2];

  return `${floor}F-${number}`;
}
