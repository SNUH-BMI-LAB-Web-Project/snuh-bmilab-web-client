import { LeaveDetailStatusEnum, LeaveDetailTypeEnum } from '@/generated-api';

export const leaveStatusLabelMap: Record<LeaveDetailStatusEnum, string> = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

export const leaveTyoeLabelMap: Record<LeaveDetailTypeEnum, string> = {
  ANNUAL: '일반 연차',
  HALF_AM: '일반 반차(오전)',
  HALF_PM: '일반 반차(오후)',
  SPECIAL_ANNUAL: '특별 연차',
  SPECIAL_HALF_AM: '특별 반차(오전)',
  SPECIAL_HALF_PM: '특별 반차(오후)',
  ALL: '랩실 전체 휴가',
};

export const leaveStatusColorMap: Record<LeaveDetailStatusEnum, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};
