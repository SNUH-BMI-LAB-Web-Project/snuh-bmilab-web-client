'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginatedTable } from '@/components/common/paginated-table';
import { Badge } from '@/components/ui/badge';
import {
  GetAllProjectsStatusEnum,
  ProjectApi,
} from '@/generated-api/apis/ProjectApi';
import { ProjectSummary } from '@/generated-api/models/ProjectSummary';
import { SlidersHorizontal, Search, X, Lock, Pin } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { UserApi, UserSummary } from '@/generated-api';
import { cn } from '@/lib/utils';
import { getStatusClassName, getStatusLabel } from '@/utils/project-utils';
import { useProjectCategories } from '@/hooks/use-project-categories';
import { getApiConfig } from '@/lib/config';

const projectApi = new ProjectApi(getApiConfig());

const userApi = new UserApi(getApiConfig());

const formatSortOption = (option: string) => {
  const [field, direction] = option.split('-');
  return `${field},${direction}`;
};

const getProjectColumns = (currentPage: number, itemsPerPage: number) => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (row: ProjectSummary, i: number) => (
      <div
        className={cn(
          'truncate overflow-hidden whitespace-nowrap',
          row.isPrivate && 'opacity-50',
        )}
      >
        {((currentPage - 1) * itemsPerPage + i + 1).toString()}
      </div>
    ),
  },
  {
    label: '제목',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[300px]',
    cell: (row: ProjectSummary) => (
      <div
        className={cn(
          'flex items-center gap-1 truncate overflow-hidden whitespace-nowrap',
          row.isPrivate && 'opacity-50',
        )}
      >
        {row.isPrivate ? (
          <>
            {row.isPinned ? <Pin className="h-3 w-3 shrink-0" /> : null}
            <Lock className="h-3 w-3 shrink-0" />
            <Link
              href={
                row.isAccessible
                  ? `/portal/researches/projects/${row.projectId}`
                  : '/403'
              }
              className="w-full truncate hover:underline"
            >
              {row.title}
            </Link>
          </>
        ) : (
          <Link
            href={`/portal/researches/projects/${row.projectId}`}
            className="flex w-full items-center gap-1 truncate hover:underline"
          >
            {row.isPinned ? <Pin className="h-3 w-3 shrink-0" /> : null}
            {row.title}
          </Link>
        )}
      </div>
    ),
  },
  {
    label: '연구 분야',
    className: 'text-center w-[150px]',
    cell: (row: ProjectSummary) => (
      <div
        className={cn(
          'truncate overflow-hidden whitespace-nowrap',
          row.isPrivate && 'opacity-50',
        )}
      >
        <Badge variant="outline" className="whitespace-nowrap">
          {row.category?.name ?? ''}
        </Badge>
      </div>
    ),
  },
  {
    label: '연구 상태',
    className: 'text-center w-[150px]',
    cell: (row: ProjectSummary) => (
      <div
        className={cn(
          'truncate overflow-hidden whitespace-nowrap',
          row.isPrivate && 'opacity-50',
        )}
      >
        <Badge
          className={cn('whitespace-nowrap', getStatusClassName(row.status))}
        >
          {getStatusLabel(row.status)}
        </Badge>
      </div>
    ),
  },
  {
    label: 'PI',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => {
      const names = row.piList?.map((pi) => pi.name).filter(Boolean) ?? [];
      const display =
        names.length > 1
          ? `${names.slice(0, 1).join(', ')} 외 ${names.length - 1}명`
          : names.join(', ');
      return (
        <div
          className={cn(
            'truncate overflow-hidden whitespace-nowrap',
            row.isPrivate && 'opacity-50',
          )}
        >
          {display}
        </div>
      );
    },
  },
  {
    label: '참여 교수',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => {
      const names =
        row.practicalProfessors?.map((prof) => prof.name).filter(Boolean) ?? [];
      const display =
        names.length > 1
          ? `${names.slice(0, 1).join(', ')} 외 ${names.length - 1}명`
          : names.join(', ');
      return (
        <div
          className={cn(
            'truncate overflow-hidden whitespace-nowrap',
            row.isPrivate && 'opacity-50',
          )}
        >
          {display}
        </div>
      );
    },
  },
  {
    label: '실무 책임자',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => {
      const names =
        row.leaders?.map((leader) => leader.name).filter(Boolean) ?? [];
      const display =
        names.length > 1
          ? `${names.slice(0, 1).join(', ')} 외 ${names.length - 1}명`
          : names.join(', ');
      return (
        <div
          className={cn(
            'truncate overflow-hidden whitespace-nowrap',
            row.isPrivate && 'opacity-50',
          )}
        >
          {display || '-'}
        </div>
      );
    },
  },
  {
    label: '실무 연구자',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => (
      <div
        className={cn(
          'truncate overflow-hidden whitespace-nowrap',
          row.isPrivate && 'opacity-50',
        )}
      >
        {`${row.participantCount ?? 0}명`}
      </div>
    ),
  },
  {
    label: '연구 기간',
    className: 'text-center w-[200px]',
    cell: (row: ProjectSummary) => (
      <div
        className={cn(
          'truncate overflow-hidden whitespace-nowrap',
          row.isPrivate && 'opacity-50',
        )}
      >
        {`${row.startDate?.toISOString().substring(0, 10)} ~ ${
          row.endDate ? row.endDate.toISOString().substring(0, 10) : ''
        }`}
      </div>
    ),
  },
];

