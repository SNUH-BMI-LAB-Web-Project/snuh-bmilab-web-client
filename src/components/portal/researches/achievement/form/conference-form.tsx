'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Conference } from '@/lib/types';
import { DatePicker } from '@/components/common/date-picker';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';

interface ConferenceFormProps {
  initialData?: Conference;
  onSave: (data: Omit<Conference, 'id'>) => void;
  onCancel: () => void;
}

export function ConferenceForm({
  initialData,
  onSave,
  onCancel,
}: ConferenceFormProps) {
  const [names, setNames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    location: initialData?.location || '',
    organizer: initialData?.organizer || '',
    conferenceName: initialData?.conferenceName || '',
    presentationType: initialData?.presentationType || 'Oral',
    presentationTitle: initialData?.presentationTitle || '',
    relatedProject: initialData?.relatedProject || '',
    relatedTask: initialData?.relatedTask || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Conference, 'id'>);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            학회 시작일 <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            value={formData.startDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, startDate: date }))
            }
            placeholder="학회 시작일 선택"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            학회 종료일 <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            value={formData.endDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, endDate: date }))
            }
            placeholder="학회 종료일 선택"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          학회 장소 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizer">
          학회 주최 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="organizer"
          value={formData.organizer}
          onChange={(e) =>
            setFormData({ ...formData, organizer: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="conferenceName">
          학회명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="conferenceName"
          value={formData.conferenceName}
          onChange={(e) =>
            setFormData({ ...formData, conferenceName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="presentationType">발표 Type</Label>
        <Select
          value={formData.presentationType}
          onValueChange={(value: 'Oral' | 'Mini oral' | 'Poster') =>
            setFormData({ ...formData, presentationType: value })
          }
        >
          <SelectTrigger className="w-1/2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Oral">Oral</SelectItem>
            <SelectItem value="Mini oral">Mini oral</SelectItem>
            <SelectItem value="Poster">Poster</SelectItem>
          </SelectContent>
        </Select>
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
