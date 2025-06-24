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
import { Paperclip, Calendar, X, Save } from 'lucide-react';
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
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { uploadFileWithPresignedUrl } from '@/lib/upload';

interface ReportEditModalProps {
  report: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdate: (reportData: any) => void;
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
    existingFiles: [] as any[],
  });

  const api = new ReportApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  // 보고서 데이터로 폼 초기화
  useEffect(() => {
    if (report && open) {
      setFormData({
        content: report.content || '',
        project: report.project?.id || '',
        date: report.createdAt ? new Date(report.createdAt) : new Date(),
        files: [],
        existingFiles: [...(report.files || []).map((f: any) => ({ ...f }))],
      });
    }
  }, [report, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files!)],
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
      await api.updateReport({
        reportId: report.reportId,
        reportRequest: {
          content: formData.content,
          projectId: Number(formData.project),
          date: formData.date,
          fileIds: allFileIds,
        },
      });

      toast.success('보고서가 수정되었습니다.');

      // UI 업데이트
      onReportUpdate({
        ...report,
        content: formData.content,
        createdAt: formData.date,
        project: {
          id: formData.project,
          name:
            projectList.find((p) => String(p.projectId) === formData.project)
              ?.title ?? '',
        },
        files: [...formData.existingFiles],
      });

      onOpenChange(false);
    } catch (err) {
      console.error('보고서 수정 실패:', err);
      toast.error('보고서 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // 폼 초기화는 useEffect에서 다시 처리됨
  };

  if (!report || !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            업무 보고 수정
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로젝트 및 날짜 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">프로젝트 *</Label>
              <Select
                value={formData.project}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, project: value }))
                }
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent>
                  {projectList.map((proj) => (
                    <SelectItem
                      key={proj.projectId}
                      value={String(proj.projectId)}
                    >
                      {proj.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">보고 날짜 *</Label>
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
            <Label htmlFor="content">보고 내용 *</Label>
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
              <div className="space-y-2">
                {formData.existingFiles.map((file, index) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingFile(index)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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

            {/* 새로 추가된 파일들 */}
            {formData.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  새로 추가된 파일:
                </p>
                {formData.files.map((file, index) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">{file.name}</span>
                      <span className="text-xs text-blue-500">(새 파일)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNewFile(index)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
