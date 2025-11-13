'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface Props {
  isEditMode: boolean;
  deadlineDate?: string;
  deadlineTime?: string;
  setEditData?: (data: any) => void;
}

export default function PresentationDeadlineSection({
  isEditMode,
  deadlineDate,
  deadlineTime,
  setEditData,
}: Props) {
  const [localDate, setLocalDate] = useState(deadlineDate ?? '');
  const [localTime, setLocalTime] = useState(deadlineTime ?? '');

  // ✅ 상위 데이터 변경 시 동기화
  useEffect(() => {
    setLocalDate(deadlineDate ?? '');
    setLocalTime(deadlineTime ?? '');
  }, [deadlineDate, deadlineTime]);

  const handleDateChange = (value: string) => {
    setLocalDate(value);
    updateParent(value, localTime);
  };

  const handleTimeChange = (value: string) => {
    setLocalTime(value);
    updateParent(localDate, value);
  };

  // ✅ 날짜 + 시간 → ISO 문자열로 합쳐서 상위 전달
  const updateParent = (date: string, time: string) => {
    if (!setEditData) return;
    const combined =
      date && time
        ? new Date(`${date}T${time}:00`).toISOString()
        : date
          ? new Date(`${date}T00:00:00`).toISOString()
          : '';

    setEditData((prev: any) => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        presentationDeadline: combined,
      },
    }));
  };

  const readModeClass = !isEditMode
    ? 'text-gray-900 pointer-events-none bg-white'
    : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        발표자료 제출 마감일
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-600">
            마감 날짜
          </label>
          <Input
            type="date"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={localDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-600">
            마감 시간
          </label>
          <Input
            type="time"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={localTime}
            onChange={(e) => handleTimeChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
