import { RegisterUserRequestPositionEnum } from '@/generated-api';

export const positionLabelMap: Record<RegisterUserRequestPositionEnum, string> =
  {
    PROFESSOR: '교수',
    CO_PRINCIPAL_INVESTIGATOR: '공동연구책임자',
    POSTDOCTORAL_RESEARCHER: '박사후 연구원',
    PHD_STUDENT: '대학원생-박사과정',
    MASTERS_STUDENT: '대학원생-석사과정',
    TRANSLATIONAL_MEDICINE_TRAINEE: '융합의학연수생',
    RESEARCHER_OR_INTERN: '연구원 및 인턴',
    ADMINISTRATIVE_STAFF: '행정',
  };

export const positionOptions = [
  { value: 'none', label: '선택 없음' },
  ...Object.entries(positionLabelMap).map(([value, label]) => ({
    value,
    label,
  })),
];
