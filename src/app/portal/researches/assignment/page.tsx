'use client';

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
import { useState } from 'react';

const taskStatuses = {
  '공고 예정': {
    color: 'bg-blue-200 hover:bg-blue-300',
    textColor: 'text-blue-800',
  },
  '제안서 작성': {
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white',
  },
  '제안서 탈락': {
    color: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-700',
  },
  '발표 준비': {
    color: 'bg-blue-400 hover:bg-blue-500',
    textColor: 'text-white',
  },
  '발표 탈락': {
    color: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-700',
  },
  '협약 진행': {
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
  },
  '과제 진행': {
    color: 'bg-blue-700 hover:bg-blue-800',
    textColor: 'text-white',
  },
  과제종료: {
    color: 'bg-blue-300 hover:bg-blue-400',
    textColor: 'text-blue-800',
  },
};

const sampleTasks = [
  {
    id: 1,
    researchNumber: 'RS-2025-0000001',
    taskName: 'AI 기반 스마트 팩토리 시스템 개발',
    rfpNumber: 'RFP-2024-SF-001',
    rfpName: '2024년 스마트제조혁신기술개발사업 공고',
    projectName: '스마트제조혁신기술개발사업',
    client: '산업통상자원부',
    totalYears: 3,
    currentYear: 3,
    yearlyPeriods: [
      { year: 1, startDate: '2024.03.01', endDate: '2025.02.28' },
      { year: 2, startDate: '2025.03.01', endDate: '2026.02.28' },
      { year: 3, startDate: '2026.03.01', endDate: '2027.02.28' },
    ],
    researchType: '총괄',
    hostInstitution: '한국과학기술원',
    hostProfessor: '김철수 교수',
    snuhPI: '이상훈 교수',
    coResearchers: ['박영희 교수', '정민수 박사', '김태현 연구원'],
    principalInvestigator: '이상훈 교수',
    coInvestigators: ['박영희 교수', '정민수 박사'],
    practicalManager: '김태현 연구원',
    participatingInstitutions: [
      { name: '한국과학기술원', type: '주관기관' },
      { name: '삼성전자', type: '공동연구기관' },
      { name: 'LG전자', type: '위탁연구기관' },
    ],
    includesThreeToFive: true,
    status: '진행중',
    progressStage: '연차 진행중',
  },
  {
    id: 2,
    researchNumber: 'RS-2024-0000234',
    taskName: '차세대 배터리 소재 연구개발',
    rfpNumber: 'RFP-2024-ET-045',
    rfpName: '2024년 에너지기술개발사업 신규과제 공모',
    projectName: '에너지기술개발사업',
    client: '과학기술정보통신부',
    totalYears: 3,
    currentYear: 1,
    yearlyPeriods: [
      { year: 1, startDate: '2024.01.01', endDate: '2024.12.31' },
      { year: 2, startDate: '2025.01.01', endDate: '2025.12.31' },
      { year: 3, startDate: '2026.01.01', endDate: '2026.12.31' },
    ],
    researchType: '1주관',
    hostInstitution: 'KAIST',
    hostProfessor: '이민수 교수',
    snuhPI: '김영수 교수',
    coResearchers: ['정수진 박사', '오세훈 연구원'],
    principalInvestigator: '김영수 교수',
    coInvestigators: ['정수진 박사'],
    practicalManager: '오세훈 연구원',
    participatingInstitutions: [
      { name: 'KAIST', type: '주관기관' },
      { name: '포스코', type: '공동연구기관' },
      { name: 'SK이노베이션', type: '위탁연구기관' },
    ],
    includesThreeToFive: false,
    status: '진행중',
    progressStage: '제안서 준비중',
  },
  {
    id: 3,
    researchNumber: 'RS-2024-0000567',
    taskName: '블록체인 기반 디지털 헬스케어 플랫폼 구축',
    rfpNumber: 'RFP-2024-DH-123',
    rfpName: '2024년 디지털헬스케어기술개발사업 공모',
    projectName: '디지털헬스케어기술개발사업',
    client: '보건복지부',
    totalYears: 2,
    currentYear: 1,
    yearlyPeriods: [
      { year: 1, startDate: '2024.06.01', endDate: '2025.05.31' },
      { year: 2, startDate: '2025.06.01', endDate: '2026.05.31' },
    ],
    researchType: '2주관',
    hostInstitution: '서울대학교',
    hostProfessor: '최영호 교수',
    snuhPI: '박민철 교수',
    coResearchers: ['김태현 박사', '이지은 연구원', '송민호 연구원'],
    principalInvestigator: '박민철 교수',
    coInvestigators: ['김태현 박사', '이지은 연구원'],
    practicalManager: '송민호 연구원',
    participatingInstitutions: [
      { name: '서울대학교', type: '주관기관' },
      { name: '네이버', type: '공동연구기관' },
      { name: '카카오헬스케어', type: '위탁연구기관' },
    ],
    includesThreeToFive: true,
    status: '진행중',
    progressStage: '발표 준비중',
  },
  {
    id: 4,
    researchNumber: 'RS-2024-0000890',
    taskName: '양자컴퓨팅 기반 암호화 기술 개발',
    rfpNumber: 'RFP-2024-QC-078',
    rfpName: '2024년 양자정보기술개발사업 공모',
    projectName: '양자정보기술개발사업',
    client: '과학기술정보통신부',
    totalYears: 4,
    currentYear: 1,
    yearlyPeriods: [
      { year: 1, startDate: '2024.09.01', endDate: '2025.08.31' },
      { year: 2, startDate: '2025.09.01', endDate: '2026.08.31' },
      { year: 3, startDate: '2026.09.01', endDate: '2027.08.31' },
      { year: 4, startDate: '2027.09.01', endDate: '2028.08.31' },
    ],
    researchType: '3주관',
    hostInstitution: '서울대학교',
    hostProfessor: '김광수 교수',
    snuhPI: '김광수 교수',
    coResearchers: ['이현우 박사', '정소영 연구원'],
    principalInvestigator: '김광수 교수',
    coInvestigators: ['이현우 박사'],
    practicalManager: '정소영 연구원',
    participatingInstitutions: [
      { name: '서울대학교', type: '주관기관' },
      { name: 'IBM', type: '공동연구기관' },
      { name: '삼성SDS', type: '위탁연구기관' },
    ],
    includesThreeToFive: false,
    status: '진행중',
    progressStage: '협약 진행중',
  },
];

