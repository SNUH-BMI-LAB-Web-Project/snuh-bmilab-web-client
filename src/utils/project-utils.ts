import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_CLASSES,
  PROJECT_CATEGORY_LABELS,
} from '@/constants/project-enum';
import {
  GetAllProjectsStatusEnum,
  GetAllProjectsCategoryEnum,
} from '@/generated-api/apis/ProjectApi';

export const getStatusLabel = (status?: GetAllProjectsStatusEnum): string => {
  if (!status) return '상태 미정';
  return PROJECT_STATUS_LABELS[status] ?? '상태 미정';
};

export const getStatusClassName = (
  status?: GetAllProjectsStatusEnum,
): string => {
  if (!status) return 'bg-muted text-muted-foreground hover:bg-muted';
  return (
    PROJECT_STATUS_CLASSES[status] ??
    'bg-muted text-muted-foreground hover:bg-muted'
  );
};

export const getCategoryLabel = (
  category?: GetAllProjectsCategoryEnum,
): string => {
  if (!category) return '카테고리 미정';
  return PROJECT_CATEGORY_LABELS[category] ?? '카테고리 미정';
};
