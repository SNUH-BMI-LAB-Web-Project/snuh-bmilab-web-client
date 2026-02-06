'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

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
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

const mapPresentationTypeLabel = (v: PresentationType) => {
  switch (v) {
    case 'ORAL':
      return 'Oral';
    case 'MINI_ORAL':
      return 'Mini Oral';
    case 'POSTER':
      return 'Poster';
    default:
      return v;
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

    // 테이블 데이터 필드명과 API 필드명을 매핑
    setAuthorNames(
      initialData.authors
        ? initialData.authors.split(',').map((v: string) => v.trim())
        : [],
    );

    setAuthorUserIds(
      initialData.academicPresentationAuthors?.map((a: any) => a.userId) ?? [],
    );

    setFormData({
      startDate: initialData.academicPresentationStartDate ?? '',
      endDate: initialData.academicPresentationEndDate ?? '',
      location: initialData.academicPresentationLocation ?? '',
      organizer: initialData.academicPresentationHost ?? '',
      conferenceName: initialData.academicPresentationName ?? '',
      presentationType: initialData.presentationType ?? 'ORAL',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.relatedProject.id) {
      alert('연계 프로젝트를 선택해주세요.');
      return;
    }

    const payload = {
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
    };

    const token = getToken();
    const method = initialData?.id ? 'PUT' : 'POST';
    const url = initialData?.id
      ? `${API_BASE}/research/academic-presentations/${initialData.id}`
      : `${API_BASE}/research/academic-presentations`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(initialData?.id ? '수정되었습니다.' : '등록되었습니다.');
        onSave(payload);
      } else {
        const errorData = await res.json();
        alert(`오류 발생: ${errorData.message || '저장에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm('정말로 삭제하시겠습니까?')) return;

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

      if (res.ok) {
        alert('삭제되었습니다.');
        onDeleted?.();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>
          이름 <span className="text-destructive">*</span>
        </Label>
        <UserTagInputString
          value={authorNames}
          onChange={setAuthorNames}
          onUserSelectedIds={setAuthorUserIds}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            학회 시작일 <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            value={formData.startDate}
            onChange={(v) => setFormData((p) => ({ ...p, startDate: v }))}
          />
        </div>

        <div className="space-y-2">
          <Label>
            학회 종료일 <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            value={formData.endDate}
            onChange={(v) => setFormData((p) => ({ ...p, endDate: v }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          학회 장소 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.location}
          onChange={(e) =>
            setFormData((p) => ({ ...p, location: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          학회 주최 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.organizer}
          onChange={(e) =>
            setFormData((p) => ({ ...p, organizer: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          학회명 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.conferenceName}
          onChange={(e) =>
            setFormData((p) => ({ ...p, conferenceName: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>발표 Type</Label>
        <Select
          value={formData.presentationType}
          onValueChange={(v) =>
            setFormData((p) => ({
              ...p,
              presentationType: v as PresentationType,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue>
              {mapPresentationTypeLabel(formData.presentationType)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ORAL">Oral</SelectItem>
            <SelectItem value="MINI_ORAL">Mini Oral</SelectItem>
            <SelectItem value="POSTER">Poster</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          발표 제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.presentationTitle}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
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
      </div>

      <div className="space-y-2">
        <Label>연계 과제</Label>
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
      </div>

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

        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">저장</Button>
        </div>
      </div>
    </form>
  );
}
