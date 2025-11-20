'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Building2,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import TaskEditModal from './TaskEditModal';

/* ======================
   ENUM ↔ LABEL 매핑 테이블
====================== */
const SUPPORT_TYPE_MAP: Record<string, string> = {
  TOTAL: '총괄',
  FIRST_LEAD: '1주관',
  SECOND_LEAD: '2주관',
  THIRD_LEAD: '3주관',
  FOURTH_LEAD: '4주관',
  FIFTH_LEAD: '5주관',
};

const convertSupportTypeToLabel = (type?: string) => {
  if (!type) return '미정';
  return SUPPORT_TYPE_MAP[type] || type;
};

/* ======================
     TYPE 정의
====================== */
type TaskInfo = {
  id: number;
  researchTaskNumber: string;
  status: string;
  includesThreeToFive: boolean;
  title: string;
  rfpNumber: string;
  rfpName: string;
  businessName: string;
  issuingAgency: string;
  supportType: string;
  startDate: string;
  endDate: string;
  totalYears: number;
  currentYear: number;
  leadInstitution: string;
  leadProfessor: string;
  snuhPi: string;
  professorRole: string;
  practicalManagerName: string;
  participatingInstitutions: string;
};

export default function TaskHeaderCard() {
  const { id } = useParams();
  const [taskInfo, setTaskInfo] = useState<TaskInfo | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  /* ======================
      상태 → 한글 변환
  ====================== */
  const convertProgressStageToKorean = (stage?: string) => {
    switch (stage) {
      case 'PROPOSAL_WRITING':
        return '제안서 작성';
      case 'PRESENTATION_PREPARING':
        return '발표 준비';
      case 'AGREEMENT_PREPARING':
        return '협약 진행';
      case 'IN_PROGRESS':
        return '진행중';
      case 'COMPLETED':
        return '과제종료';
      case 'FAILED_PROPOSAL':
        return '제안서 탈락';
      case 'FAILED_PRESENTATION':
        return '발표 탈락';
      default:
        return '미정';
    }
  };

  const getProgressStageStyle = (stage?: string) => {
    const korean = convertProgressStageToKorean(stage);
    switch (korean) {
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
  };

  const getToken = () => {
    const raw = localStorage.getItem('auth-storage');
    return raw ? JSON.parse(raw)?.state?.accessToken : null;
  };

  /* ======================
     단일 조회 API 적용
  ====================== */
  const fetchTaskDetail = async () => {
    const token = getToken();
    if (!token) return;

    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      toast.error('과제 정보를 불러오지 못했습니다.');
      return;
    }

    const data = await response.json();

    const converted: TaskInfo = {
      id: data.id,
      researchTaskNumber: data.researchTaskNumber,
      status: data.status,
      includesThreeToFive: data.threeFiveRule,
      title: data.title,
      rfpNumber: data.rfpNumber,
      rfpName: data.rfpName,
      businessName: data.businessName,
      issuingAgency: data.issuingAgency,

      // ★ ENUM → 한글 변환
      supportType: convertSupportTypeToLabel(data.supportType),

      startDate: data.taskStartDate,
      endDate: data.taskEndDate,
      totalYears: data.totalYears,
      currentYear: data.currentYear,
      leadInstitution: data.leadInstitution,
      leadProfessor: data.leadProfessor,
      snuhPi: data.snuhPi,
      professorRole: data.professorRole,
      practicalManagerName: data.practicalManagerName,
      participatingInstitutions: data.participatingInstitutions,
    };

    setTaskInfo(converted);
  };

  useEffect(() => {
    if (id) fetchTaskDetail();
  }, [id]);

  const handleDelete = async () => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error('삭제 실패');
      return;
    }

    toast.success('삭제 완료');
  };

  if (!taskInfo) {
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
        taskId={Number(id)}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {taskInfo.researchTaskNumber}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getProgressStageStyle(
                taskInfo.status,
              )}`}
            >
              {convertProgressStageToKorean(taskInfo.status)}
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
                  수정하기
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h1 className="mb-4 text-xl font-bold text-gray-900">
          {taskInfo.title}
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 왼쪽 영역 */}
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium text-blue-600">RFP번호:</span>
              <div className="text-gray-900">{taskInfo.rfpNumber}</div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-blue-600">RFP명:</span>
              <div className="text-gray-900">{taskInfo.rfpName}</div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-gray-600">사업명:</span>
              <div className="flex items-center text-gray-900">
                <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                {taskInfo.businessName}
              </div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-gray-600">발주처:</span>
              <div className="flex items-center text-gray-900">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                {taskInfo.issuingAgency}
              </div>
            </div>
          </div>

          {/* 가운데 영역 */}
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium text-gray-600">과제기간:</span>
              <div className="flex items-center text-gray-900">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                {taskInfo.startDate} ~ {taskInfo.endDate} (
                {taskInfo.currentYear}/{taskInfo.totalYears}년차)
              </div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-gray-600">연구과제지원:</span>
              <div className="mt-1">
                <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  {taskInfo.supportType}
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽 영역 */}
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium text-gray-600">
                주관기관/담당교수:
              </span>
              <div className="flex items-center text-gray-900">
                <Users className="mr-2 h-4 w-4 text-gray-400" />
                {taskInfo.leadInstitution} / {taskInfo.leadProfessor}
              </div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-gray-600">SNUH PI:</span>
              <div className="text-gray-900">{taskInfo.snuhPi}</div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-gray-600">실무 책임자:</span>
              <div className="text-gray-900">
                {taskInfo.practicalManagerName}
              </div>
            </div>

            <div className="text-sm">
              <span className="font-medium text-gray-600">참여기관:</span>
              <div className="mt-1 text-xs whitespace-pre-wrap text-gray-700">
                {taskInfo.participatingInstitutions || '참여기관 정보 없음'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
