import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { FileDown, Info, NotepadText, Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import TimelineCard from '@/components/portal/researches/projects/timeline/timeline-card';
import { Badge } from '@/components/ui/badge';
import { getStatusClassName, getStatusLabel } from '@/utils/project-utils';
import { formatDateTimeVer2 } from '@/lib/utils';
import UserPopover from '@/components/common/user-popover';
import { FileItem } from '@/components/common/file-item';
import React, { useEffect, useState } from 'react';
import { ProjectApi, ProjectDetail } from '@/generated-api';
import { downloadFileFromUrl } from '@/utils/download-file';
import { getApiConfig } from '@/lib/config';

interface ProjectInfoFormProps {
  id: string;
  project: ProjectDetail;
  canEdit: boolean;
}

const MarkdownViewer = dynamic(
  () => import('@/components/common/markdown-viewer'),
  { ssr: false },
);

const fileApi = new ProjectApi(getApiConfig());

export default function ProjectInfoForm({
  id,
  project,
  canEdit,
}: ProjectInfoFormProps) {
  const [irbBlob, setIrbBlob] = useState<Blob | null>(null);
  const [drbBlob, setDrbBlob] = useState<Blob | null>(null);

  // IRB 파일 미리 fetch
  useEffect(() => {
    const fetchIrb = async () => {
      try {
        const res = await fileApi.downloadIrbFilesByZipRaw({
          projectId: Number(id),
        });
        const blob = await res.raw.blob();
        setIrbBlob(blob);
      } catch (err) {
        console.error('IRB 다운로드 실패:', err);
      }
    };

    const fetchDrb = async () => {
      try {
        const res = await fileApi.downloadDrbFilesByZipRaw({
          projectId: Number(id),
        });
        const blob = await res.raw.blob();
        setDrbBlob(blob);
      } catch (err) {
        console.error('DRB 다운로드 실패:', err);
      }
    };

    if (Array.isArray(project.irbFiles) && project.irbFiles.length > 0) {
      fetchIrb();
    }

    if (Array.isArray(project.drbFiles) && project.drbFiles.length > 0) {
      fetchDrb();
    }
  }, [id, project.irbFiles, project.drbFiles]);

  // 공통 다운로드 핸들러
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
      <div className="flex flex-col gap-8 xl:col-span-2">
        <div className="flex flex-col gap-4">
          <Label className="flex flex-row text-lg font-semibold">
            <NotepadText className="h-4 w-4" />
            <span>연구 내용</span>
          </Label>

          <Card>
            <CardContent className="flex h-full flex-col justify-start gap-2">
              <MarkdownViewer content={project.content || ''} />
            </CardContent>
          </Card>
        </div>

        <TimelineCard projectId={id} canEdit={canEdit} />
      </div>

      <div className="flex flex-col gap-8 xl:col-span-1">
        <div className="flex flex-col gap-4">
          <Label className="flex flex-row text-lg font-semibold">
            <Info className="h-4 w-4" />
            <span>연구 정보</span>
          </Label>
          <Card>
            <CardContent className="flex h-full flex-col justify-center gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>연구 분야</span>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {project.category?.name ?? '없음'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>연구 상태</span>
                  <Badge className={getStatusClassName(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>연구 기간</span>
                  <div className="text-muted-foreground text-sm font-normal">
                    {formatDateTimeVer2(
                      project.startDate?.toString() || new Date().toString(),
                    )}{' '}
                    ~
                    {project.endDate
                      ? ` ${formatDateTimeVer2(project.endDate.toString())}`
                      : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>IRB 번호</span>
                  <div className="text-muted-foreground flex flex-row items-center text-sm font-normal">
                    {project.irbId}
                    {irbBlob && (
                      <FileDown
                        className="ml-2 size-4 cursor-pointer"
                        onClick={() =>
                          triggerDownload(irbBlob, `IRB_${id}.zip`)
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>DRB 번호</span>
                  <div className="text-muted-foreground flex flex-row items-center text-sm font-normal">
                    {project.drbId}
                    {drbBlob && (
                      <FileDown
                        className="ml-2 size-4 cursor-pointer"
                        onClick={() =>
                          triggerDownload(drbBlob, `DRB_${id}.zip`)
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t" />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="mb-1 font-semibold">PI</span>
                  <div className="text-muted-foreground flex flex-wrap gap-1 text-sm font-normal">
                    {(project.piList ?? [])
                      .map((pi) => pi.name)
                      .filter(Boolean)
                      .join(', ') || '없음'}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="mb-1 font-semibold">참여 교수</span>
                  <div className="text-muted-foreground flex flex-wrap gap-1 text-sm font-normal">
                    {(project.practicalProfessors ?? [])
                      .map((prof) => prof.name)
                      .filter(Boolean)
                      .join(', ') || '없음'}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="mb-1 font-semibold">실무 책임자</span>
                  <div className="text-muted-foreground flex flex-wrap gap-1 text-sm font-normal">
                    {(project.leaders ?? []).map((user, index) => (
                      <span key={user.userId} className="flex items-center">
                        <UserPopover user={user} />
                        {index < (project.leaders?.length ?? 0) - 1 && ','}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-semibold">실무 연구자</span>
                  <div className="text-muted-foreground flex flex-wrap gap-1 text-sm font-normal">
                    {project.participants && project.participants.length > 0 ? (
                      project.participants.map((user, index) => (
                        <span key={user.userId} className="flex items-center">
                          <UserPopover user={user} />
                          {index < project.participants!.length - 1 && ','}
                        </span>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">없음</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="flex flex-row text-lg font-semibold">
              <Paperclip className="h-4 w-4" />
              첨부파일
            </Label>
            {/* {canEdit && ( */}
            {/*   <Button */}
            {/*     variant="outline" */}
            {/*     type="button" */}
            {/*     size="sm" */}
            {/*     className="gap-1 px-2 py-1" */}
            {/*   > */}
            {/*     <Plus className="h-4 w-4" /> */}
            {/*     첨부파일 추가 */}
            {/*   </Button> */}
            {/* )} */}
          </div>
          <ul className="space-y-2 text-sm">
            {project.files && project.files.length > 0 ? (
              project.files.map((file, index) => (
                <FileItem
                  key={file.fileId}
                  file={{
                    name: file.fileName!,
                  }}
                  index={index}
                  onAction={() =>
                    downloadFileFromUrl(file.fileName!, file.uploadUrl!)
                  }
                  mode="download"
                />
              ))
            ) : (
              <Card className="text-muted-foreground px-4 py-6 text-center text-sm">
                등록된 첨부파일이 없습니다.
              </Card>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
