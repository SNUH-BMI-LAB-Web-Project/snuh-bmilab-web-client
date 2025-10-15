'use client';

import {
  differenceInYears,
  addYears,
  format,
  isBefore,
  parseISO,
} from 'date-fns';
import React from 'react';

interface ProjectPeriodProps {
  taskInfo?: {
    projectStartDate?: string;
    projectEndDate?: string;
    startDate?: string;
    endDate?: string;
    announcementStartDate?: string;
    announcementEndDate?: string;
    announcementStart?: string;
    announcementEnd?: string;
    announcementPeriod?: { start?: string; end?: string };
  } | null;
}

interface YearPeriod {
  year: number;
  startDate: string;
  endDate: string;
}

export default function ProjectPeriodSection({ taskInfo }: ProjectPeriodProps) {
  const maybeStart = [
    taskInfo?.projectStartDate,
    taskInfo?.startDate,
    taskInfo?.announcementStartDate,
    taskInfo?.announcementStart,
    taskInfo?.announcementPeriod?.start,
  ].find(Boolean);

  const maybeEnd = [
    taskInfo?.projectEndDate,
    taskInfo?.endDate,
    taskInfo?.announcementEndDate,
    taskInfo?.announcementEnd,
    taskInfo?.announcementPeriod?.end,
  ].find(Boolean);

  const startDate = maybeStart ? parseISO(String(maybeStart)) : null;
  const endDate = maybeEnd ? parseISO(String(maybeEnd)) : null;

  if (!startDate || !endDate) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          과제 기간 정보
        </h3>
        <div className="text-sm text-gray-500">
          과제 시작일과 종료일 정보가 없습니다.
        </div>
      </div>
    );
  }

  const totalYears = Math.max(1, differenceInYears(endDate, startDate) + 1);

  const yearPeriods: YearPeriod[] = Array.from(
    { length: totalYears },
    (_, index) => {
      const yearStart = addYears(startDate, index);
      const nextYearStart = addYears(startDate, index + 1);
      const yearEnd = isBefore(nextYearStart, endDate)
        ? nextYearStart
        : endDate;
      return {
        year: index + 1,
        startDate: format(yearStart, 'yyyy-MM-dd'),
        endDate: format(yearEnd, 'yyyy-MM-dd'),
      };
    },
  );

  const today = new Date();
  let currentYear = 1;

  for (let i = 0; i < yearPeriods.length; i += 1) {
    const s = parseISO(yearPeriods[i].startDate);
    const e = parseISO(yearPeriods[i].endDate);
    if (
      (s <= today && today <= e) ||
      (i === yearPeriods.length - 1 && today > e)
    ) {
      currentYear = yearPeriods[i].year;
      break;
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        과제 기간 정보
      </h3>
      <div className="mb-6 rounded-lg border border-gray-100 bg-white p-4">
        <div className="mb-2 text-sm font-medium text-gray-700">
          총 과제 기간
        </div>
        <div className="text-xl font-bold text-blue-700">
          총 {totalYears}년차 과제 (현재 {currentYear}년차 진행 중)
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {format(startDate, 'yyyy-MM-dd')} ~ {format(endDate, 'yyyy-MM-dd')}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-800">
          연차별 세부 기간
        </h4>
        {yearPeriods.map((period) => (
          <div
            key={period.year}
            className={`grid grid-cols-3 gap-8 border-b border-gray-100 py-3 pl-4 last:border-b-0 ${
              period.year === currentYear ? 'rounded-lg bg-gray-50' : ''
            }`}
          >
            <div>
              <div className="mb-1 text-sm text-gray-500">연차</div>
              <div className="text-lg font-semibold text-blue-700">
                {period.year}
                {period.year === currentYear && (
                  <span className="ml-1 text-sm text-blue-600">(현재)</span>
                )}
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm text-gray-500">시작일</div>
              <div className="text-lg text-gray-900">{period.startDate}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-gray-500">종료일</div>
              <div className="text-lg text-gray-900">{period.endDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