const getTaskStats = () => {
  const inProgress = sampleTasks.filter(
    (task) => task.progressStage === '연차수 진행중',
  ).length;
  const proposalWriting = sampleTasks.filter(
    (task) => task.progressStage === '제안서 준비중',
  ).length;
  const presentationPrep = sampleTasks.filter(
    (task) => task.progressStage === '발표 준비중',
  ).length;
  const contractProgress = sampleTasks.filter(
    (task) => task.progressStage === '협약 진행중',
  ).length;

  return { inProgress, proposalWriting, presentationPrep, contractProgress };
};

const getProgressStageStyle = (progressStage: string) => {
  switch (progressStage) {
    case '연차 진행중':
      return 'bg-blue-100 text-blue-800';
    case '제안서 준비중':
      return 'bg-yellow-100 text-yellow-800';
    case '발표 준비중':
      return 'bg-purple-100 text-purple-800';
    case '협약 진행중':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TaskManagementPage() {
  const stats = getTaskStats();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const [openDetailById, setOpenDetailById] = useState<Record<number, boolean>>(
    {},
  );

  const filteredTasks = sampleTasks.filter((task) =>
    task.taskName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTaskClick = (taskId: number) => {
    router.push(`/task/${taskId}`);
  };

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
              {sampleTasks.length}
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
              {stats.inProgress}
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
              {stats.proposalWriting}
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
              {stats.presentationPrep}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="과제명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-gray-200 pl-10"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">과제 목록</h2>
            <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-500">
              총 {filteredTasks.length}개 과제
            </div>
          </div>

          <div className="space-y-6">
            {filteredTasks.map((task) => {
              const isOpen = !!openDetailById[task.id];

              return (
                <div
                  key={task.id}
                  className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg"
                >
                  {/* Header with status badge + details toggle */}
                  <div className="border-b border-gray-100 bg-gray-50 px-8 py-4">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs tracking-wider text-gray-500">
                        {task.researchNumber}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getProgressStageStyle(
                            task.progressStage,
                          )}`}
                        >
                          {task.progressStage}
                        </span>

                        {/* ⬇세부정보 토글 버튼 (카드 클릭 이동과 구분 위해 버튼만 클릭 시 토글) */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={(e) => {
                            e.stopPropagation(); // 카드 전체 클릭 라우팅 막기
                            toggleDetails(task.id);
                          }}
                        >
                          {isOpen ? (
                            <>
                              접기
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              세부정보
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Title section (카드 어디든 눌러 상세 페이지 이동) */}
                  <div className="p-8" onClick={() => handleTaskClick(task.id)}>
                    <div className="mb-8">
                      <h3 className="mb-3 text-2xl leading-tight font-bold text-gray-900">
                        {task.taskName}
                      </h3>
                      <div className="space-y-2">
                        <div className="text-primary flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4" />
                          <span className="font-medium">{task.rfpNumber}</span>
                        </div>
                        <p className="pl-6 text-sm font-medium text-gray-600">
                          {task.rfpName}
                        </p>
                      </div>
                    </div>

                    {/* ⬇️ 한 번에 접히는 영역: 기본정보 / 기간 및 기관 / 인력 및 참여기관 */}
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
                                  {task.includesThreeToFive ? '포함' : '불포함'}
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
                                <p className="text-sm font-medium text-gray-900">
                                  {task.yearlyPeriods[0].startDate} ~{' '}
                                  {
                                    task.yearlyPeriods[
                                      task.yearlyPeriods.length - 1
                                    ].endDate
                                  }{' '}
                                  ({task.currentYear}/{task.totalYears}년차)
                                </p>
                                {task.yearlyPeriods.map((period) => (
                                  <div
                                    key={period.year}
                                    className="text-xs text-gray-600"
                                  >
                                    {period.year}년차: {period.startDate} ~{' '}
                                    {period.endDate}
                                  </div>
                                ))}
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
                                  김광수교수님
                                </span>
                              </div>
                              <div className="pl-6">
                                <p className="text-sm text-gray-900">
                                  {task.snuhPI === '김광수 교수'
                                    ? '책임연구자'
                                    : '공동연구자'}
                                </p>
                              </div>
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
                                {task.participatingInstitutions.map(
                                  (institution, index) => (
                                    <div
                                      key={index}
                                      className="text-xs text-gray-600"
                                    >
                                      {institution.name} ({institution.type})
                                    </div>
                                  ),
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
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
