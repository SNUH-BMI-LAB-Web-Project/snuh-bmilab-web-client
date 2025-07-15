// 층수, 좌석 번호
export function formatSeatNumber(raw: string): string {
  const parts = raw.split('-');

  if (parts.length !== 3) return raw; // 예외 형식이면 원본 그대로 반환

  const floor = parts[1];
  const number = parts[2];

  // 층수와 좌석 번호가 모두 '00'인 경우
  if (floor === '00' && number === '00') return '좌석 정보 없음';

  // 정상 처리
  const floorFormatted = floor.replace(/^0+/, ''); // 앞자리 0 제거
  return `${floorFormatted}F-${number}`;
}

// 건물, 층수, 좌석 번호
export function formatSeatNumberDetail(raw: string): string {
  const parts = raw.split('-');

  if (parts.length !== 3) return raw; // 예외 형식이면 원본 그대로 반환

  const building = parts[0];
  const floor = parts[1];
  const number = parts[2];

  // 층수와 좌석 번호가 모두 '00'인 경우
  if (floor === '00' && number === '00') return '좌석 정보 없음';

  // 정상 처리
  const floorFormatted = floor.replace(/^0+/, ''); // 앞자리 0 제거
  return `${building}-${floorFormatted}F-${number}`;
}
