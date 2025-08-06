'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useCallback } from 'react';
import { AdminReportFeed } from '@/components/system/reports/admin-report-feed';
import { FilterControls } from '@/components/system/reports/filter-controls';
import { GetReportsByAllUserRequest } from '@/generated-api';
// import { Button } from '@/components/ui/button';
// import { Mail } from 'lucide-react';
import { EmailReportModal } from '@/components/system/reports/email-report-modal';

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

  const [emailModalOpen, setEmailModalOpen] = useState(false);

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
          {/* <Button */}
          {/*   onClick={() => setEmailModalOpen(true)} */}
          {/*   className="flex items-center gap-2" */}
          {/* > */}
          {/*   <Mail className="h-4 w-4" /> */}
          {/*   이메일로 전송 */}
          {/* </Button> */}
        </div>
        <AdminReportFeed filters={filters} />
      </div>

      {/* 이메일 전송 모달 */}
      <EmailReportModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
      />
    </div>
  );
}
