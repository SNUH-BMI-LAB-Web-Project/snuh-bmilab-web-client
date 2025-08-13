import { toast } from 'sonner';

export const downloadFileFromUrl = async (
  fileName: string,
  fileUrl: string,
) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('파일 다운로드 실패');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    toast.error('파일 다운로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
};

export function ensureLocalNoon(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function toYmd(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
