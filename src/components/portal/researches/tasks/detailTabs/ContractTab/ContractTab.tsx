'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ContractProposalFileSection from './ContractProposalFileSection';
import ContractSubmissionFileSection from './ContractSubmissionFileSection';
import ContractDateSection from './ContractDateSection';

export default function ContractTab({ taskInfo }: { taskInfo?: any }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const taskId = useMemo(() => {
    if (taskInfo?.id) return taskInfo.id;
    if (typeof window !== 'undefined') {
      const last = window.location.pathname.split('/').filter(Boolean).pop();
      const n = Number(last);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  }, [taskInfo?.id]);

  const getToken = () => {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.state?.accessToken || parsed.accessToken || null;
    } catch {
      return null;
    }
  };

  const fetchContract = async () => {
    try {
      const token = getToken();
      if (!token || !taskId) return;

      const res = await fetch(
        `${API_BASE}/tasks/${taskId}/agreement?t=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.ok) throw new Error(`GET 실패 (${res.status})`);

      const data = await res.json();
      setEditData({
        agreementDate: data.agreementDate ?? '',
        agreementFinalProposalFiles: data.agreementFinalProposalFiles ?? [],
        agreementFinalSubmissionFiles: data.agreementFinalSubmissionFiles ?? [],
      });
    } catch {
      toast.error('협약 정보를 불러오지 못했습니다.');
    }
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token || !taskId) return;

      const payload = {
        agreementDate: editData?.agreementDate ?? '',
        agreementFinalProposalFileIds:
          editData?.agreementFinalProposalFiles?.map((f: any) => f.fileId) ??
          [],
        agreementFinalSubmissionFileIds:
          editData?.agreementFinalSubmissionFiles?.map((f: any) => f.fileId) ??
          [],
      };

      const res = await fetch(`${API_BASE}/tasks/${taskId}/agreement`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      await fetchContract();
      setIsEditMode(false);
      toast.success('저장 완료');
    } catch {
      toast.error('저장 실패');
    }
  };

  useEffect(() => {
    if (taskId) fetchContract();
  }, [taskId]);

  if (!editData)
    return (
      <div className="py-10 text-center text-gray-500">
        협약 정보를 불러오는 중입니다...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        {!isEditMode ? (
          <Button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-600 text-white"
          >
            수정
          </Button>
        ) : (
          <>
            <Button onClick={handleSave} className="bg-green-600 text-white">
              저장
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditMode(false);
                fetchContract();
              }}
            >
              취소
            </Button>
          </>
        )}
      </div>

      <ContractDateSection
        isEditMode={isEditMode}
        contractDate={editData.agreementDate ?? ''}
        setContractDate={(v) =>
          setEditData((p: any) => ({ ...p, agreementDate: v }))
        }
      />

      <ContractProposalFileSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        fileType="agreementFinalProposalFiles"
        taskId={taskId}
      />

      <ContractSubmissionFileSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        fileType="agreementFinalSubmissionFiles"
        taskId={taskId}
      />
    </div>
  );
}
