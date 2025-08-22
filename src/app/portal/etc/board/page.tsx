'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginatedTable } from '@/components/common/paginated-table';
import { Badge } from '@/components/ui/badge';
import { Pin, Plus, Search } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  BoardApi,
  BoardCategoryApi,
  BoardCategorySummary,
  BoardSummary,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { cn } from '@/lib/utils';
import { hexToRgbaWithOpacity } from '@/utils/color-utils';

const boardApi = new BoardApi(getApiConfig());

const categoryApi = new BoardCategoryApi(getApiConfig());

const defaultColor = '#6b7280';

const getUserColumns = (currentPage: number, itemsPerPage: number) => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (row: BoardSummary, i: number) => (
      <div className="flex items-center justify-center">
        {row.isPinned ? (
          <Pin className="h-4 w-4 shrink-0" />
        ) : (
          <div className={cn('truncate overflow-hidden whitespace-nowrap')}>
            {row.isPinned ? <Pin className="h-3 w-3 shrink-0" /> : null}
            {((currentPage - 1) * itemsPerPage + i + 1).toString()}
          </div>
        )}
      </div>
    ),
  },
  {
    label: '카테고리',
    className: 'text-center w-[150px]',
    cell: (row: BoardSummary) => (
      <Badge
        title={row.boardCategory?.name}
        className="mx-auto flex max-w-[120px] items-center justify-center border"
        style={{
          backgroundColor: hexToRgbaWithOpacity(
            row.boardCategory?.color || defaultColor,
            0.1,
          ),
          color: row.boardCategory?.color,
          borderColor: hexToRgbaWithOpacity(
            row.boardCategory?.color || defaultColor,
            0.5,
          ),
        }}
      >
        <div className="max-w-full truncate overflow-hidden whitespace-nowrap">
          {row.boardCategory?.name || '-'}
        </div>
      </Badge>
    ),
  },
  {
    label: '제목',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[250px]',
    cell: (row: BoardSummary) => (
      <Link
        href={`/portal/etc/board/${row.boardId}`}
        className="flex items-center gap-1 hover:underline"
      >
        <div
          className={cn(
            'w-[250px] truncate overflow-hidden whitespace-nowrap',
            row.isPinned && 'font-semibold',
          )}
        >
          {row.title}
        </div>
      </Link>
    ),
  },
  {
    label: '작성자',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: BoardSummary) => (
      <div className={cn(row.isPinned && 'font-semibold')}>
        {row.author?.name || '-'}
      </div>
    ),
  },
  // {
  //   label: '조회수',
  //   className:
  //     'text-center truncate overflow-hidden whitespace-nowrap w-[50px]',
  //   cell: (row: BoardSummary) => (
  //     <div className={cn(row.isPinned && 'font-semibold')}>
  //       {row.viewCount || '-'}
  //     </div>
  //   ),
  // },
  {
    label: '게시일',
    className: 'text-center w-[150px]',
    cell: (row: BoardSummary) => (
      <div
        className={cn(
          'truncate overflow-hidden whitespace-nowrap',
          row.isPinned && 'font-semibold',
        )}
      >
        {row.createdAt?.toISOString().substring(0, 10)}
      </div>
    ),
  },
];

export default function PortalBoardPage() {
  // 실시간 입력값
  const [searchTerm, setSearchTerm] = useState('');

  // api 전송을 위한 값
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');

  const [categorySortOption, setCategorySortOption] = useState('all');
  const [sortOption, setSortOption] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [posts, setPosts] = useState<BoardSummary[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [boardCategorys, setBoardCategorys] = useState<BoardCategorySummary[]>(
    [],
  );

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await boardApi.getAllBoards({
        search: committedSearchTerm,
        category: categorySortOption === 'all' ? '' : categorySortOption,
        page: currentPage - 1, // 0-based index
        size: itemsPerPage,
        sort: [`createdAt,${sortOption}`],
      });
      setPosts(res.boards ?? []);
      setTotalPage(res.totalPage ?? 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAllBoardCategories();
      setBoardCategorys(res.categories ?? []);
    } catch (error) {
      console.error('카테고리 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [
    currentPage,
    itemsPerPage,
    categorySortOption,
    sortOption,
    committedSearchTerm,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setSortOption('desc');
    setCategorySortOption('all');
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">정보 게시판</h1>
        <div className="flex gap-2">
          <Link href="/portal/etc/board/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              게시글 등록
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-row gap-2">
          {/* 검색 필터 선택 */}
          <Select
            value={categorySortOption}
            onValueChange={setCategorySortOption}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent className="w-[200px]">
              <SelectItem value="all">모든 카테고리</SelectItem>
              {boardCategorys.map((category) => (
                <SelectItem
                  key={category.boardCategoryId}
                  value={category.name ?? ''}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="제목으로 검색"
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

          {/* 게시일로 정렬 */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">게시일 오름차순</SelectItem>
              <SelectItem value="desc">게시일 내림차순</SelectItem>
            </SelectContent>
          </Select>

          {/* 필터링 초기화 버튼 */}
          {committedSearchTerm && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              초기화
            </Button>
          )}
        </div>

        {/* 페이지네이션 테이블 */}
        <PaginatedTable
          data={posts}
          rowKey={(row) => String(row.boardId)}
          columns={getUserColumns(currentPage, itemsPerPage)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalPage={totalPage}
          loading={loading}
        />
      </div>
    </div>
  );
}
