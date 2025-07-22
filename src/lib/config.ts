import { Configuration } from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { customFetch } from '@/lib/custom-fetch';

export const getApiConfig = () =>
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, ''),
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
    fetchApi: customFetch, // fetch 대체
  });
