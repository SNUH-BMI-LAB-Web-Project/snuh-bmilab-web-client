'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Plus,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  PresentationIcon,
  Users,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Meeting } from '@/types/researches';
import { cn, formatDateTimeVer2 } from '@/lib/utils';

interface MeetingTimelineProps {
  projectId: string;
  meetings: Meeting[];
}

export default function MeetingTimeline({
  projectId,
  meetings,
}: MeetingTimelineProps) {
  const handleAddMeeting = () => {
    console.log('Add meeting button clicked');
  };

  const handleViewMeeting = (meeting: Meeting) => {
    console.log('Add meeting view clicked', meeting.id);
  };

  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case '정기 미팅':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case '임시 미팅':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case '연구 발표':
        return <PresentationIcon className="h-5 w-5 text-blue-500" />;
      case '외부 협력':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMeetingColor = (type: string) => {
    switch (type) {
      case '정기 미팅':
        return 'bg-green-50 border-green-200';
      case '임시 미팅':
        return 'bg-amber-50 border-amber-200';
      case '연구 발표':
        return 'bg-blue-50 border-blue-200';
      case '외부 협력':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-semibold">미팅 타임라인</CardTitle>
        <Button onClick={handleAddMeeting}>
          <Plus className="h-4 w-4" /> 미팅 추가
        </Button>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto pr-2">
        {meetings.length === 0 ? (
          <div className="text-muted-foreground flex h-24 items-center justify-center">
            <p>아직 기록된 미팅이 없습니다.</p>
          </div>
        ) : (
          <div className="px-6">
            {sortedMeetings.map((meeting, index) => (
              <div key={meeting.id} className="relative mb-8">
                <div className="border-background absolute top-0 left-[-36px] z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 bg-white">
                  {getMeetingIcon(meeting.type)}
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleViewMeeting(meeting);
                    }
                  }}
                  className={cn(
                    'ml-2 w-full cursor-pointer rounded-lg border-2 p-4 transition-colors hover:shadow-sm',
                    getMeetingColor(meeting.type),
                  )}
                  onClick={() => handleViewMeeting(meeting)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center justify-between">
                      <h3 className="max-w-[230px] truncate text-sm font-medium">
                        {meeting.title}
                      </h3>

                      <Badge
                        variant="outline"
                        className="rounded-full bg-white text-xs"
                      >
                        {meeting.type}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateTimeVer2(meeting.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>
                          {meeting.startTime} - {meeting.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="max-w-[300px] truncate text-xs">
                      {meeting.summary}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      댓글 {meeting.comments.length}
                    </div>
                  </div>

                  {index < sortedMeetings.length - 1 && (
                    <div className="border-l-1.5 absolute top-8 bottom-[-32px] left-[-22px] w-px border" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
