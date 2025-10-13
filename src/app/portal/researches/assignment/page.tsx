'use client';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Building2,
  Building,
  Calendar,
  Users,
  FileText,
  ClipboardList,
  Presentation,
  Hash,
  Award,
  Search,
  User,
  FileCheck,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { GetAllTasksStatusEnum, TaskApi } from '@/generated-api/apis/TaskApi';
import {
  PageTaskSummaryResponse,
  TaskStatsResponse,
  TaskSummaryResponse,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { format } from 'date-fns';

const taskApi = new TaskApi(getApiConfig());

function getProgressStageStyle(progressStage?: string) {
  switch (progressStage) {
    case '진행중':
      return 'bg-blue-100 text-blue-800';
    case '제안서 작성':
      return 'bg-yellow-100 text-yellow-800';
    case '발표 준비':
      return 'bg-purple-100 text-purple-800';
    case '협약 진행':
      return 'bg-green-100 text-green-800';
    case '제안서 탈락':
    case '발표 탈락':
      return 'bg-red-100 text-red-800';
    case '과제종료':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const STATUS_ENUM_TO_LABEL: Record<GetAllTasksStatusEnum, string> = {
  PROPOSAL_WRITING: '제안서 작성',
  PROPOSAL_REJECTED: '제안서 탈락',
  PRESENTATION_PREPARING: '발표 준비',
  PRESENTATION_REJECTED: '발표 탈락',
  AGREEMENT_PREPARING: '협약 진행',
  IN_PROGRESS: '진행중',
  COMPLETED: '과제종료',
};

const STATUS_LABEL_TO_ENUM: Record<string, GetAllTasksStatusEnum> = {
  '제안서 작성': 'PROPOSAL_WRITING',
  '제안서 탈락': 'PROPOSAL_REJECTED',
  '발표 준비': 'PRESENTATION_PREPARING',
  '발표 탈락': 'PRESENTATION_REJECTED',
  '협약 진행': 'AGREEMENT_PREPARING',
  진행중: 'IN_PROGRESS',
  과제종료: 'COMPLETED',
};

const SUPPORT_TYPE_KO: Record<string, string> = {
  TOTAL: '총괄',
  FIRST_LEAD: '1주관',
  SECOND_LEAD: '2주관',
  THIRD_LEAD: '3주관',
  FOURTH_LEAD: '4주관',
  FIFTH_LEAD: '5주관',
};

const PROFESSOR_ROLE_KO: Record<string, string> = {
  CO_RESEARCHER: '공동연구자',
  CO_PRINCIPAL_INVESTIGATOR: '공동책임연구자',
  PRINCIPAL_INVESTIGATOR: '책임연구자',
  CONSIGNMENT: '위탁',
};

export default function TaskManagementPage() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<
    | '전체'
    | '제안서 작성'
    | '제안서 탈락'
    | '발표 준비'
    | '발표 탈락'
    | '협약 진행'
    | '진행중'
    | '과제종료'
  >('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedKeyword = useMemo(() => searchQuery, [searchQuery]);

  // 페이지네이션
  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 목록
  type UiTask = {
    id: number;
    researchNumber: string;
    taskName: string;
    rfpNumber?: string;
    rfpName?: string;
    projectName?: string;
    client?: string;
    totalYears?: number;
    currentYear?: number;
    yearlyPeriods?: { year: number; startDate: string; endDate: string }[];
    researchType?: string; // 한글 표시 (총괄/1주관…)
    hostInstitution?: string;
    hostProfessor?: string;
    snuhPI?: string;
    professorRole?: string;
    practicalManager?: string;
    participatingInstitutions?: { name: string }[];
    includesThreeToFive?: boolean;
    progressStage?: string; // 한글 표시 (제안서 작성/진행중…)
  };

  function normalizeTask(item: TaskSummaryResponse): UiTask {
    // periods: Date 객체로 들어옴 (FromJSON에서 new Date 처리)
    const yearlyPeriods = Array.isArray(item.periods)
      ? item.periods.map((p) => ({
          year: (p as any)?.yearNumber ?? 0,
          startDate: p?.startDate
            ? format(p.startDate as Date, 'yyyy.MM.dd')
            : '',
          endDate: p?.endDate ? format(p.endDate as Date, 'yyyy.MM.dd') : '',
        }))
      : undefined;

    // 참여기관: 서버는 string (콤마 구분) → 배열로
    const participatingInstitutions =
      typeof item.participatingInstitutions === 'string'
        ? item.participatingInstitutions
            .split(',')
            .map((s) => ({ name: s.trim() }))
        : undefined;

    return {
      id: item.id ?? 0,
      researchNumber: item.researchTaskNumber ?? '',
      taskName: item.title ?? '',
      rfpNumber: item.rfpNumber ?? '',
      rfpName: item.rfpName ?? '',
      projectName: item.businessName ?? '',
      client: item.issuingAgency ?? '',
      totalYears: item.totalYears,
      currentYear: item.currentYear,
      yearlyPeriods,
      researchType: item.supportType
        ? (SUPPORT_TYPE_KO[item.supportType] ?? item.supportType)
        : undefined,
      hostInstitution: item.leadInstitution ?? '',
      hostProfessor: item.leadProfessor ?? '',
      snuhPI: item.snuhPi ?? '',
      professorRole: item.professorRole
        ? (PROFESSOR_ROLE_KO[item.professorRole] ?? item.professorRole)
        : undefined,
      practicalManager: item.practicalManagerName ?? '',
      participatingInstitutions,
      includesThreeToFive: item.threeFiveRule,
      progressStage: item.status
        ? STATUS_ENUM_TO_LABEL[item.status as GetAllTasksStatusEnum]
        : undefined,
    };
  }

  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [openDetailById, setOpenDetailById] = useState<Record<number, boolean>>(
    {},
  );

  // 통계 상태
  const [stats, setStats] = useState<TaskStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // 통계 불러오기
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await taskApi.getTaskStats();
        if (mounted) setStats(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 상태/검색 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(0);
  }, [statusFilter, debouncedKeyword, size]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingTasks(true);
      try {
        const res: PageTaskSummaryResponse = await taskApi.getAllTasks({
          status:
            statusFilter === '전체'
              ? undefined
              : STATUS_LABEL_TO_ENUM[statusFilter],
          keyword: debouncedKeyword || undefined,
          page,
          size,
          // 필요하면 정렬도: sort: ['id,desc']
        });

        if (!mounted) return;

        const content = res.content ?? [];
        setTasks(content.map(normalizeTask));
        setTotalPages(Number(res.totalPages ?? 0));
        setTotalElements(Number(res.totalElements ?? 0));
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setTasks([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (mounted) setLoadingTasks(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [statusFilter, debouncedKeyword, page, size]);

  const handleAddTask = () => {
    router.push('/portal/researches/assignment/new');
  };

  const toggleDetails = (id: number) => {
    setOpenDetailById((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">과제</h1>
          </div>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            과제 등록
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                전체 과제 수
              </h3>
              <FileText className="text-primary h-5 w-5" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {loadingStats ? '—' : (stats?.totalCount ?? 0)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                진행 중인 과제 수
              </h3>
              <Calendar className="text-primary h-5 w-5" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {loadingStats ? '—' : (stats?.inProgressCount ?? 0)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                제안서 작성 과제 수
              </h3>
              <ClipboardList className="text-primary h-5 w-5" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {loadingStats ? '—' : (stats?.proposalWritingCount ?? 0)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                발표 준비 과제 수
              </h3>
              <Presentation className="text-primary h-5 w-5" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {loadingStats ? '—' : (stats?.presentationPreparingCount ?? 0)}
            </div>
          </div>
        </div>

        {/* 상태 Select + 검색 + 페이지 크기 */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(
                v as
                  | '전체'
                  | '제안서 작성'
                  | '제안서 탈락'
                  | '발표 준비'
                  | '발표 탈락'
                  | '협약 진행'
                  | '진행중'
                  | '과제종료',
              )
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="제안서 작성">제안서 작성</SelectItem>
              <SelectItem value="발표 준비">발표 준비</SelectItem>
              <SelectItem value="협약 진행">협약 진행</SelectItem>
              <SelectItem value="진행중">진행중</SelectItem>
              <SelectItem value="제안서 탈락">제안서 탈락</SelectItem>
              <SelectItem value="발표 탈락">발표 탈락</SelectItem>
              <SelectItem value="과제종료">과제종료</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex w-full items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="과제명 / RFP / 번호 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-200 pl-10"
              />
            </div>

            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
              }}
              className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/페이지
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">과제 목록</h2>
            <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-500">
              {loadingTasks ? '로딩중…' : <>총 {totalElements}개 과제</>}
            </div>
          </div>

          <div className="space-y-6">
            {loadingTasks ? (
              <div className="rounded-lg border p-8 text-center text-sm text-gray-500">
                불러오는 중…
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                검색 조건에 맞는 과제가 없습니다.
              </div>
            ) : (
              tasks.map((task) => {
                const isOpen = !!openDetailById[task.id];
                return (
                  <div
                    key={task.id}
                    className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                  >
                    {/* 헤더 */}
                    <div className="border-b border-gray-100 bg-gray-50 px-8 py-4">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs tracking-wider text-gray-500">
                          {task.researchNumber}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getProgressStageStyle(task.progressStage)}`}
                          >
                            {task.progressStage ?? '—'}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDetailById((prev) => ({
                                ...prev,
                                [task.id]: !prev[task.id],
                              }));
                            }}
                          >
                            {isOpen ? <>접기</> : <>세부정보</>}
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 타이틀 + 본문 */}
                    <div
                      className="p-8"
                      onClick={() => router.push(`assignment/${task.id}`)}
                    >
                      <div className="mb-8">
                        <h3 className="mb-3 text-2xl leading-tight font-bold text-gray-900">
                          {task.taskName}
                        </h3>
                        <div className="flex gap-2">
                          <div className="text-primary flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4" />
                            <span className="font-medium">
                              {task.rfpNumber}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            ( {task.rfpName} )
                          </p>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                          {/* 기본 정보 */}
                          <div className="space-y-6">
                            <h4 className="border-b border-gray-200 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                              기본 정보
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <Award className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    사업명
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.projectName}
                                </p>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    발주처
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.client}
                                </p>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    연구과제지원
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.researchType}
                                </p>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <FileCheck className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    3책5공
                                  </span>
                                </div>
                                <div className="pl-6">
                                  <Badge
                                    variant="outline"
                                    className={
                                      task.includesThreeToFive
                                        ? 'border-blue-200 text-xs text-blue-700'
                                        : 'border-gray-200 text-xs text-gray-700'
                                    }
                                  >
                                    {task.includesThreeToFive
                                      ? '포함'
                                      : '불포함'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 기간 및 기관 */}
                          <div className="space-y-6">
                            <h4 className="border-b border-gray-200 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                              기간 및 기관
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <div className="mb-2 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    과제기간
                                  </span>
                                </div>
                                <div className="space-y-1 pl-6">
                                  {task.yearlyPeriods &&
                                  task.yearlyPeriods.length > 0 ? (
                                    <>
                                      <p className="text-sm font-medium text-gray-900">
                                        {task.yearlyPeriods[0].startDate} ~{' '}
                                        {
                                          task.yearlyPeriods[
                                            task.yearlyPeriods.length - 1
                                          ].endDate
                                        }{' '}
                                        ({task.currentYear}/{task.totalYears}
                                        년차)
                                      </p>
                                      {task.yearlyPeriods.map((p) => (
                                        <div
                                          key={p.year}
                                          className="text-xs text-gray-600"
                                        >
                                          {p.year}년차: {p.startDate} ~{' '}
                                          {p.endDate}
                                        </div>
                                      ))}
                                    </>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      연차 기간 정보 없음
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    주관기관 / 담당교수
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.hostInstitution} / {task.hostProfessor}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 인력 및 참여기관 */}
                          <div className="space-y-6">
                            <h4 className="border-b border-gray-200 pb-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                              인력 및 참여기관
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    SNUH PI
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.snuhPI}
                                </p>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    김광수 교수님
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.professorRole ?? '—'}
                                </p>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    실무 책임자
                                  </span>
                                </div>
                                <p className="pl-6 text-sm text-gray-900">
                                  {task.practicalManager}
                                </p>
                              </div>
                              <div>
                                <div className="mb-2 flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    참여기관
                                  </span>
                                </div>
                                <div className="space-y-1 pl-6">
                                  {task.participatingInstitutions?.length ? (
                                    task.participatingInstitutions.map((i) => (
                                      <div
                                        key={i.name}
                                        className="text-xs text-gray-600"
                                      >
                                        {i.name}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-500">
                                      없음
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => {
                const near = Math.abs(i - page) <= 2;
                const edge = i < 1 || i > totalPages - 2;
                return near || edge;
              })
              .reduce<number[]>((acc, cur, idx, arr) => {
                if (idx === 0) return [cur];
                if (cur - arr[idx - 1] > 1) acc.push(-1);
                acc.push(cur);
                return acc;
              }, [])
              .map((i, idx) =>
                i === -1 ? (
                  <span
                    key={`gap-${idx}`}
                    className="px-2 text-sm text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={`rounded-md px-3 py-1 text-sm ${i === page ? 'bg-primary text-white' : 'border'}`}
                  >
                    {i + 1}
                  </button>
                ),
              )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
