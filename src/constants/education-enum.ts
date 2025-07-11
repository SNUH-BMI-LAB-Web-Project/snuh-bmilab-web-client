import {
  UserEducationRequestTypeEnum,
  UserEducationSummaryStatusEnum,
} from '@/generated-api';

// 상태
export const statusLabelMap: Record<UserEducationSummaryStatusEnum, string> = {
  ENROLLED: '재학중',
  LEAVE_OF_ABSENCE: '휴학',
  GRADUATED: '졸업',
};

export const statusColorMap: Record<UserEducationSummaryStatusEnum, string> = {
  ENROLLED: 'bg-blue-100 text-blue-800',
  LEAVE_OF_ABSENCE: 'bg-yellow-100 text-yellow-800',
  GRADUATED: 'bg-green-100 text-green-800',
};

// 구분
export const typeLabelMap: Record<UserEducationRequestTypeEnum, string> = {
  HIGH_SCHOOL: '고등학교',
  BACHELOR: '학사',
  MASTER: '석사',
  DOCTORATE: '박사',
  MASTER_DOCTORATE: '석박통합',
};
