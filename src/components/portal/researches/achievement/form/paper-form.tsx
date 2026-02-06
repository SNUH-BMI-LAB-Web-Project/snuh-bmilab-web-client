'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Paper } from '@/lib/types';
import { DatePicker } from '@/components/common/date-picker';
import { ExternalProfessorItem, ProjectFileSummary } from '@/generated-api';
import { FileUploadBox } from '@/components/portal/researches/achievement/file-upload-box';
import { Minus, Plus } from 'lucide-react';
import ExternalProfessorSelectModal from '@/components/portal/researches/projects/external-professor-select-modal';
import { getProfessorKey } from '@/utils/external-professor-utils';
import { toast } from 'sonner';
import {
  LabMember,
  LabMemberSelect,
} from '@/components/portal/researches/achievement/lab-member-select';

import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';

interface PaperFormProps {
  initialData?: Paper & {
    projectId?: number;
    projectName?: string;
    taskId?: number;
    taskName?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

type ProfessorRole = 'FIRST_AUTHOR' | 'CO_AUTHOR' | 'CORRESPONDING_AUTHOR';

export function PaperForm({ initialData, onSave, onCancel }: PaperFormProps) {
  const [showCorrespondingModal, setShowCorrespondingModal] = useState(false);
  const [correspondingProfessors, setCorrespondingProfessors] = useState<
    ExternalProfessorItem[]
  >([]);

  const [labMembers, setLabMembers] = useState<LabMember[]>([]);
  const [files, setFiles] = useState<ProjectFileSummary[]>([]);

  const [formData, setFormData] = useState({
    acceptDate: '',
    publishDate: '',
    journalName: '',
    paperTitle: '',
    firstAuthors: '',
    coAuthors: '',
    vol: '',
    page: '',
    paperLink: '',
    doi: '',
    pmid: '',
    citationCount: '',
    professorRole: 'FIRST_AUTHOR' as ProfessorRole,
    isRepresentative: false,
    relatedProject: { id: null as number | null, name: '' },
    relatedTask: { id: null as number | null, name: '' },
  });

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      acceptDate: initialData.acceptDate ?? '',
      publishDate: initialData.publishDate ?? '',
      journalName: initialData.journalName ?? '',
      paperTitle: initialData.paperTitle ?? '',
      firstAuthors: initialData.firstAuthors ?? '',
      coAuthors: initialData.coAuthors ?? '',
      vol: initialData.vol ?? '',
      page: initialData.page ?? '',
      paperLink: initialData.paperLink ?? '',
      doi: initialData.doi ?? '',
      pmid: initialData.pmid ?? '',
      citationCount: String(
        initialData.citations ?? initialData.citationCount ?? '',
      ),
      professorRole:
        (initialData.professorRole as ProfessorRole) ?? 'FIRST_AUTHOR',
      isRepresentative: initialData.isRepresentative ?? false,
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

    if (correspondingProfessors.length === 0) {
      toast('교신저자를 1명 이상 선택하세요.');
      return;
    }

    if (!formData.relatedProject.id) {
      toast('연계 프로젝트를 선택해주세요.');
      return;
    }

    const firstAuthorsList = formData.firstAuthors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const coAuthorsList = formData.coAuthors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const allAuthors = [...firstAuthorsList, ...coAuthorsList].join(', ');

    const payload = {
      acceptDate: formData.acceptDate,
      publishDate: formData.publishDate,
      journalId: 1,
      paperTitle: formData.paperTitle,
      allAuthors,
      firstAuthor: firstAuthorsList[0] || '',
      coAuthors: formData.coAuthors,
      correspondingAuthors: correspondingProfessors.map((p: any) => ({
        externalProfessorId: p.externalProfessorId || p.id || p.professorId,
        role: '교신저자',
      })),
      paperAuthors: labMembers.map((member: any) => ({
        userId: member.userId || member.id,
        role: member.role || '제1저자',
      })),
      vol: formData.vol,
      page: formData.page,
      paperLink: formData.paperLink,
      doi: formData.doi,
      pmid: formData.pmid,
      citations: Number(formData.citationCount) || 0,
      professorRole: formData.professorRole,
      isRepresentative: formData.isRepresentative,
      taskId: formData.relatedTask.id,
      projectId: formData.relatedProject.id,
      fileIds: files
        .map((f) => f.fileId)
        .filter((id): id is string => Boolean(id)),
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="acceptDate">
            Accept Date <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            value={formData.acceptDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, acceptDate: date }))
            }
            placeholder="Accept Date 선택"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishDate">Publish Date</Label>
          <DatePicker
            value={formData.publishDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, publishDate: date }))
            }
            placeholder="Publish Date 선택"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="journalName">
          저널명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="journalName"
          value={formData.journalName}
          onChange={(e) =>
            setFormData({ ...formData, journalName: e.target.value })
          }
          placeholder="저널 입력"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paperTitle">
          논문 제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="paperTitle"
          value={formData.paperTitle}
          onChange={(e) =>
            setFormData({ ...formData, paperTitle: e.target.value })
          }
          placeholder="논문 제목 입력"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstAuthors">
          제1저자 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="firstAuthors"
          value={formData.firstAuthors}
          onChange={(e) =>
            setFormData({ ...formData, firstAuthors: e.target.value })
          }
          placeholder="쉼표(,)로 구분하여 입력"
          rows={1}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coAuthors">공동저자</Label>
        <Textarea
          id="coAuthors"
          value={formData.coAuthors}
          onChange={(e) =>
            setFormData({ ...formData, coAuthors: e.target.value })
          }
          placeholder="쉼표(,)로 구분하여 입력"
          rows={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="correspondingAuthor">
          교신저자 <span className="text-destructive">*</span>
        </Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCorrespondingModal(true)}
          className="w-full justify-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          교신저자 추가
        </Button>

        {correspondingProfessors.length > 0 && (
          <div className="bg-muted/50 mt-2 space-y-3 rounded-xl p-4">
            {correspondingProfessors.map((prof, index) => {
              const key = getProfessorKey(prof);
              return (
                <div key={key} className="flex items-center gap-2">
                  <Input
                    disabled
                    value={prof.name || ''}
                    placeholder="이름"
                    className="bg-white"
                  />
                  <Input
                    disabled
                    value={prof.organization || ''}
                    placeholder="기관"
                    className="bg-white"
                  />
                  <Input
                    disabled
                    value={prof.department || ''}
                    placeholder="부서"
                    className="bg-white"
                  />
                  <Input
                    disabled
                    value={prof.position || ''}
                    placeholder="직책"
                    className="bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCorrespondingProfessors((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="labMembers">
          연구실 내 인원 중 포함된 사람{' '}
          <span className="text-destructive">*</span>
        </Label>
        <LabMemberSelect value={labMembers} onChange={setLabMembers} />
        <p className="text-muted-foreground text-xs">
          구성원별 역할(1저자, 공동1저자, 공동저자)을 포함하여 입력하세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vol">Vol</Label>
          <Input
            id="vol"
            value={formData.vol}
            onChange={(e) => setFormData({ ...formData, vol: e.target.value })}
            placeholder="예: 30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="page">Page</Label>
          <Input
            id="page"
            value={formData.page}
            onChange={(e) => setFormData({ ...formData, page: e.target.value })}
            placeholder="예: 123-145"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paperLink">
          논문 링크 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="paperLink"
          type="url"
          value={formData.paperLink}
          onChange={(e) =>
            setFormData({ ...formData, paperLink: e.target.value })
          }
          placeholder="https://"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="doi">
          DOI <span className="text-destructive">*</span>
        </Label>
        <Input
          id="doi"
          value={formData.doi}
          onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
          placeholder="10.xxxx/xxxxx"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pmid">PMID</Label>
        <Input
          id="pmid"
          value={formData.pmid}
          onChange={(e) => setFormData({ ...formData, pmid: e.target.value })}
          placeholder="12345678"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="citationCount">
          No of Citation (Web of Science 기준)
        </Label>
        <Input
          id="citationCount"
          type="number"
          value={formData.citationCount}
          onChange={(e) =>
            setFormData({ ...formData, citationCount: e.target.value })
          }
          placeholder="0"
        />
      </div>

      <hr className="my-4" />

      {/* 연계 프로젝트 및 과제 선택 영역 (하단 이동) */}
      <div className="grid grid-cols-2 gap-4">
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
                relatedTask: { ...prev.relatedTask, name },
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="professorRole">
          김광수 교수님 역할 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.professorRole}
          onValueChange={(v: ProfessorRole) =>
            setFormData({ ...formData, professorRole: v })
          }
        >
          <SelectTrigger className="w-1/2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIRST_AUTHOR">제1저자</SelectItem>
            <SelectItem value="CO_AUTHOR">공저자</SelectItem>
            <SelectItem value="CORRESPONDING_AUTHOR">교신저자</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="isRepresentative" className="cursor-pointer">
          김광수 교수님 기준 대표실적 여부
        </Label>
        <Checkbox
          id="isRepresentative"
          checked={formData.isRepresentative}
          onCheckedChange={(c) =>
            setFormData({ ...formData, isRepresentative: c as boolean })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>
          첨부파일 <span className="text-destructive">*</span>
        </Label>
        <FileUploadBox value={files} onChange={setFiles} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>

      <ExternalProfessorSelectModal
        open={showCorrespondingModal}
        onClose={() => setShowCorrespondingModal(false)}
        onSelect={(prof) => {
          const key = getProfessorKey(prof);
          setCorrespondingProfessors((prev) =>
            prev.some((p) => getProfessorKey(p) === key)
              ? prev
              : [...prev, prof],
          );
          setShowCorrespondingModal(false);
        }}
        selectedProfessorKeys={correspondingProfessors.map(getProfessorKey)}
      />
    </form>
  );
}
