'use client';

import * as React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

/** yyyy-MM-dd 문자열로만 통일해서 사용 (API 호환) */
const DISPLAY_FORMAT = 'yyyy.MM.dd';
const VALUE_FORMAT = 'yyyy-MM-dd';

/** 입력 문자열을 파싱해 유효하면 yyyy-MM-dd 반환, 아니면 null */
function parseDateString(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // 이미 yyyy-MM-dd 형태
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (isValid(date))
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // yyyy.MM.dd / yyyy/MM/dd
  const dotMatch = /^(\d{4})[./](\d{1,2})[./](\d{1,2})$/.exec(trimmed);
  if (dotMatch) {
    const [, y, m, d] = dotMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (isValid(date))
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

export interface DateInputProps {
  /** yyyy-MM-dd 형식 값 */
  value?: string;
  /** 값 변경 시 (yyyy-MM-dd 문자열) */
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** 표시 포맷 (기본: yyyy.MM.dd) */
  displayFormat?: string;
}

/**
 * 날짜 입력: 캘린더 선택 + 직접 입력(텍스트) 모두 지원.
 * value/onChange는 yyyy-MM-dd 문자열로 통일.
 */
export function DateInput({
  value = '',
  onChange,
  placeholder = '날짜 입력 (예: 2025-03-05 또는 2025.03.05)',
  id,
  className,
  disabled = false,
  displayFormat = DISPLAY_FORMAT,
}: DateInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState(() =>
    value ? format(parseISO(value), displayFormat) : '',
  );

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      const d = parseISO(value);
      return isValid(d) ? d : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  const syncInputFromValue = React.useCallback(() => {
    if (value) {
      try {
        setInputText(format(parseISO(value), displayFormat));
      } catch {
        setInputText(value);
      }
    } else {
      setInputText('');
    }
  }, [value, displayFormat]);

  React.useEffect(syncInputFromValue, [syncInputFromValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);
    const parsed = parseDateString(raw);
    if (parsed && onChange) onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseDateString(inputText);
    if (parsed) {
      setInputText(format(parseISO(parsed), displayFormat));
      if (onChange) onChange(parsed);
    } else if (inputText.trim() && !value) {
      setInputText(value ? format(parseISO(value), displayFormat) : '');
    } else if (!inputText.trim() && onChange) {
      onChange('');
    }
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    if (!d) return;
    const next = format(d, VALUE_FORMAT);
    if (onChange) onChange(next);
    setInputText(format(d, displayFormat));
    setOpen(false);
  };

  return (
    <div className={cn('flex gap-1', className)}>
      <Input
        id={id}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
