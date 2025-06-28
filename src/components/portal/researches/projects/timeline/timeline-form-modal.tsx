'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
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
import { TimelineRequestTypeEnum } from '@/generated-api';
import { GeneratePresignedUrlDomainTypeEnum } from '@/generated-api/apis/FileApi';
import { FileSummary } from '@/generated-api/models/FileSummary';
import { TimelineRequest } from '@/generated-api/models/TimelineRequest';
import { toast } from 'sonner';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import { useAuthStore } from '@/store/auth-store';
import { uploadFileWithPresignedUrl } from '@/lib/upload';

interface TimelineFormModalProps {
  trigger: React.ReactNode;
  onSubmit: (data: TimelineRequest) => void;
}

// TODO: 모달 UI 수정, 등록/수정 한 모달에서 처리하도록 확장, 타임라인 수정 구현

export default function TimelineFormModal({
  trigger,
  onSubmit,
}: TimelineFormModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingPlace, setMeetingPlace] = useState('');
  const [type, setType] = useState<TimelineRequestTypeEnum>('INTERNAL_MEETING');
  const [summary, setSummary] = useState('');
  const [files, setFiles] = useState<FileSummary[]>([]);
  const accessToken = useAuthStore((s) => s.accessToken);

  const handleFileUpload = async (file: File) => {
    try {
      const fileRecord = await uploadFileWithPresignedUrl(
        file,
        accessToken!,
        GeneratePresignedUrlDomainTypeEnum.Timeline,
      );
      setFiles((prev) => [...prev, fileRecord]);
      toast.success('파일 업로드 완료');
    } catch (err) {
      toast.error('파일 업로드 실패');
    }
  };

  const handleConfirm = () => {
    const formatTime = (time: string) => {
      const [hour, minute] = time.split(':');
      const hh = hour.padStart(2, '0');
      const mm = minute.padStart(2, '0');
      return `${hh}:${mm}`;
    };

    onSubmit({
      title,
      date: new Date(date),
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      meetingPlace,
      type,
      summary,
      fileIds: files.map((f) => f.fileId!),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>타임라인 추가</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>제목</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>날짜</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>시작 시간</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label>종료 시간</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>장소</Label>
            <Input
              value={meetingPlace}
              onChange={(e) => setMeetingPlace(e.target.value)}
            />
          </div>
          <div>
            <Label>유형</Label>
            <Select
              value={type}
              onValueChange={(value) =>
                setType(value as TimelineRequestTypeEnum)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNAL_MEETING">내부 미팅</SelectItem>
                <SelectItem value="EXTERNAL_MEETING">외부 미팅</SelectItem>
                <SelectItem value="SUBMISSION_DEADLINE">제출 마감</SelectItem>
                <SelectItem value="MATERIAL_SHARE">자료 공유</SelectItem>
                <SelectItem value="ETC">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>요약</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div>
            <Label>파일 업로드</Label>
            <Input
              type="file"
              onChange={(e) =>
                e.target.files?.[0] && handleFileUpload(e.target.files[0])
              }
            />
            <ul className="mt-2 space-y-1">
              {files.map((file, index) => (
                <FileItem
                  key={file.fileId}
                  file={{ name: file.fileName!, size: file.size }}
                  index={index}
                  onAction={() => window.open(file.uploadUrl, '_blank')} // TODO: 삭제 핸들러로 변경
                  mode="remove"
                />
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
