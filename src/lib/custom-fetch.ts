import { toast } from 'sonner';

export const customFetch: typeof fetch = async (...args) => {
  const res = await fetch(...args);

  if (!res.ok) {
    let message = 'API 요청 중 오류가 발생했습니다.';
    const { status } = res;

    try {
      const json = await res.json();

      // error message 추출
      if ('body' in json && typeof json.body?.message === 'string') {
        message = json.body.message;
      } else if (typeof json.message === 'string') {
        message = json.message;
      }

      // 401이면 로그인 페이지로 리디렉션
      if (status === 401) {
        toast.error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return await new Promise(() => {}); // 이후 코드 실행 중단
      }

      const error = new Error(message) as Error & { body?: never };
      error.body = json;
      throw error;
    } catch (e) {
      toast.error(message);
      throw new Error(message);
    }
  }

  return res;
};
