import { GetAllRssAssignmentsSearchTypeEnum } from '@/generated-api';

export const rssSearchTypeLabelMap: Record<
  GetAllRssAssignmentsSearchTypeEnum,
  string
> = {
  TITLE: '제목',
  ORGANIZATION: '작성기관',
  DEPARTMENT: '부처',
};

export const rssSearchTypeOptions = Object.entries(rssSearchTypeLabelMap).map(
  ([value, label]) => ({
    value,
    label,
  }),
);
