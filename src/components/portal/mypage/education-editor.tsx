'use client';

import React, { useEffect, useState } from 'react';
import {
  UserEducationRequestTypeEnum,
  UserEducationSummary,
  UserEducationSummaryStatusEnum,
} from '@/generated-api';
import { UserApi } from '@/generated-api/apis/UserApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';
import { statusLabelMap, typeLabelMap } from '@/constants/education-enum';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
  educations?: UserEducationSummary[];
  editMode: boolean;
  userApi: UserApi;
  onRefReady?: (getter: () => UserEducationSummary[]) => void;
}

export default function EducationEditor({
  educations = [],
  editMode,
  userApi,
  onRefReady,
}: Props) {
  const [statusList, setStatusList] = useState<string[]>([]);
  const [startDates, setStartDates] = useState<string[]>([]);
  const [endDates, setEndDates] = useState<(string | undefined)[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [ids, setIds] = useState<(number | undefined)[]>([]);
  const [types, setTypes] = useState<UserEducationRequestTypeEnum[]>([]);

  useEffect(() => {
    setStatusList(
      educations.map(
        (e) => e.status ?? UserEducationSummaryStatusEnum.Enrolled,
      ),
    );
    setStartDates(educations.map((e) => e.startYearMonth ?? ''));
    setEndDates(educations.map((e) => e.endYearMonth));
    setTitles(educations.map((e) => e.title ?? ''));
    setIds(educations.map((e) => e.educationId));
    setTypes(
      educations.map((e) => e.type ?? UserEducationRequestTypeEnum.Bachelor),
    );
  }, [educations]);

  useEffect(() => {
    if (onRefReady) {
      const getter = () => {
        for (let i = 0; i < titles.length; i += 1) {
          if (titles[i].trim() === '') {
            toast.error('학교명/과정명은 비워둘 수 없습니다.');
            throw new Error('Validation error');
          }
        }

        return titles.map(
          (_, idx): UserEducationSummary => ({
            educationId: ids[idx],
            status: statusList[idx] as UserEducationSummaryStatusEnum,
            startYearMonth: startDates[idx],
            endYearMonth: endDates[idx],
            title: titles[idx].trim(),
            type: types[idx],
          }),
        );
      };
      onRefReady(getter);
    }
  }, [titles, statusList, startDates, endDates, ids]);
  const yearMonthOptions = Array.from(
    { length: 10 },
    (_, y) => 2020 + y,
  ).flatMap((year) =>
    Array.from({ length: 12 }, (_, m) => {
      const month = String(m + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      return { label: `${year}년 ${month}월`, value };
    }),
  );

  const handleDelete = async (idx: number) => {
    const id = ids[idx];
    if (id) {
      try {
        await userApi.deleteEducations({ educationId: id });
      } catch {
        console.error('학력 삭제 실패');
      }
    }

    setStatusList((prev) => prev.filter((_, i) => i !== idx));
    setStartDates((prev) => prev.filter((_, i) => i !== idx));
    setEndDates((prev) => prev.filter((_, i) => i !== idx));
    setTitles((prev) => prev.filter((_, i) => i !== idx));
    setIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setStatusList((prev) => [...prev, UserEducationSummaryStatusEnum.Enrolled]);
    setStartDates((prev) => [...prev, `${new Date().getFullYear()}-01`]);
    setEndDates((prev) => [...prev, undefined]);
    setTitles((prev) => [...prev, '']);
    setIds((prev) => [...prev, undefined]);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">학력</Label>
        {editMode && (
          <Button onClick={handleAdd} variant="outline">
            <Plus /> 학력 정보 추가
          </Button>
        )}
      </div>

      {titles.length === 0 ? (
        <div className="justfy-center text-muted-foreground flex flex-col items-center gap-2 rounded-md border px-2 py-6 text-sm">
          기재된 학력 정보가 없습니다.
        </div>
      ) : (
        titles.map((_, idx) => {
          const isEditable = editMode && ids[idx] === undefined;

          return (
            <div
              key={ids[idx] ?? `new-${idx}`}
              className="flex items-center gap-2 rounded-md border p-3"
            >
              {/* 학교명 */}
              <div className="relative w-full">
                <Input
                  disabled={!isEditable}
                  minLength={1}
                  maxLength={30}
                  className="w-full pr-16"
                  placeholder="학교 및 학과"
                  value={titles[idx]}
                  onChange={(e) =>
                    setTitles((prev) => {
                      const copy = [...prev];
                      copy[idx] = e.target.value;
                      return copy;
                    })
                  }
                />
                {isEditable && (
                  <span className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                    {titles[idx].length}/20
                  </span>
                )}
              </div>

              {/* 학위 구분 */}
              <Select
                disabled={!isEditable}
                value={types[idx] ?? UserEducationRequestTypeEnum.Bachelor} // 기본값 'BACHELOR'
                onValueChange={(val) =>
                  setTypes((prev) => {
                    const copy = [...prev];
                    copy[idx] = val as UserEducationRequestTypeEnum;
                    return copy;
                  })
                }
              >
                <SelectTrigger className="min-w-[110px]">
                  <SelectValue placeholder="구분" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabelMap).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 상태 */}
              <Select
                disabled={!isEditable}
                value={statusList[idx]}
                onValueChange={(val) =>
                  setStatusList((prev) => {
                    const copy = [...prev];
                    copy[idx] = val;
                    return copy;
                  })
                }
              >
                <SelectTrigger className="min-w-[100px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabelMap).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 시작 */}
              <Select
                disabled={!isEditable}
                value={startDates[idx]}
                onValueChange={(val) =>
                  setStartDates((prev) => {
                    const copy = [...prev];
                    copy[idx] = val;
                    return copy;
                  })
                }
              >
                <SelectTrigger className="min-w-[130px]">
                  <SelectValue placeholder="시작 연월" />
                </SelectTrigger>
                <SelectContent>
                  {yearMonthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 종료 */}
              <Select
                disabled={!isEditable}
                value={endDates[idx] ?? ''}
                onValueChange={(val) =>
                  setEndDates((prev) => {
                    const copy = [...prev];
                    copy[idx] = val === '' ? undefined : val;
                    return copy;
                  })
                }
              >
                <SelectTrigger className="min-w-[130px]">
                  <SelectValue placeholder="종료 연월" />
                </SelectTrigger>
                <SelectContent>
                  {yearMonthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 삭제 */}
              {editMode && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(idx)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
