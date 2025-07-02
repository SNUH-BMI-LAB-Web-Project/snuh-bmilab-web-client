import { RegisterUserRequestRoleEnum } from '@/generated-api';

export const roleLabelMap: Record<RegisterUserRequestRoleEnum, string> = {
  USER: '사용자',
  ADMIN: '관리자',
};

export const roleOptions = Object.entries(roleLabelMap).map(
  ([value, label]) => ({
    value: value as RegisterUserRequestRoleEnum,
    label,
  }),
);
