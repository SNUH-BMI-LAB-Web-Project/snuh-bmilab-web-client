'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useCallback, SetStateAction } from 'react';
import { AdminReportFeed } from '@/components/system/reports/admin-report-feed';
import { DateRangePicker } from '@/components/common/data-range-picker';
import { FilterControls } from '@/components/system/reports/filter-controls';

export default function AdminPage() {
  const [filters, setFilters] = useState({});

  const handleFilter = useCallback((newFilters: SetStateAction<{}>) => {
    setFilters(newFilters);
    // TODO: api 연동
    console.log('필터 적용:', newFilters);
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">관리자 대시보드</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker />
        </div>
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
        <h3 className="text-xl font-semibold">업무 보고 피드</h3>
        <AdminReportFeed filters={filters} />
      </div>
    </div>
  );
}
