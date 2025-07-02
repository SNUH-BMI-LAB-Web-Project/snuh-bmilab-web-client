'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const NONE = '__none__'; // 선택 없음 표시용 상수
const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0'),
);
const minutes = ['00', '30'];

export default function TimePicker({
  label,
  time,
  onChange,
}: {
  label: string;
  time: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [minute, setMinute] = useState<string | undefined>(undefined);

  // time 문자열 → 상태로 분해
  useEffect(() => {
    if (!time) {
      setHour(undefined);
      setMinute(undefined);
      return;
    }
    const [h, m] = time.split(':');
    setHour(h || undefined);
    setMinute(m || undefined);
  }, [time]);

  const handleHourChange = (val: string) => {
    const newHour = val === NONE ? undefined : val;
    setHour(newHour);
    if (newHour && minute) onChange(`${newHour}:${minute}`);
    else if (!newHour && minute) onChange(`:${minute}`);
    else if (newHour && !minute) onChange(`${newHour}:`);
    else onChange(undefined);
  };

  const handleMinuteChange = (val: string) => {
    const newMinute = val === NONE ? undefined : val;
    setMinute(newMinute);
    if (hour && newMinute) onChange(`${hour}:${newMinute}`);
    else if (!hour && newMinute) onChange(`:${newMinute}`);
    else if (hour && !newMinute) onChange(`${hour}:`);
    else onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {/* 시 */}
        <div className="w-full">
          <Select value={hour ?? NONE} onValueChange={handleHourChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="시" />
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width]">
              <SelectItem value={NONE}>선택 없음</SelectItem>
              {hours.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}시
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 분 */}
        <div className="w-full">
          <Select value={minute ?? NONE} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="분" />
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width]">
              <SelectItem value={NONE}>선택 없음</SelectItem>
              {minutes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}분
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
