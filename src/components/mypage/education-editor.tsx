'use client';

import React, { useEffect, useState } from 'react';
import { UserEducationSummary } from '@/generated-api';
import { toast } from 'sonner';
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
import { statusLabelMap } from '@/constants/education-enum';
import { Label } from '@/components/ui/label';

interface Props {
  educations?: UserEducationSummary[];
  editMode: boolean;
  onChange: (updated: UserEducationSummary[]) => void;
  userApi: UserApi;
}

type UserEducationSummaryValue =
  | string
  | number
  | undefined
  | { year?: number; monthValue?: number | undefined | null };

export default function EducationEditor({
  educations = [],
  editMode,
  onChange,
  userApi,
}: Props) {
  const [localEdus, setLocalEdus] = useState(educations);

  const handleChange = (
    idx: number,
    key: keyof UserEducationSummary,
    value: UserEducationSummaryValue,
  ) => {
    const updated = [...localEdus];
    updated[idx] = { ...updated[idx], [key]: value };
    setLocalEdus(updated);
    onChange?.(updated);
  };

  useEffect(() => {
    setLocalEdus(educations);
  }, [educations]);

  const handleDelete = async (educationId?: number) => {
    if (!educationId) return;
    try {
      await userApi.deleteEducations({ educationId });
      setLocalEdus((prev) => prev.filter((e) => e.educationId !== educationId));
      toast.success('삭제 완료');
    } catch {
      toast.error('삭제 실패');
    }
  };

  const handleAdd = () => {
    const newEdu: UserEducationSummary = {
      title: '',
      startYearMonth: { year: new Date().getFullYear(), monthValue: 1 },
      endYearMonth: { year: undefined, monthValue: undefined },
      status: 'ENROLLED',
    };
    const updated = [...localEdus, newEdu];
    setLocalEdus(updated);
    onChange?.(updated);
  };

  const yearMonthOptions = Array.from(
    { length: 10 },
    (_, y) => 2020 + y,
  ).flatMap((year) =>
    Array.from({ length: 12 }, (_, m) => {
      const month = m + 1;
      const paddedMonth = String(month).padStart(2, '0');
      const value = `${year}-${paddedMonth}`;
      return { label: `${year}년 ${month}월`, value, year, month };
    }),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">
          학력
          <span className="text-muted-foreground text-xs font-normal">
            * 연명부에는 최종 학력만 노출됩니다.
          </span>
        </Label>

        {editMode && (
          <div className="mr-2">
            <Button onClick={handleAdd} variant="outline" size="icon">
              <Plus />
            </Button>
          </div>
        )}
      </div>

      {localEdus.map((edu, idx) => (
        <div
          key={edu.educationId ?? `new-${idx}`}
          className="flex items-center gap-2 rounded-md border p-2"
        >
          {/* 상태 */}
          <Select
            disabled={!editMode}
            value={edu.status}
            onValueChange={(value) => handleChange(idx, 'status', value)}
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

          {/* 시작 연/월 */}
          <Select
            disabled={!editMode}
            value={
              edu.startYearMonth?.year && edu.startYearMonth?.monthValue
                ? `${edu.startYearMonth.year}-${String(edu.startYearMonth.monthValue).padStart(2, '0')}`
                : ''
            }
            onValueChange={(value) => {
              const [year, month] = value.split('-').map(Number);
              handleChange(idx, 'startYearMonth', { year, monthValue: month });
            }}
          >
            <SelectTrigger className="min-w-[130px]">
              <SelectValue placeholder="시작 연도/월" />
            </SelectTrigger>
            <SelectContent>
              {yearMonthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 종료 연/월 */}
          <Select
            disabled={!editMode}
            value={
              edu.endYearMonth?.year && edu.endYearMonth?.monthValue
                ? `${edu.endYearMonth.year}-${String(edu.endYearMonth.monthValue).padStart(2, '0')}`
                : 'NULL'
            }
            onValueChange={(value) => {
              if (value === 'NULL') {
                handleChange(idx, 'endYearMonth', {
                  year: undefined,
                  monthValue: null,
                });
              } else {
                const [year, month] = value.split('-').map(Number);
                handleChange(idx, 'endYearMonth', { year, monthValue: month });
              }
            }}
          >
            <SelectTrigger className="min-w-[130px]">
              <SelectValue placeholder="종료 연도/월" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NULL">-</SelectItem>
              {yearMonthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 학교명 */}
          <Input
            disabled={!editMode}
            className="w-full"
            placeholder="학교명 / 과정명"
            value={edu.title ?? ''}
            onChange={(e) => handleChange(idx, 'title', e.target.value)}
          />

          {/* 삭제 버튼 */}
          {editMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(edu.educationId)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
