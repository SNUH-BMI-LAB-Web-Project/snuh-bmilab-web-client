'use client';

import { dummyRss } from '@/data/rss';
import { PaginatedTable } from '@/components/common/paginated-table';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRssFilterStore } from '@/hooks/use-rss-filters';
import { Rss } from '@/types/researches';

const getProjectColumns = () => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (_row: Rss, index: number) => (index + 1).toString(),
  },
  {
    label: '제목',
    className: 'text-left',
    cell: (row: Rss) => row.title,
  },
  {
    label: '상세내용',
    className: 'text-center',
    cell: (row: Rss) => row.description,
  },
  {
    label: '컨텐츠 배포일',
    className: 'text-center',
    cell: (row: Rss) => row.pubDate,
  },
  {
    label: '작성기관',
    className: 'text-center',
    cell: (row: Rss) => row.author,
  },
  {
    label: '부처',
    className: 'text-center',
    cell: (row: Rss) => row.category,
  },
  {
    label: '접수 기간',
    className: 'text-center',
    cell: (row: Rss) => `${row.appbegin} ~ ${row.appdue}`,
  },
  {
    label: '공고금액',
    className: 'text-center',
    cell: (row: Rss) => `${row.budget.toLocaleString()}원`,
  },
  {
    label: '바로가기',
    className: 'text-center',
    cell: (row: Rss) => (
      <Button variant="outline" size="icon" asChild>
        <a href={row.link} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    ),
  },
];

export default function RssPage() {
  const { currentPage, itemsPerPage, setCurrentPage, setItemsPerPage } =
    useRssFilterStore();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">RSS 공고</h1>
      </div>
      <PaginatedTable
        data={dummyRss}
        rowKey={(row) => row.link}
        columns={getProjectColumns()}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
}
