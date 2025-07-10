'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Building, RotateCcw, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkSchedulePickerProps {
  value?: WorkSchedule;
  onChange: (schedule: WorkSchedule) => void;
  disabled?: boolean;
}

export interface WorkSchedule {
  monday: { morning: string; afternoon: string };
  tuesday: { morning: string; afternoon: string };
  wednesday: { morning: string; afternoon: string };
  thursday: { morning: string; afternoon: string };
  friday: { morning: string; afternoon: string };
}

const DAYS = [
  { key: 'monday', label: '월', fullLabel: '월요일' },
  { key: 'tuesday', label: '화', fullLabel: '화요일' },
  { key: 'wednesday', label: '수', fullLabel: '수요일' },
  { key: 'thursday', label: '목', fullLabel: '목요일' },
  { key: 'friday', label: '금', fullLabel: '금요일' },
];

const DEFAULT_SCHEDULE: WorkSchedule = {
  monday: { morning: 'off', afternoon: 'off' },
  tuesday: { morning: 'off', afternoon: 'off' },
  wednesday: { morning: 'off', afternoon: 'off' },
  thursday: { morning: 'off', afternoon: 'off' },
  friday: { morning: 'off', afternoon: 'off' },
};

export default function WorkSchedulePicker({
  value = DEFAULT_SCHEDULE,
  onChange,
  disabled = false,
}: WorkSchedulePickerProps) {
  const handleTimeSlotChange = (
    day: keyof WorkSchedule,
    timeSlot: 'morning' | 'afternoon',
    workType: string,
  ) => {
    const newSchedule = {
      ...value,
      [day]: {
        ...value[day],
        [timeSlot]: workType,
      },
    };
    onChange(newSchedule);
  };

  const handleDayChange = (day: string, workType: string) => {
    const newSchedule = {
      ...value,
      [day]: {
        morning: workType,
        afternoon: workType,
      },
    };
    onChange(newSchedule);
  };

  const resetToDefault = () => {
    onChange(DEFAULT_SCHEDULE);
  };

  const getWorkOptionInfo = (v: string) => {
    if (v === 'office')
      return { value: 'office', label: '출근', icon: Building };
    if (v === 'remote') return { value: 'remote', label: '재택', icon: Home };
    return { value: 'off', label: '휴무', icon: Calendar };
  };

  const getScheduleSummary = () => {
    const summary = { office: 0, remote: 0, off: 0 };
    DAYS.forEach((day) => {
      const dayKey = day.key as keyof WorkSchedule;
      const daySchedule = value[dayKey];

      if (daySchedule.morning === 'office') {
        summary.office += 0.5;
      } else if (daySchedule.morning === 'remote') {
        summary.remote += 0.5;
      } else {
        summary.off += 0.5;
      }

      if (daySchedule.afternoon === 'office') {
        summary.office += 0.5;
      } else if (daySchedule.afternoon === 'remote') {
        summary.remote += 0.5;
      } else {
        summary.off += 0.5;
      }
    });
    return summary;
  };

  const summary = getScheduleSummary();

  // 라벨 색상 결정
  const getLabelClass = (type: string) => {
    if (type === 'office') return 'bg-blue-100 text-blue-800';
    if (type === 'remote') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetToDefault}
          disabled={disabled}
          className="bg-transparent text-xs"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          초기화
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
            <div>요일</div>
            <div className="text-center">오전</div>
            <div className="text-center">오후</div>
            <div className="text-center">하루 전체</div>
            <div className="text-center">현재 상태</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {DAYS.map((day) => {
            const dayKey = day.key as keyof WorkSchedule;
            const daySchedule = value[dayKey];
            const morningOption = getWorkOptionInfo(daySchedule.morning);
            const afternoonOption = getWorkOptionInfo(daySchedule.afternoon);

            return (
              <div
                key={day.key}
                className="grid grid-cols-5 gap-4 p-3 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {day.fullLabel}
                  </span>
                </div>

                {/* 오전 버튼들 */}
                <div className="flex items-center justify-center gap-1">
                  {/* 출근 */}
                  <Button
                    type="button"
                    variant={
                      daySchedule.morning === 'office' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleTimeSlotChange(
                        day.key as keyof WorkSchedule,
                        'morning',
                        'office',
                      )
                    }
                    disabled={disabled}
                    className={`h-7 px-2 py-1 text-xs ${
                      daySchedule.morning === 'office'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    출근
                  </Button>

                  {/* 재택 */}
                  <Button
                    type="button"
                    variant={
                      daySchedule.morning === 'remote' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleTimeSlotChange(
                        day.key as keyof WorkSchedule,
                        'morning',
                        'remote',
                      )
                    }
                    disabled={disabled}
                    className={`h-7 px-2 py-1 text-xs ${
                      daySchedule.morning === 'remote'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    재택
                  </Button>

                  {/* 휴무 */}
                  <Button
                    type="button"
                    variant={
                      !daySchedule.morning || daySchedule.morning === 'off'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleTimeSlotChange(
                        day.key as keyof WorkSchedule,
                        'morning',
                        'off',
                      )
                    }
                    disabled={disabled}
                    className={`h-7 px-2 py-1 text-xs ${
                      !daySchedule.morning || daySchedule.morning === 'off'
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    휴무
                  </Button>
                </div>

                {/* 오후 버튼들 */}
                <div className="flex items-center justify-center gap-1">
                  {/* 출근 */}
                  <Button
                    type="button"
                    variant={
                      daySchedule.afternoon === 'office' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleTimeSlotChange(
                        day.key as keyof WorkSchedule,
                        'afternoon',
                        'office',
                      )
                    }
                    disabled={disabled}
                    className={`h-7 px-2 py-1 text-xs ${
                      daySchedule.afternoon === 'office'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    출근
                  </Button>

                  {/* 재택 */}
                  <Button
                    type="button"
                    variant={
                      daySchedule.afternoon === 'remote' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleTimeSlotChange(
                        day.key as keyof WorkSchedule,
                        'afternoon',
                        'remote',
                      )
                    }
                    disabled={disabled}
                    className={`h-7 px-2 py-1 text-xs ${
                      daySchedule.afternoon === 'remote'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    재택
                  </Button>

                  {/* 휴무 */}
                  <Button
                    type="button"
                    variant={
                      !daySchedule.afternoon || daySchedule.afternoon === 'off'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleTimeSlotChange(
                        day.key as keyof WorkSchedule,
                        'afternoon',
                        'off',
                      )
                    }
                    disabled={disabled}
                    className={`h-7 px-2 py-1 text-xs ${
                      !daySchedule.afternoon || daySchedule.afternoon === 'off'
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    휴무
                  </Button>
                </div>

                {/* 하루 전체 셀렉트 */}
                <div className="flex items-center justify-center">
                  <Select
                    value={
                      daySchedule.morning === daySchedule.afternoon
                        ? daySchedule.morning || 'off'
                        : 'mixed'
                    }
                    onValueChange={(val) => {
                      if (val !== 'mixed') {
                        handleDayChange(day.key, val);
                      }
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-7 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">출근</SelectItem>
                      <SelectItem value="remote">재택</SelectItem>
                      <SelectItem value="off">휴무</SelectItem>
                      {daySchedule.morning !== daySchedule.afternoon && (
                        <SelectItem value="mixed" disabled>
                          혼합
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 상태 라벨 */}
                <div className="flex items-center justify-center gap-2">
                  <div className="text-center">
                    <div className="mb-1 text-xs text-gray-600">오전</div>
                    <div
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${getLabelClass(morningOption.value)}`}
                    >
                      {React.createElement(morningOption.icon, {
                        className: 'h-3 w-3',
                      })}
                      {morningOption.label}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-xs text-gray-600">오후</div>
                    <div
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${getLabelClass(afternoonOption.value)}`}
                    >
                      {React.createElement(afternoonOption.icon, {
                        className: 'h-3 w-3',
                      })}
                      {afternoonOption.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-6 rounded-lg bg-gray-50 p-4 text-sm">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-600" />
          <span className="text-gray-600">출근:</span>
          <span className="font-semibold text-blue-900">
            {summary.office}일
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">재택:</span>
          <span className="font-semibold text-green-900">
            {summary.remote}일
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">휴무:</span>
          <span className="font-semibold text-gray-900">{summary.off}일</span>
        </div>
      </div>
    </div>
  );
}
