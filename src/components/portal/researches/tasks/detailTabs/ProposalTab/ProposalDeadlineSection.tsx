'use client';

import { Input } from '@/components/ui/input';

interface Props {
  isEditMode: boolean;
  editData?: any;
  setEditData?: (data: any) => void;
  taskInfo?: any;
}

export default function ProposalDeadlineSection({
  isEditMode,
  editData,
  setEditData,
  taskInfo,
}: Props) {
  const alwaysBlackInput =
    'bg-white text-black border-gray-300 [&:disabled]:text-black [&:disabled]:opacity-100';

  const raw = editData?.proposalDeadline ?? taskInfo?.proposalDeadline ?? '';
  let datePart = '';
  let timePart = '';

  if (raw) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const tz = d.getTimezoneOffset() * 60000;
      const local = new Date(d.getTime() - tz);
      const iso = local.toISOString();
      datePart = iso.slice(0, 10);
      timePart = iso.slice(11, 16);
    }
  }

  const handleDateChange = (value: string) => {
    const currentTime = timePart || '00:00';
    if (!value) return;
    const combined = new Date(`${value}T${currentTime}:00`);
    setEditData?.((prev: any) => ({
      ...prev,
      proposalDeadline: combined.toISOString(),
    }));
  };

  const handleTimeChange = (value: string) => {
    const currentDate = datePart || new Date().toISOString().slice(0, 10);
    if (!value) return;
    const combined = new Date(`${currentDate}T${value}:00`);
    setEditData?.((prev: any) => ({
      ...prev,
      proposalDeadline: combined.toISOString(),
    }));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">제안서 제출 마감일</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-600">
            마감 날짜
          </label>
          <Input
            type="date"
            className={alwaysBlackInput}
            value={datePart}
            disabled={!isEditMode}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-600">
            마감 시간
          </label>
          <Input
            type="time"
            className={alwaysBlackInput}
            value={timePart}
            disabled={!isEditMode}
            onChange={(e) => handleTimeChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
