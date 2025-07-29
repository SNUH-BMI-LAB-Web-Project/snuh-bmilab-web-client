'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YearMonthPickerProps {
  value: { year: number; month: number } | null;
  onChange: (value: { year: number; month: number } | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

export default function YearMonthPicker({
  value,
  onChange,
  placeholder = '',
  allowClear = false,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
  disabled = false,
}: YearMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempYear, setTempYear] = useState<number | null>(value?.year || null);
  const [tempMonth, setTempMonth] = useState<number | null>(
    value?.month || null,
  );

  const months = [
    { value: 1, label: '1월' },
    { value: 2, label: '2월' },
    { value: 3, label: '3월' },
    { value: 4, label: '4월' },
    { value: 5, label: '5월' },
    { value: 6, label: '6월' },
    { value: 7, label: '7월' },
    { value: 8, label: '8월' },
    { value: 9, label: '9월' },
    { value: 10, label: '10월' },
    { value: 11, label: '11월' },
    { value: 12, label: '12월' },
  ];

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  );

  const handleConfirm = () => {
    if (tempYear && tempMonth) {
      onChange({ year: tempYear, month: tempMonth });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setTempYear(null);
    setTempMonth(null);
    onChange(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempYear(value?.year || null);
    setTempMonth(value?.month || null);
    setIsOpen(false);
  };

  const formatValue = (val: { year: number; month: number } | null) => {
    if (!val) return placeholder;
    return `${val.year}년 ${val.month}월`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatValue(value)}
          {allowClear && value && (
            <X
              className="ml-auto h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-600">년도</span>
              <Select
                value={tempYear?.toString() || ''}
                onValueChange={(yearItem) => setTempYear(Number(yearItem))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="년도 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-600">월</span>
              <Select
                value={tempMonth?.toString() || ''}
                onValueChange={(monthItem) => setTempMonth(Number(monthItem))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tempYear && tempMonth && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm text-blue-800">
                선택된 날짜:{' '}
                <span className="font-semibold">
                  {tempYear}년 {tempMonth}월
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-2 border-t pt-2">
            <div className="flex gap-2">
              {allowClear && (
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <X className="mr-1 h-3 w-3" />
                  지우기
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!tempYear || !tempMonth}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
