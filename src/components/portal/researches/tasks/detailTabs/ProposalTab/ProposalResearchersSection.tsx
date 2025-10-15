'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function ProposalResearchersSection({
  isEditMode,
  editData,
  setEditData,
  taskInfo,
}: Props) {
  const researchers =
    editData?.proposalWriters ?? taskInfo?.proposalWriters ?? [];
  const [availableResearchers, setAvailableResearchers] = useState<
    Researcher[]
  >([]);
  const [selectedResearcherId, setSelectedResearcherId] = useState<
    number | null
  >(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const fetchResearchers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        ?.state?.accessToken;
      const res = await fetch(`${API_BASE}/users`, {
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
  const handleAddResearcher = () => {
    if (!selectedResearcherId) return;
    const selected = availableResearchers.find(
      (r) => r.userId === selectedResearcherId,
    );
    if (!selected) return;
    setEditData?.((prev: any) => ({
      ...prev,
      proposalWriters: [...(prev.proposalWriters || []), selected],
    }));
    setSelectedResearcherId(null);
  };
  const handleRemoveResearcher = (userId: number) => {
    setEditData?.((prev: any) => ({
      ...prev,
      proposalWriters: (prev.proposalWriters || []).filter(
        (r: any) => r.userId !== userId,
      ),
    }));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">연구원 관리</h3>

      <div className="mb-4 flex flex-wrap gap-3">
        {researchers.map((r: Researcher, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1"
          >
            {r.profileImageUrl && (
              <img
                src={r.profileImageUrl}
                className="h-6 w-6 rounded-full"
                alt={r.name}
              />
            )}
            <span className="text-blue-800">{r.name}</span>
            {isEditMode && (
              <button
                className="ml-1 text-blue-600 hover:text-blue-800"
                onClick={() => handleRemoveResearcher(r.userId)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

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
