import { UserEducationSummaryStatusEnum } from '@/generated-api';

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
