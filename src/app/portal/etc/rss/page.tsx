'use client';

import { PaginatedTable } from '@/components/common/paginated-table';
import { ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GetAllRssAssignmentsSearchTypeEnum,
  NTISRSSApi,
} from '@/generated-api/apis/NTISRSSApi';
import { RSSItem } from '@/generated-api/models/RSSItem';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { Configuration } from '@/generated-api/runtime';
import { formatDateTimeVer3 } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { rssSearchTypeOptions } from '@/constants/rss-search-enum';

const ntisrssApi = new NTISRSSApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

const getProjectColumns = (currentPage: number, itemsPerPage: number) => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (_row: RSSItem, index: number) =>
      ((currentPage - 1) * itemsPerPage + index + 1).toString(),
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minBudget, setMinBudget] = useState<number | undefined>();
  const [maxBudget, setMaxBudget] = useState<number | undefined>();
  const [searchType, setSearchType] =
    useState<GetAllRssAssignmentsSearchTypeEnum>(
      GetAllRssAssignmentsSearchTypeEnum.Title,
    );

  useEffect(() => {
    const fetchRSS = async () => {
      setLoading(true);
      try {
        const response = await ntisrssApi.getAllRssAssignments({
          page: currentPage - 1,
          size: itemsPerPage,
          searchType,
          keyword: committedSearchTerm || undefined,
          minBudget,
          maxBudget,
        });

        setRssItems(response.items || []);
        setTotalPage(response.totalPage || 0);
      } catch (error) {
        toast.error(
          'RSS 데이터를 가져오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
        );
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
        {/* 검색 타입 */}
        <Select
          value={searchType}
          onValueChange={(val) =>
            setSearchType(val as GetAllRssAssignmentsSearchTypeEnum)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="검색 항목" />
          </SelectTrigger>
          <SelectContent>
            {rssSearchTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            {/* 최소 금액 */}
            <div className="relative w-full">
              <Input
                type="number"
                step={1_000_000}
                min={0}
                max={maxBudget}
                placeholder="최소 금액 (원 단위)"
                value={minBudget ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  if (
                    value !== undefined &&
                    maxBudget !== undefined &&
                    value > maxBudget
                  ) {
                    toast.error('최소 금액은 최대 금액보다 클 수 없습니다.');
                    return;
                  }
                  setMinBudget(value);
                }}
              />
              {minBudget !== undefined && (
                <span className="text-muted-foreground absolute top-1/2 right-10 -translate-y-1/2 text-sm">
                  {minBudget.toLocaleString()} 원
                </span>
              )}
            </div>

            {/* 최대 금액 */}
            <div className="relative w-full">
              <Input
                type="number"
                step={1_000_000}
                min={minBudget ?? 0}
                placeholder="최대 금액 (원 단위)"
                value={maxBudget ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  if (
                    value !== undefined &&
                    minBudget !== undefined &&
                    value < minBudget
                  ) {
                    toast.error('최대 금액은 최소 금액보다 작을 수 없습니다.');
                    return;
                  }
                  setMaxBudget(value);
                }}
              />
              {maxBudget !== undefined && (
                <span className="text-muted-foreground absolute top-1/2 right-10 -translate-y-1/2 text-sm">
                  {maxBudget.toLocaleString()} 원
                </span>
              )}
            </div>
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
        columns={getProjectColumns(currentPage, itemsPerPage)}
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
