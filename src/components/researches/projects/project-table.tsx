'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import type { Project } from '@/types/project';
import {
  allProjects,
  researchCategories,
  researchStatuses,
  sortOptions,
  getStatusColor,
  users,
} from '@/data/projects';
import { currentUser, canEditProject, canDeleteProject } from '@/data/auth';

export function ProjectTable() {
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('created-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(allProjects);

  useEffect(() => {
    let result = [...allProjects];

    if (searchTerm) {
      result = result.filter((project) => {
        const leaderNames = users
          .filter((u) => project.leaderId.includes(u.userId))
          .map((u) => u.name.toLowerCase());

        return (
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leaderNames.some((name) => name.includes(searchTerm.toLowerCase()))
        );
      });
    }

    if (fieldFilter && fieldFilter !== 'all') {
      result = result.filter((project) => project.category === fieldFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((project) => project.status === statusFilter);
    }

    if (sortOption) {
      const [field, direction] = sortOption.split('-');
      result.sort((a, b) => {
        if (field === 'title') {
          return direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        if (field === 'date') {
          return direction === 'asc'
            ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
        if (field === 'created') {
          return direction === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
    }

    setFilteredProjects(result);
    setCurrentPage(1);
  }, [searchTerm, fieldFilter, statusFilter, sortOption]);

  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleDelete = () => {
    console.log('삭제할 프로젝트:', selectedProjects);
    setSelectedProjects([]);
  };

  const changePage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFieldFilter('');
    setStatusFilter('');
    setSortOption('created-desc');
  };

  const showPagination = filteredProjects.length > 0;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="프로젝트 제목 또는 책임자 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <span className="sr-only">필터</span>
            </Button>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
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
          <div className="bg-muted/30 flex flex-col justify-between gap-4 rounded-md border p-4 sm:flex-row">
            <div className="flex flex-row gap-10">
              <div className="flex flex-row items-center gap-2 space-x-2">
                <div className="text-sm font-medium">연구 분야</div>
                <Select value={fieldFilter} onValueChange={setFieldFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="모든 분야" />
                  </SelectTrigger>
                  <SelectContent className="w-[220px]">
                    <SelectItem value="all">모든 분야</SelectItem>
                    {researchCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row items-center gap-2 space-x-2">
                <div className="text-sm font-medium">연구 상태</div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent className="w-[220px]">
                    <SelectItem value="all">모든 상태</SelectItem>
                    {researchStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4" />
                필터 초기화
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="w-[250px]">프로젝트 제목</TableHead>
              <TableHead className="w-[180px] text-center">연구 분야</TableHead>
              <TableHead className="w-[120px] text-center">연구 상태</TableHead>
              <TableHead className="w-[150px] text-center">책임자</TableHead>
              <TableHead className="w-[80px] text-center">참여자</TableHead>
              <TableHead className="w-[180px] text-center">연구 기간</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              currentProjects.map((project, index) => {
                const leaderNames = users
                  .filter((u) => project.leaderId.includes(u.userId))
                  .map((u) => u.name);

                return (
                  <TableRow key={project.projectId}>
                    <TableCell className="h-[72px] text-center">
                      {(
                        1 +
                        (currentPage - 1) * itemsPerPage +
                        index
                      ).toString()}
                    </TableCell>
                    <TableCell className="h-[72px]">
                      <Link
                        href={`/researches/projects/${project.projectId}`}
                        className="font-medium hover:underline"
                      >
                        <div
                          className="max-w-[230px] truncate"
                          title={project.title}
                        >
                          {project.title}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="h-[72px] text-center">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {project.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-[72px] text-center">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-[72px] text-center">
                      <div
                        className="max-w-[130px] truncate"
                        title={leaderNames.join(', ')}
                      >
                        {leaderNames.join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="h-[72px] text-center">
                      {project.participantId.length}명
                    </TableCell>
                    <TableCell className="h-[72px] text-center">
                      {project.startDate} ~ {project.endDate}
                    </TableCell>
                    <TableCell className="h-[72px] text-center">
                      {(canEditProject(project.leaderId, currentUser.userId) ||
                        canDeleteProject(
                          project.leaderId,
                          project.authorId,
                          currentUser.userId,
                          currentUser.role,
                        )) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">메뉴</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditProject(
                              project.participantId,
                              currentUser.userId,
                            ) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/researches/projects/${project.projectId}/edit`,
                                  )
                                }
                              >
                                수정
                              </DropdownMenuItem>
                            )}
                            {canDeleteProject(
                              project.leaderId,
                              project.authorId,
                              currentUser.userId,
                              currentUser.role,
                            ) && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete()}
                              >
                                삭제
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 - 항상 표시 */}
      {showPagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            총 {filteredProjects.length}개 중{' '}
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredProjects.length)}개
            표시
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) =>
                setItemsPerPage(Number.parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="5">5개</SelectItem>
                <SelectItem value="10">10개</SelectItem>
                <SelectItem value="20">20개</SelectItem>
                <SelectItem value="50">50개</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
