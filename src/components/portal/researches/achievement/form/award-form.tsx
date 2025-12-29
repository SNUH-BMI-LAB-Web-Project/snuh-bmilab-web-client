'use client';

import type React from 'react';
import { useState } from 'react';
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

export function AwardForm({ onSave, onCancel }: AwardFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (recipientUserIds.length === 0) return;
    if (!formData.relatedProject.id) return;
    if (!formData.relatedTask.id) return;

    const payload = {
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
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>
          수상자 <span className="text-destructive">*</span>
        </Label>
        <UserTagInputString
          value={recipientNames}
          onChange={setRecipientNames}
          onUserSelectedIds={setRecipientUserIds}
          placeholder="이름을 입력하거나 검색하세요"
        />
      </div>

      <div className="space-y-2">
        <Label>
          수상일 <span className="text-destructive">*</span>
        </Label>
        <DatePicker
          value={formData.awardDate}
          onChange={(v) =>
            setFormData((prev) => ({ ...prev, awardDate: v }))
          }
          placeholder="날짜 선택"
        />
      </div>

      <div className="space-y-2">
        <Label>
          주최기관 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.hostInstitution}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              hostInstitution: e.target.value,
            }))
          }
          placeholder="예: 대한의료정보학회"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          대회명 / 학회명 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.competitionName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              competitionName: e.target.value,
            }))
          }
          placeholder="예: 2025년 대한의료정보학회 추계학술대회"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          수상명 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.awardName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              awardName: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          발표 제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.presentationTitle}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              presentationTitle: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          연계 프로젝트 <span className="text-destructive">*</span>
        </Label>
        <SingleProjectSelectInput
          value={formData.relatedProject.name}
          onValueChange={(name) =>
            setFormData((prev) => ({
              ...prev,
              relatedProject: { ...prev.relatedProject, name },
            }))
          }
          onProjectSelected={(p) =>
            setFormData((prev) => ({
              ...prev,
              relatedProject: p
                ? { id: p.projectId, name: p.title ?? '' }
                : { id: null, name: '' },
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          연계 과제 <span className="text-destructive">*</span>
        </Label>
        <SingleTaskSelectInput
          value={formData.relatedTask.name}
          onValueChange={(name) =>
            setFormData((prev) => ({
              ...prev,
              relatedTask: { ...prev.relatedTask, name },
            }))
          }
          onTaskSelected={(t) =>
            setFormData((prev) => ({
              ...prev,
              relatedTask: t
                ? { id: t.id, name: t.title ?? '' }
                : { id: null, name: '' },
            }))
          }
        />
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
