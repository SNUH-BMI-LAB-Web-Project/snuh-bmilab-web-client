'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileQuestion,
  FileCheck,
  Award,
  Building,
  FileText,
  User,
  Hash,
} from 'lucide-react';
import { format } from 'date-fns';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { TaskApi, GetAllTasksStatusEnum } from '@/generated-api/apis/TaskApi';
import type { TaskSummaryResponse } from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import TaskEditModal from './TaskEditModal';

const taskApi = new TaskApi(getApiConfig());

/* ======================
   상태/라벨/스타일 (목록 페이지와 동일)
====================== */
const STATUS_ENUM_TO_LABEL: Record<GetAllTasksStatusEnum, string> = {
  PROPOSAL_WRITING: '제안서 작성',
  PROPOSAL_REJECTED: '제안서 탈락',
  PRESENTATION_PREPARING: '발표 준비',
  PRESENTATION_REJECTED: '발표 탈락',
  AGREEMENT_PREPARING: '협약 진행',
  IN_PROGRESS: '진행중',
  COMPLETED: '과제종료',
};

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

/* ======================
   UI에서 쓰는 형태 (목록 normalize와 동일한 구조)
====================== */
type UiTask = {
  id: number;
  researchNumber: string;
  taskName: string;

  rfpNumber?: string;
  rfpName?: string;

  projectName?: string; // 사업명
  client?: string; // 발주처

  totalYears?: number;
  currentYear?: number;
  yearlyPeriods?: { year: number; startDate: string; endDate: string }[];

  researchType?: string; // 지원유형(총괄/1주관…)
  hostInstitution?: string;
  hostProfessor?: string;

  snuhPI?: string;
  professorRole?: string;
  practicalManager?: string;

  participatingInstitutions?: { name: string }[];

  includesThreeToFive?: boolean;
  progressStage?: string; // 한글(진행중/제안서작성…)
  isInternal?: boolean;
};

function normalizeTask(item: TaskSummaryResponse): UiTask {
  const yearlyPeriods = Array.isArray(item.periods)
    ? item.periods.map((p) => ({
        year: p?.yearNumber ?? 0,
        startDate: p?.startDate
          ? format(p.startDate as Date, 'yyyy.MM.dd')
          : '',
        endDate: p?.endDate ? format(p.endDate as Date, 'yyyy.MM.dd') : '',
      }))
    : undefined;

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

    isInternal: item.isInternal,
  };
}

export default function TaskHeaderCard() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const taskId = useMemo(() => Number(params?.id), [params]);

  const [task, setTask] = useState<UiTask | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchTaskDetail = async () => {
    if (!taskId) return;

    try {
      const res = await taskApi.getTask({ taskId });
      const normalized = normalizeTask(res as unknown as TaskSummaryResponse);
      setTask(normalized);
    } catch (e) {
      console.error(e);
      setTask(null);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleDelete = async () => {
    if (!taskId) return;

    try {
      await taskApi.deleteTask({ taskId });
      toast.success('과제가 성공적으로 삭제되었습니다.');

      if (pathname.startsWith('/system')) {
        router.push('/system/researches/assignment');
      } else {
        router.push('/portal/researches/assignment');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!task) {
    return (
      <div className="p-8 text-center text-gray-500">
        과제 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <>
      <TaskEditModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchTaskDetail();
        }}
        taskId={taskId}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{task.researchNumber}</div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getProgressStageStyle(
                task.progressStage,
              )}`}
            >
              {task.progressStage ?? '—'}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setOpenModal(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  수정
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="text-destructive mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h1 className="mb-4 text-xl font-bold text-gray-900">
          {task.taskName}
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 왼쪽 영역 */}
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  RFP번호
                </span>
              </div>
              <p className="pl-6 text-sm text-gray-900">
                {task.rfpNumber || '—'}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  RFP명
                </span>
              </div>
              <p className="pl-6 text-sm text-gray-900">
                {task.rfpName || '—'}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  사업명
                </span>
              </div>
              <p className="pl-6 text-sm text-gray-900">{task.projectName}</p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  발주처
                </span>
              </div>
              <p className="pl-6 text-sm text-gray-900">{task.client}</p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  연구과제지원
                </span>
              </div>
              <p className="pl-6 text-sm text-gray-900">{task.researchType}</p>
            </div>
          </div>

          {/* 가운데 영역 */}
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  과제기간
                </span>
              </div>
              <div className="space-y-1 pl-6">
                {task.yearlyPeriods?.length ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {task.yearlyPeriods[0].startDate} ~{' '}
                      {
                        task.yearlyPeriods[task.yearlyPeriods.length - 1]
                          .endDate
                      }
                      ({task.currentYear}/{task.totalYears}년차)
                    </p>
                    {task.yearlyPeriods.map((p) => (
                      <div key={p.year} className="text-xs text-gray-600">
                        {p.year}년차: {p.startDate} ~ {p.endDate}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">연차 기간 정보 없음</p>
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
                  {task.includesThreeToFive ? '포함' : '불포함'}
                </Badge>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  원내과제 여부
                </span>
              </div>
              <div className="pl-6">
                {typeof task.isInternal === 'boolean' ? (
                  <Badge
                    variant="outline"
                    className={
                      task.isInternal
                        ? 'border-blue-200 text-xs text-blue-700'
                        : 'border-gray-200 text-xs text-gray-700'
                    }
                  >
                    {task.isInternal ? '원내과제' : '원외과제'}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 영역 */}
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  SNUH PI
                </span>
              </div>
              <p className="pl-6 text-sm text-gray-900">{task.snuhPI}</p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  책임 교수 역할
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
              <div className="mb-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-700">
                  참여기관
                </span>
              </div>
              <div className="space-y-1 pl-6">
                {task.participatingInstitutions?.length ? (
                  task.participatingInstitutions.map((i) => (
                    <div key={i.name} className="text-xs text-gray-600">
                      {i.name}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">없음</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
