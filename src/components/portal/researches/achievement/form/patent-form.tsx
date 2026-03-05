'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/common/date-picker';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import { SingleTaskSelectInput } from '@/components/portal/researches/achievement/single-task-select-input';
import { FileUploadBox } from '@/components/portal/researches/achievement/file-upload-box';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import ExternalProfessorSelectModal from '@/components/portal/researches/projects/external-professor-select-modal';
import { getProfessorKey } from '@/utils/external-professor-utils';

import type { ProjectFileSummary } from '@/generated-api';
import type { ExternalProfessorItem } from '@/generated-api';

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
  const [externalAuthors, setExternalAuthors] = useState<
    ExternalProfessorItem[]
  >([]);
  const [showExternalModal, setShowExternalModal] = useState(false);

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

    const authors = initialData.patentAuthors ?? [];
    const internal = authors.filter((a: any) => a.userId != null);
    const external = authors.filter(
      (a: any) =>
        a.externalProfessorId != null || a.externalProfessorName != null,
    );

    setAuthorNames(internal.map((a: any) => a.userName ?? ''));
    setAuthorUserIds(internal.map((a: any) => a.userId));
    setExternalAuthors(
      external.map((a: any) => ({
        professorId: a.externalProfessorId ?? a.professorId ?? 0,
        name: a.externalProfessorName ?? a.name ?? '',
        organization: '',
        department: '',
        position: '',
      })),
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

    const hasAuthors =
      authorUserIds.length > 0 || externalAuthors.length > 0;
    if (
      !applicationDate ||
      !applicationNumber ||
      !patentName ||
      !applicantsAll ||
      !hasAuthors
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

    const patentAuthorsPayload = [
      ...authorUserIds.map((id) => ({ userId: id, role: '발명자' })),
      ...externalAuthors
        .filter((e) => {
          const id = e.professorId ?? (e as { id?: number }).id;
          return id != null && id !== 0;
        })
        .map((e) => ({
          userId: null,
          externalProfessorId: (e.professorId ?? (e as { id?: number }).id) as number,
          role: '발명자',
        })),
    ];

    const validFileIds = files
      .map((f) => f.fileId)
      .filter((id): id is string => Boolean(id && typeof id === 'string'));

    // API 스펙: projectId, taskId는 선택(optional). 미선택 시 키를 포함하지 않음 (포함 시 백엔드가 null로 매핑하면 DB NOT NULL 제약으로 500 발생)
    const payload: Record<string, unknown> = {
      applicationDate,
      applicationNumber,
      patentName,
      applicantsAll,
      patentAuthors: patentAuthorsPayload,
      remarks,
      fileIds: validFileIds,
    };
    if (relatedProject.id != null) {
      payload.projectId = relatedProject.id;
    }
    if (relatedTask.id != null) {
      payload.taskId = relatedTask.id;
    }

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
        <div className="space-y-3">
          <div>
            <span className="text-muted-foreground mb-1 block text-xs">
              내부 인원
            </span>
            <UserTagInputString
              value={authorNames}
              onChange={setAuthorNames}
              onUserSelectedIds={setAuthorUserIds}
              placeholder="이름으로 검색..."
            />
          </div>
          <div>
            <span className="text-muted-foreground mb-1 block text-xs">
              외부 인사
            </span>
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
              onClick={() => setShowExternalModal(true)}
            >
              외부 인사 추가
            </Button>
            {externalAuthors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {externalAuthors.map((ext) => (
                  <Badge
                    key={ext.professorId ?? ext.name}
                    variant="secondary"
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  >
                    {ext.name}
                    <button
                      type="button"
                      onClick={() =>
                        setExternalAuthors((prev) =>
                          prev.filter(
                            (e) => e.professorId !== ext.professorId,
                          ),
                        )
                      }
                      className="rounded-full p-0.5 hover:bg-black/5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ExternalProfessorSelectModal
        open={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        onSelect={(prof) => {
          if (
            externalAuthors.some(
              (e) => e.professorId === (prof.professorId ?? 0),
            )
          ) {
            return;
          }
          setExternalAuthors((prev) => [...prev, prof]);
          setShowExternalModal(false);
        }}
        selectedProfessorKeys={externalAuthors.map(getProfessorKey)}
      />

      <div className="space-y-2">
        <Label>비고</Label>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>연계 프로젝트 (선택)</Label>
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
        <Label>연계 과제 (선택)</Label>
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
