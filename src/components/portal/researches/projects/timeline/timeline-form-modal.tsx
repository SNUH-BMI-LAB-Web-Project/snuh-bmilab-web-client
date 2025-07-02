'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Paperclip, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TimelineRequestTypeEnum } from '@/generated-api';
import { GeneratePresignedUrlDomainTypeEnum } from '@/generated-api/apis/FileApi';
import { FileSummary, TimelineSummary } from '@/generated-api/models';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { uploadFileWithPresignedUrl } from '@/lib/upload';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import TimePicker from '@/components/common/time-picker';

interface Props {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TimelineSummary;
  onSubmit: (data: {
    timelineId?: number;
    title: string;
    date: Date;
    startTime?: string | null;
    endTime?: string | null;
    meetingPlace?: string | null;
    type: TimelineRequestTypeEnum;
    summary: string;
    fileIds?: string[];
  }) => void;
}

export default function TimelineFormModal({
  mode,
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<{
    title: string;
    date: Date | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    meetingPlace: string;
    type: TimelineRequestTypeEnum;
    summary: string;
    files: FileSummary[];
    existingFiles: FileSummary[];
  }>({
    title: '',
    date: undefined,
    startTime: undefined,
    endTime: undefined,
    meetingPlace: '',
    type: 'INTERNAL_MEETING',
    summary: '',
    files: [],
    existingFiles: [],
  });

  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        title: initialData.title!,
        date: new Date(initialData.date!),
        startTime: initialData.startTime || undefined,
        endTime: initialData.endTime || undefined,
        meetingPlace: initialData.meetingPlace!,
        type: initialData.timelineType! as TimelineRequestTypeEnum,
        summary: initialData.summary!,
        files: [],
        existingFiles: initialData.files ?? [],
      });
    } else if (open) {
      setFormData({
        title: '',
        date: undefined,
        startTime: undefined,
        endTime: undefined,
        meetingPlace: '',
        type: 'INTERNAL_MEETING',
        summary: '',
        files: [],
        existingFiles: [],
      });
    }
  }, [initialData, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadFileWithPresignedUrl(
        file,
        accessToken!,
        GeneratePresignedUrlDomainTypeEnum.Timeline,
      );
      setFormData((prev) => ({ ...prev, files: [...prev.files, uploaded] }));
      toast.success('파일 업로드 완료');
    } catch {
      toast.error('파일 업로드 실패');
    } finally {
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
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

  const formatTime = (time: string) => {
    const [hh, mm] = time.split(':');
    return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (
      !formData.title ||
      !formData.type ||
      !formData.date ||
      !formData.summary
    ) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const existingFileIds = formData.existingFiles.map((f) => f.fileId!);
      const newFileIds = formData.files.map((f) => f.fileId!);

      onSubmit({
        timelineId: initialData?.timelineId,
        title: formData.title,
        date: formData.date,
        startTime: formData.startTime?.trim()
          ? formatTime(formData.startTime)
          : null,
        endTime: formData.endTime?.trim() ? formatTime(formData.endTime) : null,
        meetingPlace: formData.meetingPlace?.trim()
          ? formData.meetingPlace
          : null,
        type: formData.type,
        summary: formData.summary,
        fileIds: [...existingFileIds, ...newFileIds],
      });

      onOpenChange(false);
    } catch (err) {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? '타임라인 수정' : '타임라인 등록'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>
              제목 <span className="text-destructive text-xs">*</span>
            </Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                유형 <span className="text-destructive text-xs">*</span>
              </Label>
              <div className="w-full">
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      type: val as TimelineRequestTypeEnum,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="INTERNAL_MEETING">내부 미팅</SelectItem>
                    <SelectItem value="EXTERNAL_MEETING">외부 미팅</SelectItem>
                    <SelectItem value="SUBMISSION_DEADLINE">
                      제출 마감
                    </SelectItem>
                    <SelectItem value="MATERIAL_SHARE">자료 공유</SelectItem>
                    <SelectItem value="ETC">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                날짜 <span className="text-destructive text-xs">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, 'PPP', { locale: ko })
                    ) : (
                      <span>날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData((p) => ({ ...p, date }))}
                    locale={ko}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TimePicker
              label="시작 시간"
              time={formData.startTime}
              onChange={(val) => setFormData((p) => ({ ...p, startTime: val }))}
            />
            <TimePicker
              label="종료 시간"
              time={formData.endTime}
              onChange={(val) => setFormData((p) => ({ ...p, endTime: val }))}
            />
          </div>

          <div className="space-y-2">
            <Label>장소</Label>
            <Input
              value={formData.meetingPlace}
              onChange={(e) =>
                setFormData((p) => ({ ...p, meetingPlace: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              요약 <span className="text-destructive text-xs">*</span>
            </Label>
            <Textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData((p) => ({ ...p, summary: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">파일 첨부</Label>
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
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {formData.existingFiles.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {formData.existingFiles.map((file, index) => (
                  <FileItem
                    key={file.fileId}
                    file={{ name: file.fileName!, size: file.size }}
                    index={index}
                    onAction={() => removeExistingFile(index)}
                    mode="remove"
                  />
                ))}
              </div>
            )}

            {formData.files.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {formData.files.map((file, index) => (
                  <FileItem
                    key={file.fileId}
                    file={{ name: file.fileName!, size: file.size }}
                    index={index}
                    onAction={() => removeFile(index)}
                    mode="remove"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {mode === 'edit' ? '수정' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
