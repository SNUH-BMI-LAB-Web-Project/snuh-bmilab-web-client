'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useCallback } from 'react';
import { AdminReportFeed } from '@/components/system/reports/admin-report-feed';
import { FilterControls } from '@/components/system/reports/filter-controls';
import { AdminReportApi, GetReportsByAllUserRequest } from '@/generated-api';
import { ReportDownloadModal } from '@/components/system/reports/report-download-modal';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { downloadBlob, ensureLocalNoon } from '@/utils/download-file';
import { getApiConfig } from '@/lib/config';
import { format } from 'date-fns';

const AdminReportsApi = new AdminReportApi(getApiConfig());

// 일일업무보고 다운로드 파일 타입(엑셀, 워드)
type DownloadKind = 'excel' | 'word';

interface RawReportFilter {
  user: string;
  project: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  searchQuery: string;
}

export default function AdminPage() {
  const [filters, setFilters] = useState<GetReportsByAllUserRequest>({});

  const [fileDownloadModalOpen, setFileDownloadModalOpen] = useState(false);

  const [downloadKind, setDownloadKind] = useState<DownloadKind>('excel');

  const handleFilter = useCallback((raw: RawReportFilter) => {
    const mapped: GetReportsByAllUserRequest = {
      userId: raw.user ? parseInt(raw.user, 10) : undefined,
      projectId: raw.project ? parseInt(raw.project, 10) : undefined,
      startDate: raw.dateRange?.from,
      endDate: raw.dateRange?.to,
      keyword: raw.searchQuery || undefined,
    };

    setFilters(mapped);
  }, []);

  const handleAdminDownload = useCallback(
    async ({ from, to }: { from: Date; to: Date }) => {
      const start = ensureLocalNoon(from);
      const end = ensureLocalNoon(to);

      if (downloadKind === 'excel') {
        // 엑셀 다운로드
        const blob = await AdminReportsApi.createReportExcel({
          startDate: start,
          endDate: end,
        });
        downloadBlob(
          blob,
          `일일 업무 보고_${format(start, 'yyyy-MM-dd')}~${format(
            end,
            'yyyy-MM-dd',
          )}.xlsx`,
        );
      } else {
        // 워드 다운로드
        const blob = await AdminReportsApi.getWordFileByCurrentUser1({
          startDate: start,
          endDate: end,
        });
        downloadBlob(
          blob,
          `일일 업무 보고_${format(start, 'yyyy-MM-dd')}~${format(
            end,
            'yyyy-MM-dd',
          )}.docx`,
        );
      }
    },
    [downloadKind],
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">일일 업무 보고</h2>
      </div>
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">필터</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterControls onFilter={handleFilter} />
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">업무 보고 피드</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setDownloadKind('excel');
                setFileDownloadModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              엑셀 파일 다운로드
            </Button>
            <Button
              onClick={() => {
                setDownloadKind('word');
                setFileDownloadModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              워드 파일 다운로드
            </Button>
          </div>
        </div>
        <AdminReportFeed filters={filters} />
      </div>

      <ReportDownloadModal
        open={fileDownloadModalOpen}
        onOpenChange={setFileDownloadModalOpen}
        onDownload={handleAdminDownload}
        title={
          downloadKind === 'excel'
            ? '일일 업무 보고 엑셀 파일 다운로드'
            : '일일 업무 보고 워드 파일 다운로드'
        }
      />
    </div>
  );
}
