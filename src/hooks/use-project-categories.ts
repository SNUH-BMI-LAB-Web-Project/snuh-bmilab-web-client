import { useQuery } from '@tanstack/react-query';
import { ProjectCategoryControllerApi } from '@/generated-api/apis/ProjectCategoryControllerApi';
import { getApiConfig } from '@/lib/config';

const categoryApi = new ProjectCategoryControllerApi(getApiConfig());

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
