'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Building2, Calendar, MapPin, Users, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type TaskInfo = {
  id: number;
  researchTaskNumber: string;
  status: string;
  progressStage: string;
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
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getProgressStageStyle = (status: string) => {
    switch (status) {
      case 'PROPOSAL_WRITING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PRESENTATION_PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'AGREEMENT_PREPARING':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchTaskDetail = async () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const parsedToken = authStorage
        ? JSON.parse(authStorage)?.state?.accessToken
        : null;
      if (!parsedToken) return;

      const response = await fetch(`${API_BASE}/tasks?sort=createdAt,desc`, {
        headers: {
          Authorization: `Bearer ${parsedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const matched = data.content.find(
        (t: any) => String(t.id) === String(id),
      );
      if (matched) setTaskInfo(matched);
    } catch (error) {
      console.error('과제 상세 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    if (id) fetchTaskDetail();
  }, [id]);

  const handleEdit = () => {
    alert('수정하기 클릭됨');
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) alert('삭제 완료');
  };

  if (!taskInfo) {
    return (
      <div className="p-8 text-center text-gray-500">
        과제 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
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
            {taskInfo.status}
          </span>

          {/* ... 버튼 추가 (DropdownMenu) */}
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
              <DropdownMenuItem onClick={handleEdit}>
                수정하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h1 className="mb-4 text-xl font-bold text-gray-900">{taskInfo.title}</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

        <div className="space-y-3">
          <div className="text-sm">
            <span className="font-medium text-gray-600">과제기간:</span>
            <div className="flex items-center text-gray-900">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              {taskInfo.startDate} ~ {taskInfo.endDate} ({taskInfo.currentYear}/
              {taskInfo.totalYears}년차)
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
            <div className="text-gray-900">{taskInfo.practicalManagerName}</div>
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
  );
}
