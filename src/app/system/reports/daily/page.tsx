'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useCallback } from 'react';
import { AdminReportFeed } from '@/components/system/reports/admin-report-feed';
import { FilterControls } from '@/components/system/reports/filter-controls';
import { AdminReportApi, GetReportsByAllUserRequest } from '@/generated-api';
import { ReportDownloadModal } from '@/components/system/reports/report-download-modal';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { downloadBlob, ensureLocalNoon } from '@/utils/download-file';
import { getApiConfig } from '@/lib/config';
import { format } from 'date-fns';

const AdminReportsApi = new AdminReportApi(getApiConfig());

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

      const blob = await AdminReportsApi.createReportExcel({
        startDate: start,
        endDate: end,
      });

      downloadBlob(
        blob,
        `일일 업무 보고_${format(start, 'yyyy-MM-dd')}~${format(end, 'yyyy-MM-dd')}.xlsx`,
      );
    },
    [],
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
          <Button
            onClick={() => setFileDownloadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            엑셀 파일 다운로드
          </Button>
        </div>
        <AdminReportFeed filters={filters} />
      </div>

      <ReportDownloadModal
        open={fileDownloadModalOpen}
        onOpenChange={setFileDownloadModalOpen}
        onDownload={handleAdminDownload}
      />
    </div>
  );
}
