'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  AdminReportApi,
  GetReportsByAllUserRequest,
  ReportSummary,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { formatDateTimeVer2 } from '@/lib/utils';

const reportApi = new AdminReportApi(getApiConfig());

export function AdminReportFeed({
  filters = {},
}: {
  filters?: GetReportsByAllUserRequest;
}) {
  const router = useRouter();
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
              일일 업무 보고가 없습니다.
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
                  <div className="flex items-center gap-1 md:flex-col md:items-start lg:flex-row lg:items-center">
                    <p className="mr-2 text-sm font-medium md:pl-2 lg:pl-0">
                      {report.user?.name}
                    </p>
                    <Badge
                      variant="outline"
                      title={report.project?.title}
                      onClick={() =>
                        router.push(
                          `/system/researches/projects/${report.project?.projectId}`,
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="max-w-[120px] truncate overflow-hidden whitespace-nowrap lg:max-w-2xs xl:max-w-xl">
                        {report.project?.title}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-right text-xs font-medium">
                    {formatDateTimeVer2(report.date!)}
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
