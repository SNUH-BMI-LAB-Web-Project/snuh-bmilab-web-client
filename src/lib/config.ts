import { Configuration } from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { customFetch } from '@/lib/custom-fetch';

export const getApiConfig = () =>
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
    fetchApi: customFetch, // fetch 대체
  });
