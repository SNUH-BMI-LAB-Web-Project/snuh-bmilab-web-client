'use client';

import { PaginatedTable } from '@/components/common/paginated-table';
import { ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NTISRSSApi } from '@/generated-api/apis/NTISRSSApi';
import { RSSItem } from '@/generated-api/models/RSSItem';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { Configuration } from '@/generated-api/runtime';
import { formatDateTimeVer3 } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const ntisrssApi = new NTISRSSApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

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

// TODO: RSS 검색 옵션 추가 (BE 구현 후)

export default function RssPage() {
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minBudget, setMinBudget] = useState<number | undefined>();
  const [maxBudget, setMaxBudget] = useState<number | undefined>();

  useEffect(() => {
    const fetchRSS = async () => {
      setLoading(true);
      try {
        const response = await ntisrssApi.getAllRssAssignments({
          page: currentPage - 1,
          size: itemsPerPage,
          search: committedSearchTerm || undefined,
          minBudget,
          maxBudget,
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
  }, [currentPage, itemsPerPage, committedSearchTerm, minBudget, maxBudget]);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">RSS 공고</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* 검색 input */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="제목 / 작성기관 / 부처 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCommittedSearchTerm(searchTerm);
                setCurrentPage(1);
              }
            }}
            className="pl-8"
          />
        </div>

        {/* 필터 토글 버튼 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-muted' : ''}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* 예산 필터 */}
      {showFilters && (
        <div className="bg-muted/30 mb-6 flex flex-col gap-4 rounded-md border p-4">
          <div className="flex flex-row gap-4">
            <Input
              type="number"
              placeholder="최소 금액"
              value={minBudget ?? ''}
              onChange={(e) =>
                setMinBudget(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full"
            />
            <Input
              type="number"
              placeholder="최대 금액"
              value={maxBudget ?? ''}
              onChange={(e) =>
                setMaxBudget(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full"
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMinBudget(undefined);
                setMaxBudget(undefined);
              }}
            >
              <X className="h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        </div>
      )}

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