export default function ProjectPage() {
  const { data: categoryData } = useProjectCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaderFilter, setLeaderFilter] = useState('all');
  const [piTerm, setPiTerm] = useState('');
  const [committedPiTerm, setCommittedPiTerm] = useState('');
  const [practicalProfessorTerm, setPracticalProfessorTerm] = useState('');
  const [committedPracticalProfessorTerm, setCommittedPracticalProfessorTerm] =
    useState('');
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);

  const [sortOption, setSortOption] = useState('startDate-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);

    const res = await projectApi.getAllProjects({
      search: committedSearchTerm || undefined,
      categoryId: fieldFilter !== 'all' ? Number(fieldFilter) : undefined,
      status:
        statusFilter !== 'all'
          ? (statusFilter as GetAllProjectsStatusEnum)
          : undefined,
      pi: committedPiTerm || undefined,
      practicalProfessor: committedPracticalProfessorTerm || undefined,
      leaderId: leaderFilter !== 'all' ? parseInt(leaderFilter, 10) : undefined,
      page: currentPage - 1,
      size: itemsPerPage,
      sort: sortOption ? [formatSortOption(sortOption)] : undefined,
    });

    setProjects(res.projects ?? []);
    setTotalPage(res.totalPage ?? 1);

    setLoading(false);
  }, [
    committedSearchTerm,
    fieldFilter,
    statusFilter,
    committedPiTerm,
    committedPracticalProfessorTerm,
    leaderFilter,
    currentPage,
    itemsPerPage,
    sortOption,
  ]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await userApi.searchUsers();
        setAllUsers(res.users ?? []);
      } catch (error) {
        console.error('전체 사용자 목록 조회 실패:', error);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setFieldFilter('all');
    setStatusFilter('all');
    setPiTerm('');
    setPracticalProfessorTerm('');
    setLeaderFilter('all');
    setSortOption('endDate-desc');
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">연구 & 프로젝트</h1>
        <Link href="/portal/researches/projects/new">
          <Button>연구 & 프로젝트 등록</Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex flex-row gap-2">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="프로젝트 제목 또는 실무 책임자 검색"
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

          {/* 정렬 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="정렬 방식" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="endDate-desc">종료일 내림차순</SelectItem>
                <SelectItem value="endDate-asc">종료일 오름차순</SelectItem>
                <SelectItem value="startDate-desc">시작일 내림차순</SelectItem>
                <SelectItem value="startDate-asc">시작일 오름차순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 필터링 */}
        {showFilters && (
          <div className="bg-muted/30 flex flex-col gap-4 rounded-md border p-4">
            {/* 1줄: 분야 + 상태 */}
            <div className="flex flex-row gap-4">
              {/* 연구 분야 필터 */}

              <Select
                value={fieldFilter === 'all' ? 'all' : String(fieldFilter)}
                onValueChange={(value) => {
                  setFieldFilter(value === 'all' ? 'all' : Number(value));
                  setCurrentPage(1); // 페이지 초기화
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="연구 분야" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 분야</SelectItem>
                  {categoryData?.map((cat) => (
                    <SelectItem
                      key={cat.categoryId}
                      value={String(cat.categoryId)}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 연구 상태 필터 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="연구 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  {Object.values(GetAllProjectsStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-4">
              <Input
                placeholder="PI 이름 입력"
                value={piTerm}
                onChange={(e) => setPiTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCommittedPiTerm(piTerm);
                    setCurrentPage(1);
                  }
                }}
                className="w-full bg-white"
              />

              <Input
                placeholder="참여 교수 이름 입력"
                value={practicalProfessorTerm}
                onChange={(e) => setPracticalProfessorTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCommittedPracticalProfessorTerm(practicalProfessorTerm);
                    setCurrentPage(1);
                  }
                }}
                className="w-full bg-white"
              />

              {/* 실무 책임자 Select */}
              <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="실무 책임자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 실무 책임자</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.userId} value={String(user.userId)}>
                      {user.name}{' '}
                      <span className="text-muted-foreground text-xs">
                        {user.email}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4" />
                필터 초기화
              </Button>
            </div>
          </div>
        )}

        {/* 페이지네이션 테이블 */}
        <PaginatedTable
          data={projects}
          rowKey={(row) => String(row.projectId)}
          columns={getProjectColumns(currentPage, itemsPerPage)}
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
