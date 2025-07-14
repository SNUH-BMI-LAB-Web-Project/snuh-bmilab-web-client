import { toast } from 'sonner';
import { handleUnauthorizedOnce } from '@/lib/auth-error-handler';

export const customFetch: typeof fetch = async (...args) => {
  const res = await fetch(...args);

  if (!res.ok) {
    let message = 'API 요청 중 오류가 발생했습니다.';
    const { status } = res;

    try {
      const json = await res.json();

      if ('body' in json && typeof json.body?.message === 'string') {
        message = json.body.message;
      } else if (typeof json.message === 'string') {
        message = json.message;
      }

      // 401 처리
      if (status === 401) {
        if (handleUnauthorizedOnce()) {
          toast.error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }

        return await new Promise(() => {}); // 이후 코드 중단
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
