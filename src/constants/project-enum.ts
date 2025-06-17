import {
  GetAllProjectsCategoryEnum,
  GetAllProjectsStatusEnum,
} from '@/generated-api/apis/ProjectApi';

// 연구 상태 → 라벨
export const PROJECT_STATUS_LABELS: Record<GetAllProjectsStatusEnum, string> = {
  PENDING: '진행 전',
  IN_PROGRESS: '진행 중',
  COMPLETED: '진행 종료',
  WAITING: '진행 대기',
};

// 연구 상태 → 스타일
export const PROJECT_STATUS_CLASSES: Record<GetAllProjectsStatusEnum, string> =
  {
    PENDING: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    IN_PROGRESS: 'bg-green-100 text-green-800 hover:bg-green-100',
    COMPLETED: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    WAITING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  };

// 연구 분야 → 라벨
export const PROJECT_CATEGORY_LABELS: Record<
  GetAllProjectsCategoryEnum,
  string
> = {
  BIOINFORMATICS: 'Bioinformatics',
  AI_PATHOLOGY: 'Medical AI (Pathology)',
  AI_SIGNAL_DATA: 'Medical AI (Signal data)',
  BIG_DATA: 'Medical Big Data',
  NLP: 'NLP',
};
