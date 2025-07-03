'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Paperclip, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Configuration,
  GeneratePresignedUrlDomainTypeEnum,
  ReportApi,
  SearchProjectItem,
  ProjectFileSummary,
  ReportSummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { uploadFileWithPresignedUrl } from '@/lib/upload';
import { FileItem } from '@/components/portal/researches/projects/file-item';

const reportApi = new ReportApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

interface ReportEditModalProps {
  report: ReportSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdate: (reportData: ReportSummary) => void;
  projectList: SearchProjectItem[];
}

export function ReportEditModal({
  report,
  open,
  onOpenChange,
  onReportUpdate,
  projectList,
}: ReportEditModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    project: '',
    date: undefined as Date | undefined,
    files: [] as File[],
    existingFiles: [] as ProjectFileSummary[],
  });

  // 보고서 데이터로 폼 초기화
  useEffect(() => {
    if (report && open) {
      setFormData({
        content: report.content || '',
        project: String(report.project?.projectId) || '',
        date: report.createdAt ? new Date(report.createdAt) : new Date(),
        files: [],
        existingFiles: [
          ...(report.files || []).map((f: ProjectFileSummary) => ({ ...f })),
        ],
      });
    }
  }, [report, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const allFiles = [...formData.files, ...newFiles];
      const uniqueFiles = Array.from(
        new Map(allFiles.map((f) => [f.name + f.size, f])).values(),
      );

      setFormData((prev) => ({
        ...prev,
        files: uniqueFiles,
      }));
    }
  };

  const removeNewFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const removeExistingFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingFiles: prev.existingFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim() || !formData.project || !formData.date) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    const accessToken = useAuthStore.getState().accessToken!;

    try {
      // presigned URL로 새 파일 업로드
      const uploadPromises = formData.files.map((file) =>
        uploadFileWithPresignedUrl(
          file,
          accessToken,
          GeneratePresignedUrlDomainTypeEnum.Report,
        ),
      );
      const uploadedFiles = await Promise.all(uploadPromises);
      const newFileIds = uploadedFiles.map((f) => f.fileId!);

      // 기존 파일 ID (fileId가 있어야 함)
      const existingFileIds = formData.existingFiles.map((f) => f.fileId);

      const allFileIds = [...existingFileIds, ...newFileIds];

      // 수정 요청
      await reportApi.updateReport({
        reportId: report.reportId!,
        reportRequest: {
          content: formData.content,
          projectId: Number(formData.project),
          date: formData.date,
          fileIds: allFileIds,
        },
      });

      toast.success('보고서가 성공적으로 수정되었습니다.');

      // UI 업데이트
      onReportUpdate({
        ...report,
        content: formData.content,
        createdAt: formData.date,
        project: {
          projectId: Number(formData.project),
          title:
            projectList.find((p) => String(p.projectId) === formData.project)
              ?.title ?? '',
        },
        files: [...formData.existingFiles],
      });

      onOpenChange(false);
    } catch (err) {
      toast.error('보고서 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!open && document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = 'auto';
      }
    }, 300); // 0.3초마다 검사

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setTimeout(() => {
            document.body.style.pointerEvents = 'auto';
          }, 50);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            업무 보고 수정
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로젝트 및 날짜 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">
                프로젝트 <span className="text-destructive text-xs">*</span>
              </Label>
              <Select
                value={formData.project}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, project: value }))
                }
              >
                <SelectTrigger id="project" className="w-full cursor-pointer">
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  {projectList.map((proj) => (
                    <SelectItem
                      key={proj.projectId}
                      value={String(proj.projectId)}
                      className="cursor-pointer"
                    >
                      {proj.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                보고 날짜 <span className="text-destructive text-xs">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground',
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, 'PPP', { locale: ko })
                    ) : (
                      <span>날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, date }))
                    }
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 보고 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">
              보고 내용 <span className="text-destructive text-xs">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="수정할 업무 내용을 작성하세요."
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              className="min-h-[150px]"
              required
            />
          </div>

          {/* 기존 파일들 */}
          {formData.existingFiles.length > 0 && (
            <div className="space-y-2">
              <Label>기존 첨부파일</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {formData.existingFiles.map((file, index) => (
                  <FileItem
                    key={file.fileId}
                    file={{
                      name: file.fileName!,
                      size: file.size,
                    }}
                    index={index}
                    onAction={() => removeExistingFile(index)}
                    mode="remove"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 새 파일 첨부 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="files">새 파일 추가</Label>
              {formData.files.length > 0 && (
                <span className="text-muted-foreground text-xs">
                  {formData.files.length}개 파일 선택됨
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label
                htmlFor="files"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full cursor-pointer items-center rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                파일 선택
              </Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">새로 추가된 파일</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {formData.files.map((file, index) => (
                    <FileItem
                      key={crypto.randomUUID()}
                      file={{
                        name: file.name,
                        size: file.size,
                      }}
                      index={index}
                      onAction={() => removeNewFile(index)}
                      mode="remove"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit">수정 완료</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
