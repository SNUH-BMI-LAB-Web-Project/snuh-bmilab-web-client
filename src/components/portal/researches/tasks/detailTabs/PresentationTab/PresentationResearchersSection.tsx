'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, X } from 'lucide-react';

interface Researcher {
  userId: number;
  name: string;
  organization: string;
  department: string;
  profileImageUrl?: string;
}

interface Props {
  isEditMode: boolean;
  editData?: any;
  setEditData?: (data: any) => void;
  taskInfo?: any;
}

export default function PresentationResearchersSection({
  isEditMode,
  editData,
  setEditData,
  taskInfo,
}: Props) {
  // 발표 연구원 목록
  const researchers =
    editData?.presentation?.presentationMakers ??
    taskInfo?.presentationMakers ??
    [];

  // 추가 가능한 연구원 목록
  const [availableResearchers, setAvailableResearchers] = useState<
    Researcher[]
  >([]);
  const [selectedResearcherId, setSelectedResearcherId] = useState<
    number | null
  >(null);

  // ✅ 연구원 조회 API (Proposal과 동일)
  const fetchResearchers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        ?.state?.accessToken;
      const res = await fetch('https://dev-api.snuh-bmilab.ai.kr/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAvailableResearchers(data.users || []);
    } catch (err) {
      console.error('연구원 조회 실패:', err);
    }
  };

  useEffect(() => {
    if (isEditMode) fetchResearchers();
  }, [isEditMode]);

  // ✅ 연구원 추가
  const handleAddResearcher = () => {
    if (!selectedResearcherId) return;
    const selected = availableResearchers.find(
      (r) => r.userId === selectedResearcherId,
    );
    if (!selected) return;

    setEditData?.((prev: any) => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        presentationMakers: [
          ...(prev.presentation?.presentationMakers || []),
          selected,
        ],
      },
    }));

    setSelectedResearcherId(null);
  };

  // ✅ 연구원 제거
  const handleRemoveResearcher = (userId: number) => {
    setEditData?.((prev: any) => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        presentationMakers: (
          prev.presentation?.presentationMakers || []
        ).filter((r: any) => r.userId !== userId),
      },
    }));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        발표자료 제작 연구원
      </h3>

      {/* 연구원 목록 */}
      <div className="mb-4 flex flex-wrap gap-3">
        {researchers.map((r: Researcher, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm"
          >
            {r.profileImageUrl && (
              <img
                src={r.profileImageUrl}
                className="h-6 w-6 rounded-full"
                alt={r.name}
              />
            )}
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800">{r.name}</span>
            {isEditMode && (
              <button
                className="ml-1 text-blue-600 hover:text-blue-800"
                onClick={() => handleRemoveResearcher(r.userId)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 연구원 추가 */}
      {isEditMode && (
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => setSelectedResearcherId(Number(value))}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="연구원 선택" />
            </SelectTrigger>
            <SelectContent>
              {availableResearchers.map((r) => (
                <SelectItem key={r.userId} value={String(r.userId)}>
                  {r.name} ({r.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-blue-600 text-white"
            onClick={handleAddResearcher}
          >
            연구원 추가
          </Button>
        </div>
      )}
    </div>
  );
}
