'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import { DatePicker } from '@/components/common/date-picker';
import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';

interface IdName {
  id: number | null;
  name: string;
}

interface AwardFormProps {
  initialData?: any;
  onSave: (payload: {
    recipients: string;
    awardRecipients: {
      userId: number;
      role: string;
    }[];
    awardDate: string;
    hostInstitution: string;
    competitionName: string;
    awardName: string;
    presentationTitle: string;
    projectId: number;
    taskId: number;
  }) => void;
  onCancel: () => void;
}

export function AwardForm({ initialData, onSave, onCancel }: AwardFormProps) {
  const [recipientNames, setRecipientNames] = useState<string[]>([]);
  const [recipientUserIds, setRecipientUserIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    awardDate: '',
    hostInstitution: '',
    competitionName: '',
    awardName: '',
    presentationTitle: '',
    relatedProject: { id: null, name: '' } as IdName,
    relatedTask: { id: null, name: '' } as IdName,
  });

  /* ===== 단건조회 응답 주입 ===== */
  useEffect(() => {
    if (!initialData) return;

    setRecipientNames(
      initialData.recipients
        ? initialData.recipients.split(',').map((v: string) => v.trim())
        : [],
    );

    setRecipientUserIds(
      initialData.awardRecipients?.map((r: any) => r.userId) ?? [],
    );

    setFormData({
      awardDate: initialData.awardDate ?? '',
      hostInstitution: initialData.hostInstitution ?? '',
      competitionName: initialData.competitionName ?? '',
      awardName: initialData.awardName ?? '',
      presentationTitle: initialData.presentationTitle ?? '',
      relatedProject: {
        id: initialData.projectId ?? null,
        name: initialData.projectName ?? '',
      },
      relatedTask: {
        id: initialData.taskId ?? null,
        name: initialData.taskName ?? '',
      },
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (recipientUserIds.length === 0) return;
    if (!formData.relatedProject.id) return;
    if (!formData.relatedTask.id) return;

    onSave({
      recipients: recipientNames.join(', '),
      awardRecipients: recipientUserIds.map((id) => ({
        userId: id,
        role: '대표 수상자',
      })),
      awardDate: formData.awardDate,
      hostInstitution: formData.hostInstitution,
      competitionName: formData.competitionName,
      awardName: formData.awardName,
      presentationTitle: formData.presentationTitle,
      projectId: formData.relatedProject.id,
      taskId: formData.relatedTask.id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UserTagInputString
        value={recipientNames}
        onChange={setRecipientNames}
        onUserSelectedIds={setRecipientUserIds}
      />

      <DatePicker
        value={formData.awardDate}
        onChange={(v) =>
          setFormData((prev) => ({ ...prev, awardDate: v }))
        }
      />

      <Input
        placeholder="주최기관"
        value={formData.hostInstitution}
        onChange={(e) =>
          setFormData((p) => ({ ...p, hostInstitution: e.target.value }))
        }
      />

      <Input
        placeholder="대회명 / 학회명"
        value={formData.competitionName}
        onChange={(e) =>
          setFormData((p) => ({ ...p, competitionName: e.target.value }))
        }
      />

      <Input
        placeholder="수상명"
        value={formData.awardName}
        onChange={(e) =>
          setFormData((p) => ({ ...p, awardName: e.target.value }))
        }
      />

      <Input
        placeholder="발표 제목"
        value={formData.presentationTitle}
        onChange={(e) =>
          setFormData((p) => ({
            ...p,
            presentationTitle: e.target.value,
          }))
        }
      />

      <SingleProjectSelectInput
        value={formData.relatedProject.name}
        onValueChange={(name) =>
          setFormData((p) => ({
            ...p,
            relatedProject: { ...p.relatedProject, name },
          }))
        }
        onProjectSelected={(p) =>
          setFormData((prev) => ({
            ...prev,
            relatedProject: p
              ? { id: p.projectId ?? null, name: p.title ?? '' }
              : { id: null, name: '' },
          }))
        }
      />

      <SingleTaskSelectInput
        value={formData.relatedTask.name}
        onValueChange={(name) =>
          setFormData((p) => ({
            ...p,
            relatedTask: { ...p.relatedTask, name },
          }))
        }
        onTaskSelected={(t) =>
          setFormData((prev) => ({
            ...prev,
            relatedTask: t
              ? { id: t.id ?? null, name: t.title ?? '' }
              : { id: null, name: '' },
          }))
        }
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
