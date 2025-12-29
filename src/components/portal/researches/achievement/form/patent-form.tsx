'use client';

import type React from 'react';
import { useState } from 'react';
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

export function PatentForm({ onCancel }: { onCancel: () => void }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [applicationDate, setApplicationDate] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [patentName, setPatentName] = useState('');
  const [applicantsAll, setApplicantsAll] = useState('');
  const [remarks, setRemarks] = useState('');

  // 🔴 핵심 수정 부분
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !applicationDate ||
      !applicationNumber ||
      !patentName ||
      !applicantsAll ||
      authorUserIds.length === 0 ||
      files.length === 0 ||
      !relatedProject.id ||
      !relatedTask.id
    ) {
      toast.error('필수 항목이 누락되었습니다.');
      return;
    }

    try {
      const authRaw = localStorage.getItem('auth-storage');
      const token = authRaw
        ? JSON.parse(authRaw)?.state?.accessToken
        : null;

      if (!token) throw new Error('인증 토큰이 없습니다.');

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

      console.log('[PatentForm] request payload', payload);

      const res = await fetch(`${API_BASE}/research/patents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('[PatentForm] response', res.status, text);

      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status}) ${text}`);
      }

      toast.success('특허가 성공적으로 등록되었습니다.');
      onCancel();
    } catch (err: any) {
      console.error('[PatentForm] submit error', err);
      toast.error(err.message || '특허 등록 실패');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label>출원일자 *</Label>
      <DatePicker value={applicationDate} onChange={setApplicationDate} />

      <Label>출원번호 *</Label>
      <Input value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} />

      <Label>특허명 *</Label>
      <Input value={patentName} onChange={(e) => setPatentName(e.target.value)} />

      <Label>출원인(전체) *</Label>
      <Textarea value={applicantsAll} onChange={(e) => setApplicantsAll(e.target.value)} />

      <Label>발명자 *</Label>
      <UserTagInputString
        value={authorNames}
        onChange={setAuthorNames}
        onUserSelectedIds={setAuthorUserIds}
      />

      <Label>비고</Label>
      <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />

      <Label>연계 프로젝트 *</Label>
      <SingleProjectSelectInput
        value={relatedProject.name}
        onValueChange={(name) => setRelatedProject((p) => ({ ...p, name }))}
        onProjectSelected={(p) =>
          setRelatedProject(p ? { id: p.projectId, name: p.title ?? '' } : { id: null, name: '' })
        }
      />

      <Label>연계 과제 *</Label>
      <SingleTaskSelectInput
        value={relatedTask.name}
        onValueChange={(name) => setRelatedTask((t) => ({ ...t, name }))}
        onTaskSelected={(t) =>
          setRelatedTask(t ? { id: t.id, name: t.title ?? '' } : { id: null, name: '' })
        }
      />

      <Label>파일 첨부 *</Label>
      <FileUploadBox value={files} onChange={setFiles} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
