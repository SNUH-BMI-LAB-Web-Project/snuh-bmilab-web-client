import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_CLASSES,
} from '@/constants/project-enum';
import { GetAllProjectsStatusEnum } from '@/generated-api/apis/ProjectApi';

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

export function canEditProject(
  leaderIds: string[], // 실무 책임자 id 배열
  participantIds: string[], // 실무 연구자 id 배열
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
