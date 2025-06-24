'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTimeVer2, formatDateTimeVer4 } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { TimelineApi } from '@/generated-api/apis/TimelineApi';
import { Configuration } from '@/generated-api/runtime';
import { TimelineSummary } from '@/generated-api/models/TimelineSummary';
import { useAuthStore } from '@/store/auth-store';
import TimelineFormModal from '@/components/portal/researches/projects/timeline/timeline-form-modal';
import { TimelineRequest } from '@/generated-api';
import { toast } from 'sonner';

interface TimelineCardProps {
  projectId: string;
}

export default function TimelineCard({ projectId }: TimelineCardProps) {
  const [timelines, setTimelines] = useState<TimelineSummary[]>([]);

  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const api = new TimelineApi(
          new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
            accessToken: async () => accessToken || '',
          }),
        );
        const response = await api.getAllTimelinesByProjectId({
          projectId: Number(projectId),
        });
        setTimelines(response.timelines || []);
      } catch (err) {
        toast.error('타임라인 데이터를 불러오는 데 실패했습니다.');
      }
    };

    fetchTimelines();
  }, [projectId]);

  const handleSubmit = async (data: TimelineRequest) => {
    try {
      const api = new TimelineApi(
        new Configuration({
          basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
          accessToken: async () => accessToken || '',
        }),
      );

      await api.createTimeline({
        projectId: Number(projectId),
        timelineRequest: data,
      });

      toast.success('타임라인이 성공적으로 등록되었습니다.');
      // TODO: 타임라인 새로고침 로직 호출 필요 시 여기에
    } catch (err) {
      toast.error('타임라인 등록 중 오류가 발생했습니다.');
    }
  };

  const handleViewTimeline = (timeline: TimelineSummary) => {
    console.log('Timeline view clicked', timeline.timelineId);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <Label className="flex flex-row items-center justify-between text-lg font-semibold">
          <Presentation className="h-4 w-4" />
          <span>타임라인</span>
        </Label>

        <TimelineFormModal
          onSubmit={handleSubmit}
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> 타임라인 추가
            </Button>
          }
        />
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleViewTimeline(timeline);
                      }
                    }}
                    className={cn(
                      'ml-2 w-full cursor-pointer rounded-lg border-2 p-4 transition-colors hover:shadow-sm',
                      getTimelineColor(timeline.timelineType!),
                    )}
                    onClick={() => handleViewTimeline(timeline)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center justify-between">
                        <h3 className="max-w-[230px] truncate text-sm font-medium">
                          {timeline.title}
                        </h3>

                        <Badge
                          variant="outline"
                          className="rounded-full bg-white text-xs"
                        >
                          {getTimelineTypeLabel(timeline.timelineType!)}
                        </Badge>
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
                            {formatDateTimeVer4(timeline.startTime)} -{' '}
                            {formatDateTimeVer4(timeline.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          <span>{timeline.meetingPlace || '장소 미지정'}</span>
                        </div>
                      </div>
                      <div className="text-sm">{timeline.summary}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Paperclip className="h-3 w-3" />
                        {timeline.files && timeline.files.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {timeline.files.map((file) => (
                              <a
                                key={file.fileId}
                                href={file.uploadUrl}
                                download={file.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Badge
                                  variant="outline"
                                  className="bg-white px-2 py-1"
                                >
                                  {file.fileName}
                                </Badge>
                              </a>
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
    </div>
  );
}
