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

export function canEditProject(
  leaderIds: string[], // 책임자 id 배열
  participantIds: string[], // 참여자 id 배열
  authorId: string, // 작성자 id
  currentUserId: string, // 현재 사용자 id
): boolean {
  return (
    leaderIds.includes(currentUserId) ||
    participantIds.includes(currentUserId) ||
    currentUserId === authorId
  );
}

export function canDeleteProject(
  leaderIds: string[],
  authorId: string,
  currentUserId: string,
): boolean {
  return leaderIds.includes(currentUserId) || currentUserId === authorId;
}
