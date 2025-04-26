'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PaginatedTable } from '@/components/common/paginated-table';
import { useProjectFilterStore } from '@/hooks/use-project-filters';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  allProjects,
  projectCategories,
  projectStatuses,
  sortOptions,
} from '@/data/projects';
import { users } from '@/data/users';
import { getStatusColor } from '@/lib/utils';
import type { Project } from '@/types/project';
import { canEditProject, canDeleteProject, currentUser } from '@/data/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

const handleDelete = (projectId: string) => {
  console.log('삭제 요청된 프로젝트:', projectId);
};

const getProjectColumns = (
  currentPage: number,
  itemsPerPage: number,
  router: ReturnType<typeof useRouter>,
) => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (_: unknown, i: number) =>
      ((currentPage - 1) * itemsPerPage + i + 1).toString(),
  },
  {
    label: '제목',
    cell: (row: Project) => (
      <Link
        href={`/portal/researches/projects/${row.projectId}`}
        className="hover:underline"
      >
        {row.title}
      </Link>
    ),
  },
  {
    label: '연구 분야',
    className: 'text-center',
    cell: (row: Project) => (
      <Badge variant="outline" className="whitespace-nowrap">
        {row.category}
      </Badge>
    ),
  },
  {
    label: '연구 상태',
    className: 'text-center',
    cell: (row: Project) => (
      <Badge className={getStatusColor(row.status)}>{row.status}</Badge>
    ),
  },
  {
    label: '책임자',
    className: 'text-center',
    cell: (row: Project) =>
      users
        .filter((u) => row.leaderId.includes(u.userId))
        .map((u) => u.name)
        .join(', '),
  },
  {
    label: '참여자',
    className: 'text-center',
    cell: (row: Project) => `${row.participantId.length}명`,
  },
  {
    label: '연구 기간',
    className: 'text-center',
    cell: (row: Project) => `${row.startDate} ~ ${row.endDate}`,
  },
  {
    label: '',
    className: 'text-center w-[80px]',
    cell: (row: Project) =>
      canEditProject(row.leaderId, currentUser.userId) ||
      canDeleteProject(
        row.leaderId,
        row.authorId,
        currentUser.userId,
        currentUser.role,
      ) ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEditProject(row.participantId, currentUser.userId) && (
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/portal/researches/projects/${row.projectId}/edit`,
                  )
                }
              >
                <Pencil /> 수정
              </DropdownMenuItem>
            )}
            {canDeleteProject(
              row.leaderId,
              row.authorId,
              currentUser.userId,
              currentUser.role,
            ) && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(row.projectId)}
              >
                <Trash2 className="text-destructive" /> 삭제
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null,
  },
];

function getLeaderNames(leaderIds: string[]): string[] {
  return users.filter((u) => leaderIds.includes(u.userId)).map((u) => u.name);
}

function getSortComparator(field: string, direction: string) {
  return (a: Project, b: Project) => {
    const getTime = (val: string) => new Date(val).getTime();
    let aVal: string;
    let bVal: string;

    if (field === 'title') {
      aVal = a.title;
      bVal = b.title;
    } else if (field === 'date') {
      aVal = a.startDate;
      bVal = b.startDate;
    } else {
      aVal = a.createdAt;
      bVal = b.createdAt;
    }

    if (field === 'title') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return direction === 'asc'
      ? getTime(aVal) - getTime(bVal)
      : getTime(bVal) - getTime(aVal);
  };
}

export default function ProjectPage() {
  const {
    searchTerm,
    setSearchTerm,
    committedSearchTerm,
    setCommittedSearchTerm,
    sortOption,
    setSortOption,
    showFilters,
    setShowFilters,
    fieldFilter,
    setFieldFilter,
    statusFilter,
    setStatusFilter,
    leaderFilter,
    setLeaderFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = useProjectFilterStore();

  const router = useRouter();

  const filteredProjects = useMemo(() => {
    let result = [...allProjects];

    if (committedSearchTerm) {
      result = result.filter((project) => {
        const leaderNames = getLeaderNames(project.leaderId).map((name) =>
          name.toLowerCase(),
        );
        return (
          project.title
            .toLowerCase()
            .includes(committedSearchTerm.toLowerCase()) ||
          leaderNames.some((name) =>
            name.includes(committedSearchTerm.toLowerCase()),
          )
        );
      });
    }

    if (fieldFilter && fieldFilter !== 'all') {
      result = result.filter((project) => project.category === fieldFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((project) => project.status === statusFilter);
    }

    if (leaderFilter && leaderFilter !== 'all') {
      result = result.filter((project) =>
        project.leaderId.includes(leaderFilter),
      );
    }

    if (sortOption) {
      const [field, direction] = sortOption.split('-');
      result.sort(getSortComparator(field, direction));
    }

    return result;
  }, [
    committedSearchTerm,
    fieldFilter,
    statusFilter,
    leaderFilter,
    sortOption,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setFieldFilter('all');
    setStatusFilter('all');
    setLeaderFilter('all');
    setSortOption('created-desc');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">연구 & 프로젝트</h1>
        <Link href="/portal/researches/projects/new">
          <Button>연구 & 프로젝트 등록</Button>
        </Link>
      </div>
      <div className="space-y-4">
        <div className="flex flex-row gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="프로젝트 제목 또는 책임자 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCommittedSearchTerm(searchTerm);
                }
              }}
              className="pl-8"
            />
          </div>
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
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="bg-muted/30 flex flex-col gap-4 rounded-md border p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-row items-center gap-2">
                <div className="w-[80px] text-sm font-medium">연구 분야</div>
                <Select value={fieldFilter} onValueChange={setFieldFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="모든 분야" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 분야</SelectItem>
                    {projectCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="w-[80px] text-sm font-medium">연구 상태</div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="w-[80px] text-sm font-medium">책임자</div>
                <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                  <SelectTrigger className="w-full">
                    {leaderFilter === 'all' ? (
                      <span className="text-muted-foreground">모든 책임자</span>
                    ) : (
                      <span>
                        {users.find((u) => u.userId === leaderFilter)?.name ??
                          ''}
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 책임자</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        <div className="flex flex-col">
                          <div>{user.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {user.department} · {user.email}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4" />
                필터 초기화
              </Button>
            </div>
          </div>
        )}

        <PaginatedTable
          data={filteredProjects}
          rowKey={(row) => row.projectId}
          columns={getProjectColumns(currentPage, itemsPerPage, router)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
    </div>
  );
}
