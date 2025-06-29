import { useQuery } from '@tanstack/react-query';
import { ProjectCategoryControllerApi } from '@/generated-api/apis/ProjectCategoryControllerApi';
import { Configuration } from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';

const categoryApi = new ProjectCategoryControllerApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

export const useProjectCategories = () => {
  return useQuery({
    queryKey: ['projectCategories'],
    queryFn: async () => {
      const res = await categoryApi.getAllProjectCategories();
      return res.categories;
    },
    refetchOnWindowFocus: false,
  });
};
