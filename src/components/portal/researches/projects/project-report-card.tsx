'use client';

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { NotepadText } from 'lucide-react';
import UserPopover from '@/components/common/user-popover';
import { AdminReportApi } from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { formatDateTimeVer2 } from '@/lib/utils';

const reportApi = new AdminReportApi(getApiConfig());

interface ProjectReportTimelineCardProps {
  projectId: string | number;
}

export default function ProjectReportTimelineCard({
  projectId,
}: ProjectReportTimelineCardProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!projectId) return;

      setIsReportsLoading(true);
      setReportsError(null);

      try {
        const res = await reportApi.getReportsByAllUser({
          projectId: Number(projectId),
        });

        const list =
          (res as any).contents ??
          (res as any).items ??
          (res as any).reports ??
          res ??
          [];

        setReports(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('일일 업무 보고 조회 실패:', err);
        setReportsError('일일 업무 보고를 불러오지 못했습니다.');
      } finally {
        setIsReportsLoading(false);
      }
    };

    fetchReports();
  }, [projectId]);

  const renderReportItem = (report: any) => {
    const reporter =
      report.user ?? report.writer ?? report.author ?? report.createdBy;
    const date =
      report.reportDate ?? report.date ?? report.createdAt ?? report.updatedAt;

    const content =
      report.content ?? report.summary ?? report.title ?? report.description;

    return (
      <li
        key={
          report.id ?? report.reportId ?? `${date}-${content?.slice?.(0, 10)}`
        }
        className="rounded-md border px-3 py-2"
      >
        <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
          <span>
            {date
              ? formatDateTimeVer2(
                  typeof date === 'string' ? date : new Date(date).toString(),
                )
              : '-'}
          </span>
          {reporter && (
            <div className="flex items-center gap-1">
              <UserPopover user={reporter} />
            </div>
          )}
        </div>
        <div className="text-sm whitespace-pre-wrap">
          {content || '내용이 없습니다.'}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Label className="flex flex-row items-center gap-1 text-lg font-semibold">
        <NotepadText className="h-4 w-4" />
        <span>일일 업무 보고</span>
      </Label>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {isReportsLoading && (
            <div className="text-muted-foreground text-sm">
              일일 업무 보고를 불러오는 중입니다...
            </div>
          )}

          {reportsError && (
            <div className="text-destructive text-sm">{reportsError}</div>
          )}

          {/* 여기 영역만 스크롤되게 설정 */}
          <div className="max-h-80 overflow-y-auto pr-1">
            {!isReportsLoading && !reportsError && reports.length === 0 && (
              <div className="text-muted-foreground text-sm">
                등록된 일일 업무 보고가 없습니다.
              </div>
            )}

            {!isReportsLoading && !reportsError && reports.length > 0 && (
              <ul className="flex flex-col gap-2">
                {reports.map((report) => renderReportItem(report))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
