'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Patent } from '@/lib/types';
import { DatePicker } from '@/components/common/date-picker';
import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';
import { ProjectFileSummary } from '@/generated-api';
import { FileUploadBox } from '@/components/portal/researches/achievement/file-upload-box';
import { UserTagInputStrict } from '@/components/portal/researches/achievement/multi-user-tag-input-strict';

interface PatentFormProps {
  initialData?: Patent;
  onSave: (data: Omit<Patent, 'id'>) => void;
  onCancel: () => void;
}

export function PatentForm({ initialData, onSave, onCancel }: PatentFormProps) {
  const [labApplicants, setLabApplicants] = useState<string[]>(
    initialData?.labApplicants ?? [],
  );
  const [files, setFiles] = useState<ProjectFileSummary[]>([]);

  const [formData, setFormData] = useState({
    applicationDate: initialData?.applicationDate || '',
    applicationNumber: initialData?.applicationNumber || '',
    applicationName: initialData?.applicationName || '',
    allApplicants: initialData?.allApplicants || '',
    labApplicants: initialData?.labApplicants?.join(', ') || '',
    notes: initialData?.notes || '',
    relatedTask: initialData?.relatedTask || '',
    relatedProject: initialData?.relatedProject || '',
    attachments: initialData?.attachments || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
      labApplicants,
      allApplicants: formData.allApplicants
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      attachmentFileIds: files.map((f) => f.fileId!),
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="applicationDate">
          출원일자 <span className="text-destructive">*</span>
        </Label>
        <DatePicker
          value={formData.applicationDate}
          onChange={(date) =>
            setFormData((prev) => ({ ...prev, applicationDate: date }))
          }
          placeholder="출원일자 선택"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationNumber">
          출원번호 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="applicationNumber"
          value={formData.applicationNumber}
          onChange={(e) =>
            setFormData({ ...formData, applicationNumber: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationName">
          출원명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="applicationName"
          value={formData.applicationName}
          onChange={(e) =>
            setFormData({ ...formData, applicationName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allApplicants">
          출원인(전체) <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="allApplicants"
          value={formData.allApplicants}
          onChange={(e) =>
            setFormData({ ...formData, allApplicants: e.target.value })
          }
          placeholder="쉼표(,)로 구분하여 입력"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="labApplicants">
          출원인(연구실) <span className="text-destructive">*</span>
        </Label>
        <UserTagInputStrict
          value={labApplicants}
          onChange={setLabApplicants}
          placeholder="이름을 검색하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">비고</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="추가 정보 입력"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relatedProject">
          연계 프로젝트 <span className="text-destructive">*</span>
        </Label>
        <SingleProjectSelectInput
          value={formData.relatedProject}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, relatedProject: v }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relatedTask">연계 과제</Label>
        <SingleTaskSelectInput
          value={formData.relatedTask}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, relatedTask: v }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachments">
          파일 첨부 <span className="text-destructive">*</span>
        </Label>
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
