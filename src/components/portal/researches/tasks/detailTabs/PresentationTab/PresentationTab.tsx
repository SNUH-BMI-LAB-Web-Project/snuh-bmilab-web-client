'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PresentationResearchersSection from './PresentationResearchersSection';
import PresentationDeadlineSection from './PresentationDeadlineSection';
import PresentationFilesSection from './PresentationFilesSection';
import PresentationDraftSection from './PresentationDraftSection';
import PresentationEvaluationSection from './PresentationEvaluationSection';

export default function PresentationTab({ taskInfo }: { taskInfo?: any }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [presentationData, setPresentationData] = useState<any>(null);
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

  const fetchPresentation = async () => {
    try {
      const authRaw = localStorage.getItem('auth-storage');
      const token = authRaw ? JSON.parse(authRaw)?.state?.accessToken : null;

      if (!token || !taskId) return;

      const res = await fetch(
        `${API_BASE}/tasks/${taskId}/presentation?t=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);

      const data = JSON.parse(text);

      let deadlineDate = '';
      let deadlineTime = '';

      if (data.presentationDeadline) {
        const [date, timePart] = data.presentationDeadline.split('T');
        deadlineDate = date;
        deadlineTime = timePart?.slice(0, 5) ?? '';
      }

      setPresentationData({ ...data, deadlineDate, deadlineTime });
      setEditData({ presentation: { ...data, deadlineDate, deadlineTime } });
    } catch {
      toast.error('발표 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleSave = async () => {
    try {
      const authRaw = localStorage.getItem('auth-storage');
      const token = authRaw ? JSON.parse(authRaw)?.state?.accessToken : null;

      if (!token || !taskId) throw new Error('taskId 또는 토큰 누락');

      const merged = { ...(editData?.presentation ?? {}), ...(editData ?? {}) };

      const presentationDeadline =
        merged.presentationDeadline ||
        (merged.deadlineDate && merged.deadlineTime
          ? `${merged.deadlineDate}T${merged.deadlineTime}:00`
          : '');

      const presentationMakerIds =
        merged.presentationMakers
          ?.map((r: any) => r.userId)
          ?.filter((v: any) => !!v) ?? [];

      const finalPresentationFileIds =
        merged.finalPresentationFiles?.map((f: any) => f.fileId) ?? [];

      const draftPresentationFileIds =
        merged.draftPresentationFiles?.map((f: any) => f.fileId) ?? [];

      const payload = {
        presentationDeadline,
        presentationMakerIds,
        presentationDate: merged.presentationDate ?? '',
        presenter: merged.presenter ?? '',
        attendeeLimit: Number(merged.attendeeLimit) || 0,
        attendees: merged.attendees ?? '',
        presentationLocation: merged.presentationLocation ?? '',
        finalPresentationFileIds,
        draftPresentationFileIds,
      };

      const res = await fetch(`${API_BASE}/tasks/${taskId}/presentation`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`PATCH 실패 (${res.status})`);

      setIsEditMode(false);
      await fetchPresentation();
      toast.success('저장 완료');
    } catch {
      toast.error('저장 실패');
    }
  };

  useEffect(() => {
    if (taskId) fetchPresentation();
  }, [taskId]);

  if (!presentationData)
    return (
      <div className="py-10 text-center text-gray-500">
        발표 정보를 불러오는 중입니다...
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
                setEditData({ presentation: { ...presentationData } });
              }}
            >
              취소
            </Button>
          </>
        )}
      </div>

      <PresentationResearchersSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        taskInfo={presentationData}
      />

      <PresentationDeadlineSection
        isEditMode={isEditMode}
        deadlineDate={presentationData.deadlineDate}
        deadlineTime={presentationData.deadlineTime}
        setEditData={setEditData}
      />

      <PresentationFilesSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        fileType="finalPresentationFiles"
        taskId={taskId}
      />

      <PresentationDraftSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        fileType="draftPresentationFiles"
        taskId={taskId}
      />

      <PresentationEvaluationSection
        isEditMode={isEditMode}
        evaluation={editData?.presentation ?? {}}
        setEditData={setEditData}
      />
    </div>
  );
}
