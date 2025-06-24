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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Configuration,
  ReportApi,
  ReportFindAllResponse,
  ReportSummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

interface ReportFeedProps {
  filters: {
    user?: string;
    project?: string; // projectId (string으로 전달됨)
  };
}

export function ReportFeed({ filters }: ReportFeedProps) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [page, setPage] = useState(0);

  const api = new ReportApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  const fetchReports = async () => {
    try {
      const response: ReportFindAllResponse = await api.getReportsByCurrentUser(
        {
          projectId: filters.project ? Number(filters.project) : undefined,
        },
      );

      setReports(response.reports ?? []);
    } catch (err) {
      console.error('업무 보고 불러오기 실패', err);
    }
  };

  // 필터 변경 시 초기화
  useEffect(() => {
    setReports([]);
    setPage(0);
  }, [filters]);

  // 필터 or 페이지 변경 시 fetch
  useEffect(() => {
    fetchReports();
  }, [filters, page]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReport({ reportId: Number(id) });
      const updatedReports = reports.filter(
        (report) => report.reportId !== Number(id),
      );
      setReports(updatedReports);
      toast.success('업무 보고가 삭제되었습니다.');
    } catch (err) {
      console.error('보고서 삭제 실패:', err);
      toast.error('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center">
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
                      src={report.user?.profileImageUrl || '/placeholder.svg'}
                      alt={report.user?.name}
                    />
                    <AvatarFallback>
                      {report.user?.name?.charAt(0)}
                    </AvatarFallback>
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
                    {report.createdAt
                      ? format(new Date(report.createdAt), 'yyyy년 MM월 dd일', {
                          locale: ko,
                        })
                      : '날짜 없음'}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">메뉴</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
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
