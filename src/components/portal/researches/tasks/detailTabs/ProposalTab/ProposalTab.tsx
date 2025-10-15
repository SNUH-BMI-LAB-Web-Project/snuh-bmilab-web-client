'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ProposalDeadlineSection from './ProposalDeadlineSection';
import ProposalResearchersSection from './ProposalResearchersSection';
import ProposalContactsSection from './ProposalContactsSection';
import ProposalFileListSection from './ProposalFileListSection';
import ProposalFinalFilesSection from './ProposalFinalFilesSection';
import ProposalMeetingSection from './ProposalMeetingSection';
import ProposalDiagramSection from './ProposalDiagramSection';

export default function ProposalTab({ taskInfo }: { taskInfo?: any }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [proposalData, setProposalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const taskId = useMemo(() => {
    if (taskInfo?.id) return Number(taskInfo.id);
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
      if (typeof parsed.state === 'string') {
        try {
          parsed.state = JSON.parse(parsed.state);
        } catch {}
      }
      return (
        parsed.state?.auth?.accessToken ||
        parsed.state?.accessToken ||
        parsed?.accessToken ||
        null
      );
    } catch {
      return null;
    }
  };

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token || !taskId) throw new Error('토큰 또는 taskId 누락');

      const res = await fetch(`${API_BASE}/tasks/${taskId}/proposal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`GET 실패 (${res.status})`);
      const data = JSON.parse(text);
      setProposalData(data);
      setEditData(data);
    } catch (err: any) {
      setErrorMessage(err.message || '데이터 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token || !taskId) throw new Error('토큰 또는 taskId 누락');

      const payload = {
        proposalDeadline: editData?.proposalDeadline ?? null,
        proposalWriterIds:
          editData?.proposalWriters?.map((r: any) => r.userId) ?? [],
        contractorContactName: editData?.contractorContactName ?? '',
        contractorContactDepartment:
          editData?.contractorContactDepartment ?? '',
        contractorContactEmail: editData?.contractorContactEmail ?? '',
        contractorContactPhone: editData?.contractorContactPhone ?? '',
        internalContactName: editData?.internalContactName ?? '',
        internalContactDepartment: editData?.internalContactDepartment ?? '',
        internalContactEmail: editData?.internalContactEmail ?? '',
        internalContactPhone: editData?.internalContactPhone ?? '',
      };

      const res = await fetch(`${API_BASE}/tasks/${taskId}/proposal`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const respText = await res.text();
      if (!res.ok) throw new Error(`PATCH 실패 (${res.status})`);
      await fetchProposal();
      setIsEditMode(false);
      alert('저장되었습니다.');
    } catch (err: any) {
      alert(`저장 실패: ${err.message}`);
    }
  };

  useEffect(() => {
    if (taskId) fetchProposal();
  }, [taskId]);

  if (loading)
    return (
      <div className="py-10 text-center text-gray-500">불러오는 중...</div>
    );
  if (errorMessage)
    return <div className="py-10 text-center text-red-600">{errorMessage}</div>;

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
                setEditData(proposalData);
              }}
            >
              취소
            </Button>
          </>
        )}
      </div>

      <ProposalDeadlineSection
        {...{ isEditMode, editData, setEditData, taskInfo: proposalData }}
      />
      <ProposalResearchersSection
        {...{ isEditMode, editData, setEditData, taskInfo: proposalData }}
      />
      <ProposalContactsSection
        {...{ isEditMode, editData, setEditData, taskInfo: proposalData }}
      />
      <ProposalFinalFilesSection
        {...{ isEditMode, editData, setEditData, taskId }}
      />
      <ProposalFileListSection
        {...{ isEditMode, editData, setEditData, taskId }}
      />
      <ProposalMeetingSection
        {...{ isEditMode, editData, setEditData, taskId }}
      />
      <ProposalDiagramSection
        {...{ isEditMode, editData, setEditData, taskId }}
      />
    </div>
  );
}
