'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Award } from '@/lib/types';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import { DatePicker } from '@/components/common/date-picker';
import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';

interface AwardFormProps {
  initialData?: Award;
  onSave: (data: Omit<Award, 'id'>) => void;
  onCancel: () => void;
}

export function AwardForm({ initialData, onSave, onCancel }: AwardFormProps) {
  const [names, setNames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    date: initialData?.date || '',
    organizer: initialData?.organizer || '',
    eventName: initialData?.eventName || '',
    awardName: initialData?.awardName || '',
    presentationTitle: initialData?.presentationTitle || '',
    relatedProject: initialData?.relatedProject || '',
    relatedTask: initialData?.relatedTask || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Award, 'id'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          이름 <span className="text-destructive">*</span>
        </Label>
        <UserTagInputString
          value={names}
          onChange={setNames}
          placeholder="이름을 입력하거나 검색하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">
          날짜 <span className="text-destructive">*</span>
        </Label>
        <DatePicker
          value={formData.date}
          onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
          placeholder="날짜 선택"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizer">
          주최기관 / 학회주최 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="organizer"
          value={formData.organizer}
          onChange={(e) =>
            setFormData({ ...formData, organizer: e.target.value })
          }
          placeholder="예: 대한의료정보학회"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventName">
          대회명 / 학회명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="eventName"
          value={formData.eventName}
          onChange={(e) =>
            setFormData({ ...formData, eventName: e.target.value })
          }
          placeholder="예: 2025년 대한의료정보학회 추계학술대회"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="awardName">
          수상명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="awardName"
          value={formData.awardName}
          onChange={(e) =>
            setFormData({ ...formData, awardName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="presentationTitle">
          발표 제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="presentationTitle"
          value={formData.presentationTitle}
          onChange={(e) =>
            setFormData({ ...formData, presentationTitle: e.target.value })
          }
          required
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
