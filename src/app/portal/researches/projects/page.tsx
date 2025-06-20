'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginatedTable } from '@/components/common/paginated-table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  GetAllProjectsCategoryEnum,
  GetAllProjectsStatusEnum,
  ProjectApi,
} from '@/generated-api/apis/ProjectApi';
import { ProjectSummary } from '@/generated-api/models/ProjectSummary';
import {
  SlidersHorizontal,
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Configuration } from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import {
  getCategoryLabel,
  getStatusClassName,
  getStatusLabel,
} from '@/utils/project-utils';

const projectApi = new ProjectApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

const formatSortOption = (option: string) => {
  const [field, direction] = option.split('-');
  return `${field},${direction}`;
};

const getProjectColumns = (
  currentPage: number,
  itemsPerPage: number,
  router: ReturnType<typeof useRouter>,
  onDelete: (id: number) => void,
) => [
  {
    label: 'No',
    className: 'text-center w-[50px]',
    cell: (_: unknown, i: number) =>
      ((currentPage - 1) * itemsPerPage + i + 1).toString(),
  },
  {
    label: '제목',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[300px]',
    cell: (row: ProjectSummary) => (
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
    className: 'text-center w-[150px]',
    cell: (row: ProjectSummary) => (
      <Badge variant="outline" className="whitespace-nowrap">
        {getCategoryLabel(row.category)}
      </Badge>
    ),
  },
  {
    label: '연구 상태',
    className: 'text-center w-[150px]',
    cell: (row: ProjectSummary) => (
      <Badge
        variant="outline"
        className={cn('whitespace-nowrap', getStatusClassName(row.status))}
      >
        {getStatusLabel(row.status)}
      </Badge>
    ),
  },
  {
    label: 'PI',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => row.pi ?? '-',
  },
  {
    label: '실무교수',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => row.practicalProfessor ?? '-',
  },
  {
    label: '책임자',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) =>
      row.leaders?.map((leader) => leader.name).join(', ') ?? '-',
  },
  {
    label: '참여자',
    className: 'text-center w-[130px]',
    cell: (row: ProjectSummary) => `${row.participantCount ?? 0}명`,
  },
  {
    label: '연구 기간',
    className: 'text-center w-[200px]',
    cell: (row: ProjectSummary) =>
      `${row.startDate?.toISOString().substring(0, 10)} ~ ${row.endDate ? row.endDate.toISOString().substring(0, 10) : ''}`,
  },
  {
    label: '',
    className: 'text-center w-[50px]',
    cell: (row: ProjectSummary) => (
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/portal/researches/projects/${row.projectId}/edit`)
              }
            >
              <Pencil className="mr-2 h-4 w-4" /> 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(row.projectId!)}
            >
              <Trash2 className="text-destructive mr-2 h-4 w-4" /> 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export default function ProjectPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaderFilter, setLeaderFilter] = useState('all');
  const [piFilter, setPiFilter] = useState('');
  const [practicalProfessorFilter, setPracticalProfessorFilter] = useState('');
  const [leaders, setLeaders] = useState<{ id: number; name: string }[]>([]);

  const [sortOption, setSortOption] = useState('createdAt-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);

    // TODO: 수민 pi, practicalProfessor 리마인드
    const res = await projectApi.getAllProjects({
      search: committedSearchTerm,
      category:
        fieldFilter !== 'all'
          ? (fieldFilter as GetAllProjectsCategoryEnum)
          : undefined,
      status:
        statusFilter !== 'all'
          ? (statusFilter as GetAllProjectsStatusEnum)
          : undefined,
      pi: piFilter || undefined,
      practicalProfessor: practicalProfessorFilter || undefined,
      leaderId: leaderFilter !== 'all' ? parseInt(leaderFilter, 10) : undefined,
      page: currentPage - 1,
      size: itemsPerPage,
      sort: sortOption ? [formatSortOption(sortOption)] : undefined,
    });

    setProjects(res.projects ?? []);
    setTotalPage(res.totalPage ?? 1);

    const leaderSet = new Map<number, string>();
    (res.projects ?? []).forEach((project) => {
      (project.leaders ?? []).forEach((leader) => {
        if (
          leader.userId !== undefined &&
          leader.name !== undefined &&
          !leaderSet.has(leader.userId)
        ) {
          leaderSet.set(leader.userId, leader.name);
        }
      });
    });

    const leaderList = Array.from(leaderSet).map(([id, name]) => ({
      id,
      name,
    }));
    setLeaders(leaderList);

    setLoading(false);
  }, [
    committedSearchTerm,
    fieldFilter,
    statusFilter,
    leaderFilter,
    currentPage,
    itemsPerPage,
    sortOption,
  ]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // TODO: 삭제 기능 구현
  const handleDelete = async (projectId: number) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      await projectApi.deleteProjectById({ projectId });
      fetchProjects();
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setFieldFilter('all');
    setStatusFilter('all');
    setLeaderFilter('all');
    setSortOption('createdAt-desc');
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
              placeholder="프로젝트 제목 또는 책임자 검색"
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
                <SelectItem value="createdAt-desc">최신순</SelectItem>
                <SelectItem value="createdAt-asc">오래된순</SelectItem>
                <SelectItem value="startDate-asc">시작일 오름차순</SelectItem>
                <SelectItem value="startDate-desc">시작일 내림차순</SelectItem>
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
              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="연구 분야" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 분야</SelectItem>
                  {Object.values(GetAllProjectsCategoryEnum).map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 연구 상태 필터 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
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

            {/* 2줄: PI / 실무교수 / 책임자 */}
            <div className="flex flex-row gap-4">
              {/* PI Input */}
              <Input
                placeholder="PI 이름 입력"
                value={piFilter}
                onChange={(e) => setPiFilter(e.target.value)}
                className="w-full"
              />

              {/* 실무교수 Input */}
              <Input
                placeholder="실무교수 이름 입력"
                value={practicalProfessorFilter}
                onChange={(e) => setPracticalProfessorFilter(e.target.value)}
                className="w-full"
              />

              {/* 책임자 Select */}
              <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="책임자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 책임자</SelectItem>
                  {leaders.map((leader) => (
                    <SelectItem key={leader.id} value={leader.id.toString()}>
                      {leader.name}
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
          columns={getProjectColumns(
            currentPage,
            itemsPerPage,
            router,
            handleDelete,
          )}
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
