'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  isEditMode: boolean;
  year: number | string;
  data?: any;
  onChange?: (update: any) => void;
}

interface Researcher {
  userId: number;
  name: string;
  department?: string;
}

export default function YearlyTaskSection({
  isEditMode,
  year,
  data,
  onChange,
}: Props) {
  const [availableResearchers, setAvailableResearchers] = useState<
    Researcher[]
  >([]);
  const [selectedPmId, setSelectedPmId] = useState<number | null>(null);
  const [currentPm, setCurrentPm] = useState<Researcher | null>(null);
  const [members, setMembers] = useState<Researcher[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const fetchResearchers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        ?.state?.accessToken;
      if (!token) return;
      const res = await fetch(
        'https://dev-api.snuh-bmilab.ai.kr/users/search?keyword=',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const body = await res.json();
      const list =
        body?.users || body?.content || (Array.isArray(body) ? body : []);
      setAvailableResearchers(list);
    } catch (e) {
      console.error('[YearlyTaskSection] 유저 조회 실패:', e);
    }
  };

  useEffect(() => {
    if (isEditMode) fetchResearchers();
  }, [isEditMode]);

  // ✅ data 변경 감지 (JSON.stringify로 안정화)
  useEffect(() => {
    if (data && (data.managerId || data.managerName)) {
      setCurrentPm({
        userId: data.managerId,
        name: data.managerName,
      });
    } else {
      setCurrentPm(null);
    }
    setMembers(data?.members ?? []);
  }, [JSON.stringify(data)]);

  const handleAddPm = () => {
    if (!selectedPmId) return;
    const selected = availableResearchers.find(
      (r) => r.userId === selectedPmId,
    );
    if (!selected) return;
    setCurrentPm(selected);
    setSelectedPmId(null);
    onChange?.({
      managerId: selected.userId,
      managerName: selected.name,
      members,
    });
  };

  const handleRemovePm = () => {
    setCurrentPm(null);
    onChange?.({
      managerId: null,
      managerName: '',
      members,
    });
  };

  const handleAddMember = () => {
    if (!selectedMemberId) return;
    const selected = availableResearchers.find(
      (r) => r.userId === selectedMemberId,
    );
    if (!selected) return;
    if (members.some((m) => m.userId === selected.userId)) return;
    const updated = [...members, selected];
    setMembers(updated);
    setSelectedMemberId(null);
    onChange?.({
      managerId: currentPm?.userId || null,
      managerName: currentPm?.name || '',
      members: updated,
    });
  };

  const handleRemoveMember = (userId: number) => {
    const updated = members.filter((m) => m.userId !== userId);
    setMembers(updated);
    onChange?.({
      managerId: currentPm?.userId || null,
      managerName: currentPm?.name || '',
      members: updated,
    });
  };

  // ✅ 담당자 표시 보강
  const pmName =
    currentPm?.name ||
    availableResearchers.find(
      (r) => r.userId === (currentPm?.userId || data?.managerId),
    )?.name ||
    data?.managerName ||
    '담당자 미지정';

  if (!data)
    return (
      <div className="text-sm text-gray-500">연차 데이터를 불러오는 중...</div>
    );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">
        과제 담당자 및 참여자 ({year}년차)
      </h3>

      {/* ===== 담당자 ===== */}
      <div className="mb-6">
        <h4 className="text-md mb-3 font-medium text-blue-600">
          과제 담당자 (PM)
        </h4>

        {currentPm ? (
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">{pmName}</span>
              {isEditMode && (
                <button
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={handleRemovePm}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-3 text-sm text-gray-500">지정된 담당자 없음</div>
        )}

        {isEditMode && (
          <div className="flex items-center gap-2">
            <Select onValueChange={(v) => setSelectedPmId(Number(v))}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="담당자 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableResearchers.map((r) => (
                  <SelectItem key={r.userId} value={String(r.userId)}>
                    {r.name} {r.department && `(${r.department})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="bg-blue-600 text-white"
              disabled={!selectedPmId}
              onClick={handleAddPm}
            >
              <Plus className="mr-1 h-4 w-4" />
              담당자 지정
            </Button>
          </div>
        )}
      </div>

      {/* ===== 참여자 ===== */}
      <div>
        <h4 className="text-md mb-3 font-medium text-blue-600">과제 참여자</h4>
        <div className="mb-4 flex flex-wrap gap-3">
          {members.length > 0 ? (
            members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm"
              >
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800">{m.name}</span>
                {isEditMode && (
                  <button
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => handleRemoveMember(m.userId)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">참여자 없음</div>
          )}
        </div>

        {isEditMode && (
          <div className="flex items-center gap-2">
            <Select onValueChange={(v) => setSelectedMemberId(Number(v))}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="참여자 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableResearchers.map((r) => (
                  <SelectItem key={r.userId} value={String(r.userId)}>
                    {r.name} {r.department && `(${r.department})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="bg-blue-600 text-white"
              disabled={!selectedMemberId}
              onClick={handleAddMember}
            >
              <Plus className="mr-1 h-4 w-4" />
              참여자 추가
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
