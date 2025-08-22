'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ReportApi,
  ReportFindAllResponse,
  ReportSummary,
  SearchProjectItem,
} from '@/generated-api';
import { toast } from 'sonner';
import { ReportEditModal } from '@/components/portal/report/daily/report-edit-form';
import { formatDateTimeVer2, setDateWithFixedHour } from '@/lib/utils';
import { downloadFileFromUrl } from '@/utils/download-file';
import { getApiConfig } from '@/lib/config';

const reportApi = new ReportApi(getApiConfig());

interface ReportFeedProps {
  filters: {
    user?: string;
    project?: string;
  };
  projectList: SearchProjectItem[];
  startDate: Date;
  endDate: Date;
}

export function ReportFeed({
  filters,
  projectList,
  startDate,
  endDate,
}: ReportFeedProps) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(
    null,
  );

  const fetchReports = async () => {
    try {
      const response: ReportFindAllResponse =
        await reportApi.getReportsByCurrentUser({
          projectId: filters.project ? Number(filters.project) : undefined,
          startDate: setDateWithFixedHour(startDate),
          endDate: setDateWithFixedHour(endDate),
        });
      setReports(response.reports ?? []);
    } catch (error) {
      console.error('업무 보고 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters.project, filters.user, startDate, endDate]);

  const handleEdit = (report: ReportSummary) => {
    setSelectedReport(report);
    setEditModalOpen(true);
  };

  const handleReportUpdate = () => {
    setEditModalOpen(false);
    fetchReports();
  };

  const handleDelete = async (id: string) => {
    try {
      await reportApi.deleteReport({ reportId: Number(id) });
      const updatedReports = reports.filter(
        (report) => report.reportId !== Number(id),
      );
      setReports(updatedReports);
      toast.success('업무 보고가 삭제되었습니다.');
    } catch (err) {
      console.log(err);
    }
  };

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
                  <Avatar className="border-1">
                    <AvatarImage
                      src={
                        report.user?.profileImageUrl ||
                        '/default-profile-image.svg'
                      }
                      alt={report.user?.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {report.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 md:flex-col md:items-start lg:flex-row lg:items-center">
                    <p className="mr-2 text-sm font-medium">
                      {report.user?.name}
                    </p>
                    <Badge variant="outline">
                      <div className="max-w-[100px] truncate overflow-hidden whitespace-nowrap lg:max-w-2xs xl:max-w-xl">
                        {report.project?.title}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-right text-xs font-medium">
                    {formatDateTimeVer2(report.date!)}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">메뉴</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(report)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(String(report.reportId))}
                      >
                        <Trash2 className="text-destructive mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      onClick={() =>
                        downloadFileFromUrl(file.fileName!, file.uploadUrl!)
                      }
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      {file.fileName}
                    </Button>
                  ))}
                </div>
              </CardFooter>
            )}
          </Card>
        ))
      )}

      <ReportEditModal
        report={selectedReport!}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onReportUpdate={handleReportUpdate}
        projectList={projectList}
      />
    </div>
  );
}
