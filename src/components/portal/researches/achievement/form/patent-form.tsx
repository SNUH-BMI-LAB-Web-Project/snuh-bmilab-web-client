'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/common/date-picker';

import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';
import { FileUploadBox } from '@/components/portal/researches/achievement/file-upload-box';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';

import type { ProjectFileSummary } from '@/generated-api';

interface IdName {
  id: number | null;
  name: string;
}

interface PatentFormProps {
  initialData?: any;
  onCancel: () => void;
}

export function PatentForm({ initialData, onCancel }: PatentFormProps) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [applicationDate, setApplicationDate] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [patentName, setPatentName] = useState('');
  const [applicantsAll, setApplicantsAll] = useState('');
  const [remarks, setRemarks] = useState('');

  const [authorNames, setAuthorNames] = useState<string[]>([]);
  const [authorUserIds, setAuthorUserIds] = useState<number[]>([]);

  const [files, setFiles] = useState<ProjectFileSummary[]>([]);

  const [relatedProject, setRelatedProject] = useState<IdName>({
    id: null,
    name: '',
  });

  const [relatedTask, setRelatedTask] = useState<IdName>({
    id: null,
    name: '',
  });

  /* ===== 수정 모드: GET 응답 주입 ===== */
  useEffect(() => {
    if (!initialData) return;

    setApplicationDate(initialData.applicationDate ?? '');
    setApplicationNumber(initialData.applicationNumber ?? '');
    setPatentName(initialData.patentName ?? '');
    setApplicantsAll(initialData.applicantsAll ?? '');
    setRemarks(initialData.remarks ?? '');

    setAuthorNames(
      initialData.patentAuthors?.map((a: any) => a.userName) ?? [],
    );

    setAuthorUserIds(
      initialData.patentAuthors?.map((a: any) => a.userId) ?? [],
    );

    setRelatedProject({
      id: initialData.projectId ?? null,
      name: initialData.projectName ?? '',
    });

    setRelatedTask({
      id: initialData.taskId ?? null,
      name: initialData.taskName ?? '',
    });

    setFiles(
      initialData.files?.map((f: any) => ({
        fileId: f.fileId,
        fileName: f.fileName,
        size: f.size,
        uploadUrl: f.uploadUrl,
      })) ?? [],
    );
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !applicationDate ||
      !applicationNumber ||
      !patentName ||
      !applicantsAll ||
      authorUserIds.length === 0 ||
      !relatedProject.id ||
      !relatedTask.id
    ) {
      toast.error('필수 항목이 누락되었습니다.');
      return;
    }

    const authRaw = localStorage.getItem('auth-storage');
    const token = authRaw ? JSON.parse(authRaw)?.state?.accessToken : null;

    if (!token) {
      toast.error('인증 토큰이 없습니다.');
      return;
    }

    const payload = {
      applicationDate,
      applicationNumber,
      patentName,
      applicantsAll,
      patentAuthors: authorUserIds.map((id) => ({
        userId: id,
        role: '발명자',
      })),
      remarks,
      projectId: relatedProject.id,
      taskId: relatedTask.id,
      fileIds: files.map((f) => f.fileId as string),
    };

    try {
      const isEdit = Boolean(initialData?.id);

      const res = await fetch(
        isEdit
          ? `${API_BASE}/research/patents/${initialData.id}`
          : `${API_BASE}/research/patents`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status}) ${text}`);
      }

      toast.success(
        isEdit ? '특허가 수정되었습니다.' : '특허가 등록되었습니다.',
      );
      onCancel();
    } catch (err: any) {
      console.error('[PatentForm] error', err);
      toast.error(err.message || '요청 실패');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>
          출원일자 <span className="text-destructive">*</span>
        </Label>
        <DatePicker value={applicationDate} onChange={setApplicationDate} />
      </div>

      <div className="space-y-2">
        <Label>
          출원번호 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={applicationNumber}
          onChange={(e) => setApplicationNumber(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          특허명 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={patentName}
          onChange={(e) => setPatentName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          출원인(전체) <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={applicantsAll}
          onChange={(e) => setApplicantsAll(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          발명자 <span className="text-destructive">*</span>
        </Label>
        <UserTagInputString
          value={authorNames}
          onChange={setAuthorNames}
          onUserSelectedIds={setAuthorUserIds}
        />
      </div>

      <div className="space-y-2">
        <Label>비고</Label>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>
          연계 프로젝트 <span className="text-destructive">*</span>
        </Label>
        <SingleProjectSelectInput
          value={relatedProject.name}
          onValueChange={(name) => setRelatedProject((p) => ({ ...p, name }))}
          onProjectSelected={(p) =>
            setRelatedProject(
              p
                ? { id: p.projectId ?? null, name: p.title ?? '' }
                : { id: null, name: '' },
            )
          }
        />
      </div>

      <div className="space-y-2">
        <Label>
          연계 과제 <span className="text-destructive">*</span>
        </Label>
        <SingleTaskSelectInput
          value={relatedTask.name}
          onValueChange={(name) => setRelatedTask((t) => ({ ...t, name }))}
          onTaskSelected={(t) =>
            setRelatedTask(
              t
                ? { id: t.id ?? null, name: t.title ?? '' }
                : { id: null, name: '' },
            )
          }
        />
      </div>

      <div className="space-y-2">
        <Label>파일 첨부</Label>
        <FileUploadBox value={files} onChange={setFiles} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
