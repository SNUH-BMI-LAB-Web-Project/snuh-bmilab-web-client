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
