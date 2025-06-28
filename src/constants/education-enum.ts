import { UserEducationSummaryStatusEnum } from '@/generated-api';

export const statusLabelMap: Record<UserEducationSummaryStatusEnum, string> = {
  ENROLLED: '재학중',
  LEAVE_OF_ABSENCE: '휴학',
  GRADUATED: '졸업',
};
