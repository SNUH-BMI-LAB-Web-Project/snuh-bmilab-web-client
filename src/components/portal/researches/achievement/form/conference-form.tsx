'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/common/date-picker';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';

interface ConferenceFormProps {
  initialData?: any;
  onSave: (payload: any) => void;
  onCancel: () => void;
  onDeleted?: () => void;
}

type PresentationType = 'ORAL' | 'MINI_ORAL' | 'POSTER';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const mapPresentationType = (value?: string): PresentationType => {
  switch (value) {
    case 'Oral':
      return 'ORAL';
    case 'Mini Oral':
      return 'MINI_ORAL';
    case 'Poster':
      return 'POSTER';
    default:
      return 'ORAL';
  }
};

export function ConferenceForm({
                                 initialData,
                                 onSave,
                                 onCancel,
                                 onDeleted,
                               }: ConferenceFormProps) {
  const [authorNames, setAuthorNames] = useState<string[]>([]);
  const [authorUserIds, setAuthorUserIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    location: '',
    organizer: '',
    conferenceName: '',
    presentationType: 'ORAL' as PresentationType,
    presentationTitle: '',
    relatedProject: { id: null as number | null, name: '' },
    relatedTask: { id: null as number | null, name: '' },
  });

  useEffect(() => {
    if (!initialData) return;

    setAuthorNames(
      initialData.authors
        ? initialData.authors.split(',').map((v: string) => v.trim())
        : [],
    );

    setAuthorUserIds(
      initialData.academicPresentationAuthors?.map((a: any) => a.userId) ??
      [],
    );

    setFormData({
      startDate: initialData.conferenceStartDate ?? '',
      endDate: initialData.conferenceEndDate ?? '',
      location: initialData.conferenceLocation ?? '',
      organizer: initialData.conferenceHost ?? '',
      conferenceName: initialData.conferenceName ?? '',
      presentationType: mapPresentationType(initialData.presentationType),
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

    if (!formData.relatedProject.id) return;
    if (!formData.relatedTask.id) return;

    onSave({
      authors: authorNames.join(', '),
      academicPresentationAuthors: authorUserIds.map((id) => ({
        userId: id,
        role: '발표자',
      })),
      academicPresentationStartDate: formData.startDate,
      academicPresentationEndDate: formData.endDate,
      academicPresentationLocation: formData.location,
      academicPresentationHost: formData.organizer,
      academicPresentationName: formData.conferenceName,
      presentationType: formData.presentationType,
      presentationTitle: formData.presentationTitle,
      projectId: formData.relatedProject.id,
      taskId: formData.relatedTask.id,
    });
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);

    try {
      const res = await fetch(
        `${API_BASE}/research/academic-presentations/${initialData.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error('DELETE FAILED');
      }

      onDeleted?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UserTagInputString
        value={authorNames}
        onChange={setAuthorNames}
        onUserSelectedIds={setAuthorUserIds}
      />

      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          value={formData.startDate}
          onChange={(v) =>
            setFormData((p) => ({ ...p, startDate: v }))
          }
        />
        <DatePicker
          value={formData.endDate}
          onChange={(v) =>
            setFormData((p) => ({ ...p, endDate: v }))
          }
        />
      </div>

      <Input
        placeholder="장소"
        value={formData.location}
        onChange={(e) =>
          setFormData((p) => ({ ...p, location: e.target.value }))
        }
      />

      <Input
        placeholder="주최"
        value={formData.organizer}
        onChange={(e) =>
          setFormData((p) => ({ ...p, organizer: e.target.value }))
        }
      />

      <Input
        placeholder="학회명"
        value={formData.conferenceName}
        onChange={(e) =>
          setFormData((p) => ({ ...p, conferenceName: e.target.value }))
        }
      />

      <Select
        value={formData.presentationType}
        onValueChange={(v) =>
          setFormData((p) => ({
            ...p,
            presentationType: v as PresentationType,
          }))
        }
      >
        <SelectTrigger className="w-1/2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ORAL">Oral</SelectItem>
          <SelectItem value="MINI_ORAL">Mini Oral</SelectItem>
          <SelectItem value="POSTER">Poster</SelectItem>
        </SelectContent>
      </Select>

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
          setFormData((prev) => ({
            ...prev,
            relatedProject: {
              ...prev.relatedProject,
              name,
            },
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
          setFormData((prev) => ({
            ...prev,
            relatedTask: {
              ...prev.relatedTask,
              name,
            },
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

      <div className="flex pt-4">
        {initialData?.id && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="mr-auto"
          >
            삭제
          </Button>
        )}

        <div className="flex gap-2 ml-auto">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">저장</Button>
        </div>
      </div>
    </form>
  );
}
