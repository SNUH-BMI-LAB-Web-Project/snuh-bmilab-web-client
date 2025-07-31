'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Plus,
  FileText,
  Presentation,
  MapPin,
  Paperclip,
  EllipsisVertical,
  Pencil,
  Trash,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTimeVer2 } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { TimelineApi } from '@/generated-api/apis/TimelineApi';
import { TimelineSummary } from '@/generated-api/models/TimelineSummary';
import TimelineFormModal from '@/components/portal/researches/projects/timeline/timeline-form-modal';
import { TimelineRequest } from '@/generated-api';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ConfirmModal from '@/components/common/confirm-modal';
import { downloadFileFromUrl } from '@/utils/download-file';
import { getApiConfig } from '@/lib/config';

const timelineApi = new TimelineApi(getApiConfig());

interface TimelineCardProps {
  projectId: string;
  canEdit: boolean;
}

export default function TimelineCard({
  projectId,
  canEdit,
}: TimelineCardProps) {
  const [timelines, setTimelines] = useState<TimelineSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TimelineSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimelineSummary | null>(
    null,
  );

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const response = await timelineApi.getAllTimelinesByProjectId({
          projectId: Number(projectId),
        });
        setTimelines(response.timelines || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTimelines();
  }, [projectId]);

  const fetchTimelines = useCallback(async () => {
    try {
      const response = await timelineApi.getAllTimelinesByProjectId({
        projectId: Number(projectId),
      });
      setTimelines(response.timelines || []);
    } catch (err) {
      console.error('타임라인 데이터를 불러오는 데 실패');
    }
  }, [projectId]);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  const sanitizeTimelineData = (
    data: TimelineRequest,
  ): Partial<TimelineSummary> => ({
    ...data,
    startTime: data.startTime ?? undefined,
    endTime: data.endTime ?? undefined,
    meetingPlace: data.meetingPlace ?? undefined,
  });

  const handleSubmit = async (data: TimelineRequest) => {
    try {
      await timelineApi.createTimeline({
        projectId: Number(projectId),
        timelineRequest: data,
      });

      toast.success('타임라인이 성공적으로 등록되었습니다.');
      await fetchTimelines();
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async (data: TimelineRequest) => {
    if (!editTarget) return;

    try {
      await timelineApi.updateTimeline({
        projectId: Number(projectId),
        timelineId: editTarget.timelineId!,
        timelineRequest: data,
      });

      toast.success('타임라인이 성공적으로 수정되었습니다.');

      // 수정된 항목만 갱신 (전체 fetch보다 가볍게)
      setTimelines((prev) =>
        prev.map((t) =>
          t.timelineId === editTarget.timelineId
            ? { ...t, ...sanitizeTimelineData(data) }
            : t,
        ),
      );

      setEditTarget(null); // 모달 닫기
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (timelineId: number) => {
    try {
      await timelineApi.deleteTimeline({
        projectId: Number(projectId),
        timelineId,
      });

      toast.success('타임라인이 삭제되었습니다.');
      setTimelines((prev) => prev.filter((t) => t.timelineId !== timelineId));
    } catch (err) {
      console.log(err);
    }
  };

  const sortedTimelines = [...timelines].sort(
    (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime(),
  );

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'INTERNAL_MEETING':
        return <div className="h-5 w-5 rounded-full bg-yellow-400" />;
      case 'EXTERNAL_MEETING':
        return <div className="h-5 w-5 rounded-full bg-orange-400" />;
      case 'SUBMISSION_DEADLINE':
        return <div className="h-5 w-5 rounded-full bg-red-400" />;
      case 'MATERIAL_SHARE':
        return <div className="h-5 w-5 rounded-full bg-blue-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'INTERNAL_MEETING':
        return 'bg-yellow-50 border-yellow-200';
      case 'EXTERNAL_MEETING':
        return 'bg-orange-50 border-orange-200';
      case 'SUBMISSION_DEADLINE':
        return 'bg-red-50 border-red-200';
      case 'MATERIAL_SHARE':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTimelineTypeLabel = (type: string) => {
    switch (type) {
      case 'INTERNAL_MEETING':
        return '내부 미팅';
      case 'EXTERNAL_MEETING':
        return '외부 미팅';
      case 'SUBMISSION_DEADLINE':
        return '제출 마감';
      case 'MATERIAL_SHARE':
        return '자료 공유';
      default:
        return '기타';
    }
  };

  const getTimelineBgHoverColor = (type: string) => {
    switch (type) {
      case 'INTERNAL_MEETING':
        return 'hover:bg-yellow-100';
      case 'EXTERNAL_MEETING':
        return 'hover:bg-orange-100';
      case 'SUBMISSION_DEADLINE':
        return 'hover:bg-red-100';
      case 'MATERIAL_SHARE':
        return 'hover:bg-blue-100';
      default:
        return 'hover:bg-gray-100';
    }
  };

  const getTimeText = (start?: string, end?: string) => {
    if (start && end) return `${start} - ${end}`;
    if (start) return `${start}`;
    return '시간 미지정';
  };

  const shortenFileName = (name: string, maxLength = 24) => {
    if (name.length <= maxLength) return name;

    const prefix = name.slice(0, 15);
    const suffix = name.slice(-8);
    return `${prefix}...${suffix}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <Label className="flex flex-row items-center justify-between text-lg font-semibold">
          <Presentation className="h-4 w-4" />
          <span>타임라인</span>
        </Label>
        {canEdit && (
          <>
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="gap-1 px-2 py-1"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4" /> 타임라인 추가
            </Button>

            <TimelineFormModal
              mode="create"
              open={open}
              onOpenChange={setOpen}
              onSubmit={(data) => {
                handleSubmit(data);
                setOpen(false);
              }}
            />
          </>
        )}
      </div>
      <Card>
        <CardContent className="max-h-[400px] overflow-y-auto pr-2">
          {timelines.length === 0 ? (
            <div className="text-muted-foreground flex h-24 items-center justify-center text-sm">
              <p>아직 기록된 타임라인이 없습니다.</p>
            </div>
          ) : (
            <div className="px-6">
              {sortedTimelines.map((timeline, index) => (
                <div key={timeline.timelineId} className="relative mb-8">
                  <div className="border-background absolute top-0 left-[-36px] z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 bg-white">
                    {getTimelineIcon(timeline.timelineType!)}
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'ml-2 w-full cursor-pointer rounded-lg border-2 p-4 transition-colors hover:shadow-sm',
                      getTimelineColor(timeline.timelineType!),
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center justify-between">
                        <h3 className="max-w-[230px] truncate text-sm font-medium">
                          {timeline.title}
                        </h3>

                        <div className="flex flex-row items-center gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full bg-white text-xs"
                          >
                            {getTimelineTypeLabel(timeline.timelineType!)}
                          </Badge>
                          {canEdit && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={cn(
                                    'size-5 p-3',
                                    getTimelineBgHoverColor(
                                      timeline.timelineType!,
                                    ),
                                  )}
                                >
                                  <EllipsisVertical />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="bottom"
                                align="end"
                                className="w-28 p-1"
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start gap-2 px-2 py-1 text-sm"
                                  onClick={() => setEditTarget(timeline)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  수정하기
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive focus:text-destructive w-full justify-start gap-2 px-2 py-1 text-sm"
                                  onClick={() => setDeleteTarget(timeline)}
                                >
                                  <Trash className="h-4 w-4" />
                                  삭제하기
                                </Button>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDateTimeVer2(
                              timeline.date?.toString() || '',
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>
                            {getTimeText(timeline.startTime, timeline.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          <span>{timeline.meetingPlace || '장소 미지정'}</span>
                        </div>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {timeline.summary}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Paperclip className="h-3 w-3" />
                        {timeline.files && timeline.files.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {timeline.files.map((file) => (
                              <Button
                                key={file.fileId}
                                variant="ghost"
                                className="p-0 hover:bg-transparent"
                                onClick={() =>
                                  downloadFileFromUrl(
                                    file.fileName!,
                                    file.uploadUrl!,
                                  )
                                }
                              >
                                <Badge
                                  variant="outline"
                                  className="max-w-[500px] cursor-pointer overflow-hidden bg-white px-2 py-1 whitespace-nowrap"
                                  title={file.fileName}
                                >
                                  {shortenFileName(file.fileName!)}
                                </Badge>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs">
                            첨부파일 없음
                          </div>
                        )}
                      </div>
                    </div>

                    {index < sortedTimelines.length - 1 && (
                      <div className="border-l-1.5 absolute top-8 bottom-[-32px] left-[-22px] w-px border" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {editTarget && (
        <TimelineFormModal
          mode="edit"
          open={!!editTarget}
          onOpenChange={(v) => {
            if (!v) setEditTarget(null);
          }}
          initialData={editTarget}
          onSubmit={async (data) => {
            await handleUpdate(data);
            await fetchTimelines();
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          open={!!deleteTarget}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeleteTarget(null);
          }}
          title="타임라인 삭제"
          description="선택한 타임라인 기록을 삭제하시겠습니까? 관련된 자료도 함께 삭제되며, 이 작업은 되돌릴 수 없습니다."
          onConfirm={() => {
            handleDelete(deleteTarget.timelineId!);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
