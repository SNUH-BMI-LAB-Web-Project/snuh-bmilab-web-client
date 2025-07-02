import { UpdateUserRequestAffiliationEnum } from '@/generated-api';

export const affiliationLabelMap: Record<
  UpdateUserRequestAffiliationEnum,
  string
> = {
  PROFESSOR: '교수',
  CO_PRINCIPAL_INVESTIGATOR: '공동연구책임자',
  POSTDOCTORAL_RESEARCHER: '박사후 연구원',
  PHD_STUDENT: '대학원생-박사과정',
  MASTERS_STUDENT: '대학원생-석사과정',
  TRANSLATIONAL_MEDICINE_TRAINEE: '융합의학연수생',
  RESEARCHER_OR_INTERN: '연구원 및 인턴',
  ADMINISTRATIVE_STAFF: '행정',
};

export const affiliationOptions = [
  { value: 'none', label: '선택 없음' },
  ...Object.entries(affiliationLabelMap).map(([value, label]) => ({
    value,
    label,
  })),
];
