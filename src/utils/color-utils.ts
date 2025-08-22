// HEX 색상을 30% 투명도로 변환하는 함수
export function hexToRgbaWithOpacity(hex: string, opacity = 0.3): string {
  const cleanHex = hex.replace('#', '');
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  const r = Number.parseInt(fullHex.substr(0, 2), 16);
  const g = Number.parseInt(fullHex.substr(2, 2), 16);
  const b = Number.parseInt(fullHex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
