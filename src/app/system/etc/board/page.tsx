'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginatedTable } from '@/components/common/paginated-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { UserApi, UserItem } from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { formatSeatNumberDetail } from '@/utils/user-utils';
import CategoryModal from '@/components/system/etc/board/category-modal';
import { cn } from '@/lib/utils';

const userApi = new UserApi(getApiConfig());

const getUserColumns = (currentPage: number, itemsPerPage: number) => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (row: UserItem, i: number) => (
      <div className={cn('truncate overflow-hidden whitespace-nowrap')}>
        {((currentPage - 1) * itemsPerPage + i + 1).toString()}
      </div>
    ),
  },
  {
    label: '제목',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[250px]',
    cell: (row: UserItem) => (
      <Link href={`/system/users/${row.userId}`} className="hover:underline">
        <div className="font-medium">{row.name}</div>
      </Link>
    ),
  },
  {
    label: '카테고리',
    className: 'text-center w-[150px]',
    cell: (row: UserItem) => {
      const categories = row.categories ?? [];
      if (categories.length === 0) return '-';

      const first = categories[0];
      const othersCount = categories.length - 1;

      return (
        <div className="flex max-w-[150px] items-center gap-1 text-sm">
          <Badge
            variant="secondary"
            className="max-w-[80px]"
            title={first.name}
          >
            <div className="w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {first.name}
            </div>
          </Badge>

          {othersCount > 0 && (
            <span className="text-xs text-gray-500">외 {othersCount}개</span>
          )}
        </div>
      );
    },
  },
  {
    label: '작성자',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: UserItem) => row.department || '-',
  },
  {
    label: '조회수',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: UserItem) => row.department || '-',
  },
  {
    label: '게시일',
    className: 'text-center w-[200px]',
    cell: (row: UserItem) => (
      <Badge
        variant="outline"
        title={formatSeatNumberDetail(row.seatNumber || '융합의학기술원-00-00')}
        className="mx-auto flex max-w-[150px] items-center justify-center border-gray-300 font-mono"
      >
        <div className="max-w-full truncate overflow-hidden whitespace-nowrap">
          {formatSeatNumberDetail(row.seatNumber || '융합의학기술원-00-00')}
        </div>
      </Badge>
    ),
  },
];

export default function SystemBoardPage() {
  // 실시간 입력값
  const [searchTerm, setSearchTerm] = useState('');
  // api 전송을 위한 값
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');

  const [stringSortOption, setStringSortOption] = useState('all');
  const [sortOption, setSortOption] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers({
        filterBy: stringSortOption,
        filterValue: committedSearchTerm,
        direction: sortOption,
        pageNo: currentPage - 1, // 0-based index
        size: itemsPerPage,
        criteria: 'createdAt',
      });
      setUsers(res.users ?? []);
      setTotalPage(res.totalPage ?? 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    itemsPerPage,
    stringSortOption,
    sortOption,
    committedSearchTerm,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setSortOption('asc');
    setStringSortOption('all');
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">정보 게시판</h1>
        <div className="flex gap-2">
          <CategoryModal />
          <Link href="/system/etc/board/new">
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
          <Select value={stringSortOption} onValueChange={setStringSortOption}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 카테고리</SelectItem>
              <SelectItem value="name">이름</SelectItem>
              <SelectItem value="email">이메일</SelectItem>
              <SelectItem value="organization">기관</SelectItem>
              <SelectItem value="department">부서</SelectItem>
              <SelectItem value="position">구분</SelectItem>
              <SelectItem value="categories">연구 분야</SelectItem>
              <SelectItem value="phoneNumber">연락처</SelectItem>
              <SelectItem value="seatNumber">좌석</SelectItem>
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
          data={users}
          rowKey={(row) => String(row.userId)}
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
