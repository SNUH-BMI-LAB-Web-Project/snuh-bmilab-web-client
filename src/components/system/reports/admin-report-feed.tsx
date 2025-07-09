'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AdminReportApi,
  Configuration,
  GetReportsByAllUserRequest,
  ReportSummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';

const reportApi = new AdminReportApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

export function AdminReportFeed({
  filters = {},
}: {
  filters?: GetReportsByAllUserRequest;
}) {
  const [reports, setReports] = useState<ReportSummary[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportApi.getReportsByAllUser(filters);
        setReports(res.reports ?? []);
      } catch (error) {
        console.error('보고서 조회 실패:', error);
      }
    };

    fetchReports();
  }, [filters]);

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center text-sm">
              조건에 맞는 보고서가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        reports.map((report) => (
          <Card key={report.reportId} className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        report.user?.profileImageUrl ||
                        '/default-profile-image.svg'
                      }
                      alt={report.user?.name}
                      className="object-cover"
                    />
                  </Avatar>
                  <div className="flex items-center">
                    <p className="mr-2 text-sm font-medium">
                      {report.user?.name}
                    </p>
                    <Badge variant="outline">{report.project?.title}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-right text-xs font-medium">
                    {report.createdAt &&
                      format(report.createdAt, 'yyyy년 MM월 dd일', {
                        locale: ko,
                      })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{report.content}</p>
            </CardContent>
            {report.files && report.files.length > 0 && (
              <CardFooter className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {report.files.map((file) => (
                    <Button
                      key={file.fileName}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={file.uploadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        {file.fileName}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardFooter>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
