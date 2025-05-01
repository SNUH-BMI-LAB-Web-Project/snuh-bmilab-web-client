'use client';

import { PaginatedTable } from '@/components/common/paginated-table';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NTISRSSApi } from '@/generated-api/apis/NTISRSSApi';
import { RSSItem } from '@/generated-api/models/RSSItem';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { Configuration } from '@/generated-api/runtime';
import { formatDateTimeVer3 } from '@/lib/utils';
import { toast } from 'sonner';

const getProjectColumns = () => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (_row: RSSItem, index: number) => (index + 1).toString(),
  },
  {
    label: '제목',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[300px]',
    cell: (row: RSSItem) => row.title,
  },
  {
    label: '컨텐츠 배포일',
    className: 'text-center w-[130px]',
    cell: (row: RSSItem) =>
      `${row.publishedAt ? formatDateTimeVer3(row.publishedAt) : ''}`,
  },
  {
    label: '작성기관',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: RSSItem) => row.author,
  },
  {
    label: '부처',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: RSSItem) => row.category,
  },
  {
    label: '접수 기간',
    className: 'text-center w-[300px]',
    cell: (row: RSSItem) =>
      `${row.startDate ? formatDateTimeVer3(row.startDate) : ''} ~ ${row.endDate ? formatDateTimeVer3(row.endDate) : ''}`,
  },
  {
    label: '공고금액',
    className: 'text-center w-[120px]',
    cell: (row: RSSItem) =>
      row.budget !== undefined ? `${row.budget.toLocaleString()}원` : '-',
  },
  {
    label: ' ',
    className: 'text-center w-[80px]',
    cell: (row: RSSItem) => (
      <Button variant="outline" size="icon" asChild>
        <a href={row.link} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    ),
  },
];

export default function RssPage() {
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchRSS = async () => {
      setLoading(true);
      try {
        const api = new NTISRSSApi(
          new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
            accessToken: async () => useAuthStore.getState().accessToken || '',
          }),
        );

        const response = await api.getAllRssAssignments({
          page: currentPage - 1,
          size: itemsPerPage,
        });

        setRssItems(response.items || []);
        setTotalPage(response.totalPage || 0);
      } catch (error) {
        toast.error('RSS 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRSS();
  }, [currentPage, itemsPerPage]);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">RSS 공고</h1>
      </div>

      {/* 페이지네이션 테이블 */}
      <PaginatedTable
        data={rssItems}
        rowKey={(row) => (row.link ? row.link : '')}
        columns={getProjectColumns()}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalPage={totalPage}
        loading={loading}
      />
    </div>
  );
}
