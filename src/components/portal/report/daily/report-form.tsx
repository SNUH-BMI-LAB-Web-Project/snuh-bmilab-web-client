'use client';

import type React from 'react';

import { useState } from 'react';
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
import { Paperclip, Calendar, FileText, X } from 'lucide-react';
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

const reportApi = new ReportApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

interface ReportFormProps {
  projectList: SearchProjectItem[];
  onReportCreated?: () => void;
}

export function ReportForm({ projectList, onReportCreated }: ReportFormProps) {
  const [content, setContent] = useState('');
  const [project, setProject] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const allFiles = [...files, ...newFiles];
      const uniqueFiles = Array.from(
        new Map(allFiles.map((f) => [f.name + f.size, f])).values(),
      );

      setFiles(uniqueFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content || !project || !date) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }

    const accessToken = useAuthStore.getState().accessToken!;

    try {
      const uploadPromises = files.map((file) =>
        uploadFileWithPresignedUrl(
          file,
          accessToken,
          GeneratePresignedUrlDomainTypeEnum.Report,
        ),
      );

      const uploadedRecords = await Promise.all(uploadPromises);
      const fileIds = uploadedRecords.map((record) => record.fileId!);

      // 보고서 생성 API 호출
      await reportApi.createReport({
        reportRequest: {
          content,
          projectId: Number(project),
          date,
          fileIds,
        },
      });

      toast.success('보고서가 성공적으로 등록되었습니다.');
      setContent('');
      setProject('');
      setFiles([]);
      setDate(new Date());

      onReportCreated?.();
    } catch (error) {
      console.error('보고서 제출 실패:', error);
      toast.error('보고서 제출 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = Array.from(files);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project">프로젝트</Label>
          <Select value={project} onValueChange={setProject} required>
            <SelectTrigger id="project" className="w-full cursor-pointer">
              <SelectValue placeholder="프로젝트 선택" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {projectList?.map((proj) => (
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
          <Label htmlFor="date">보고 날짜</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, 'PPP', { locale: ko })
                ) : (
                  <span>날짜 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-full max-w-[--radix-popover-trigger-width] p-1"
              sideOffset={4}
              align="center"
            >
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={ko}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">보고 내용</Label>
        <Textarea
          id="content"
          placeholder="오늘 진행한 업무 내용을 작성하세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="create-report-files">파일 첨부</Label>
          {files.length > 0 && (
            <span className="text-muted-foreground text-xs">
              {files.length}개 파일 선택됨
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor="create-report-files"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full cursor-pointer items-center rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Paperclip className="mr-2 h-4 w-4" />
            파일 선택
          </Label>
          <Input
            id="create-report-files"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={file.name}
                className="text-muted-foreground relative inline-flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition"
              >
                <div className="flex flex-row items-center gap-2">
                  <FileText className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="hover:bg-muted rounded-full border p-0.5 hover:cursor-pointer"
                  title="파일 삭제"
                >
                  <X className="text-muted-foreground size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" className="w-full">
        보고서 제출
      </Button>
    </form>
  );
}
