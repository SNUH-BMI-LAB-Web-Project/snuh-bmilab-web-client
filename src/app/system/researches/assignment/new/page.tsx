'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowLeft,
  X,
  Minus,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SingleUserSelectInput from '@/components/portal/researches/assignment/single-user-select-input';
import ExternalProfessorSelectModal from '@/components/portal/researches/projects/external-professor-select-modal';
import {
  ExternalProfessorItem,
  TaskPeriodRequest,
  TaskRequest,
} from '@/generated-api';
import { getProfessorKey } from '@/utils/external-professor-utils';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TaskApi } from '@/generated-api/apis/TaskApi';
import { getApiConfig } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const taskApi = new TaskApi(getApiConfig());

interface YearlyPeriod {
  year: number;
  startDate: string;
  endDate: string;
}

export default function AddTaskPage() {
  const supportTypeMap: Record<string, TaskRequest['supportType']> = {
    총괄: 'TOTAL',
    '1주관': 'FIRST_LEAD',
    '2주관': 'SECOND_LEAD',
    '3주관': 'THIRD_LEAD',
    '4주관': 'FOURTH_LEAD',
    '5주관': 'FIFTH_LEAD',
  };

  const professorRoleMap: Record<string, TaskRequest['professorRole']> = {
    공동연구자: 'CO_RESEARCHER',
    공동책임연구자: 'CO_PRINCIPAL_INVESTIGATOR',
    책임연구자: 'PRINCIPAL_INVESTIGATOR',
    위탁: 'CONSIGNMENT',
  };

  const statusMap: Record<string, NonNullable<TaskRequest['status']>> = {
    '공고 예정': 'PROPOSAL_WRITING',
    '제안서 작성': 'PROPOSAL_WRITING',
    '제안서 탈락': 'PROPOSAL_REJECTED',
    '발표 준비': 'PRESENTATION_PREPARING',
    '발표 탈락': 'PRESENTATION_REJECTED',
    '협약 진행': 'AGREEMENT_PREPARING',
    '1년차': 'IN_PROGRESS',
    '2년차': 'IN_PROGRESS',
    '3년차': 'IN_PROGRESS',
    '4년차': 'IN_PROGRESS',
    '5년차': 'IN_PROGRESS',
    과제종료: 'COMPLETED',
  };

  const parseCurrentYear = (label: string) => {
    const m = label.match(/^(\d+)년차$/);
    if (m) return Number(m[1]);
    // 진행 전 단계면 0년차로 보냄
    return 0;
  };

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    researchNumber: '',
    taskName: '',
    rfpNumber: '',
    rfpName: '',
    projectName: '',
    client: '',
    totalYears: '',
    yearlyPeriods: [] as YearlyPeriod[],
    researchType: '',
    hostInstitution: '',
    hostProfessor: '',
    snuhPI: '',
    kimKwangSooRole: '',
    practicalManager: '',
    participatingInstitutions: [] as string[], // Changed to array for tag-based input
    includesThreeToFive: '',
    progressStage: '',
    isInternal: true,
  });

  const [institutionInput, setInstitutionInput] = useState('');

  const [isComposing, setIsComposing] = useState(false);

  const [practicalManagerId, setPracticalManagerId] = useState<number | null>(
    null,
  );

  const [showHostProfessorModal, setShowHostProfessorModal] = useState(false);
  const [showSnuhPIModal, setShowSnuhPIModal] = useState(false);

  const [hostProfessor, setHostProfessor] =
    useState<ExternalProfessorItem | null>(null);
  const [snuhPIs, setSnuhPIs] = useState<ExternalProfessorItem[]>([]);

  // 중복 방지용 key
  const selectedHostKeys = hostProfessor
    ? [getProfessorKey(hostProfessor)]
    : [];
  const selectedSnuhKeys = snuhPIs.map(getProfessorKey);

  const toYMD = (d?: Date) => (d ? format(d, 'yyyy-MM-dd') : '');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  function isImeComposing(e: React.KeyboardEvent<HTMLInputElement>) {
    const ne = e.nativeEvent as unknown as {
      isComposing?: boolean;
      keyCode?: number;
    };
    // keyCode === 229는 일부 환경 fallback
    return isComposing || ne.isComposing === true || ne.keyCode === 229;
  }

  const handleAddInstitution = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    if (isImeComposing(e)) return; // 조합 중이면 무시

    e.preventDefault();

    const newInstitution = institutionInput.trim();
    if (!newInstitution) return;

    if (!formData.participatingInstitutions.includes(newInstitution)) {
      setFormData((prev) => ({
        ...prev,
        participatingInstitutions: [
          ...prev.participatingInstitutions,
          newInstitution,
        ],
      }));
    }
    setInstitutionInput('');
  };

  const handleRemoveInstitution = (institutionToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      participatingInstitutions: prev.participatingInstitutions.filter(
        (inst) => inst !== institutionToRemove,
      ),
    }));
  };

  const handleTotalYearsChange = (value: string) => {
    const years = Number.parseInt(value, 10);
    const newYearlyPeriods: YearlyPeriod[] = [];

    for (let i = 1; i <= years; i += 1) {
      newYearlyPeriods.push({
        year: i,
        startDate: '',
        endDate: '',
      });
    }

    setFormData((prev) => ({
      ...prev,
      totalYears: value,
      yearlyPeriods: newYearlyPeriods,
    }));
  };

  const handleYearlyPeriodChange = (
    yearIndex: number,
    field: 'startDate' | 'endDate',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      yearlyPeriods: prev.yearlyPeriods.map((period, index) =>
        index === yearIndex ? { ...period, [field]: value } : period,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // 필수 검증
    if (!hostProfessor) {
      alert('담당교수를 선택하세요.');
      return;
    }
    if (snuhPIs.length === 0) {
      alert('SNUH PI를 1명 이상 선택하세요.');
      return;
    }
    if (!practicalManagerId) {
      alert('실무 책임자를 선택하세요.');
      return;
    }

    // 스키마 변환
    const threeFiveRule = formData.includesThreeToFive === '포함';
    const totalYears = formData.totalYears ? Number(formData.totalYears) : 0;
    const currentYear = parseCurrentYear(formData.progressStage);
    const periods: TaskPeriodRequest[] | undefined = (
      formData.yearlyPeriods ?? []
    )
      .filter((p) => p.startDate && p.endDate)
      .map((p) => ({
        yearNumber: p.year,
        startDate: parseISO(p.startDate),
        endDate: parseISO(p.endDate),
      }));

    const payload: TaskRequest = {
      // 기본 정보
      researchTaskNumber: formData.researchNumber,
      title: formData.taskName,
      rfpNumber: formData.rfpNumber,
      rfpName: formData.rfpName,
      businessName: formData.projectName,
      issuingAgency: formData.client,

      // enum/불리언
      supportType: supportTypeMap[formData.researchType],
      threeFiveRule,
      totalYears,
      currentYear,

      // 기간
      periods,

      // 기관/사람
      leadInstitution: formData.hostInstitution,
      // 서버 스키마가 string이라 이름 문자열로 전달 (여러 명 허용 X → 합쳐서 보냄)
      leadProfessor: hostProfessor.name ?? '',
      snuhPi: snuhPIs.map((p) => p.name).join(', '),

      professorRole: professorRoleMap[formData.kimKwangSooRole],
      practicalManagerId, // number

      // 참여기관: 서버 스키마가 string → 콤마로 조인
      participatingInstitutions: formData.participatingInstitutions.join(', '),

      // 진행 상태: 선택 안 하면 undefined로 전달
      status: statusMap[formData.progressStage],

      isInternal: formData.isInternal,
    };

    try {
      setSubmitting(true);
      await taskApi.createTask({ taskRequest: payload });
      toast.success('과제가 성공적으로 등록되었습니다!');
      router.push('/system/researches/assignment');
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/system/researches/assignment';
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleCancel} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-foreground text-3xl font-bold">과제 등록</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-8">
        <form onSubmit={handleSubmit}>
          <Card className="border-gray-200 py-8">
            <CardContent className="space-y-12">
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* 연구과제번호 */}
                  <div className="w-full space-y-2">
                    <Label htmlFor="researchNumber">
                      연구과제번호<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="researchNumber"
                      placeholder="RS-2025-0000001"
                      value={formData.researchNumber}
                      onChange={(e) =>
                        handleInputChange('researchNumber', e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* 과제명 */}
                  <div className="w-full space-y-2">
                    <Label htmlFor="taskName">
                      과제명<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="taskName"
                      placeholder="과제명을 입력하세요"
                      value={formData.taskName}
                      onChange={(e) =>
                        handleInputChange('taskName', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="w-full space-y-2">
                    <Label htmlFor="rfpNumber">
                      RFP번호<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="rfpNumber"
                      placeholder="RFP-2024-SF-001"
                      value={formData.rfpNumber}
                      onChange={(e) =>
                        handleInputChange('rfpNumber', e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* RFP명 */}
                  <div className="w-full space-y-2">
                    <Label htmlFor="rfpName">
                      RFP명<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="rfpName"
                      placeholder="RFP명을 입력하세요"
                      value={formData.rfpName}
                      onChange={(e) =>
                        handleInputChange('rfpName', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* 사업명 */}
                  <div className="w-full space-y-2">
                    <Label htmlFor="projectName">
                      사업명<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="projectName"
                      placeholder="사업명을 입력하세요"
                      value={formData.projectName}
                      onChange={(e) =>
                        handleInputChange('projectName', e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* 발주처 */}
                  <div className="w-full space-y-2">
                    <Label htmlFor="client">
                      발주처<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="client"
                      placeholder="발주처를 입력하세요"
                      value={formData.client}
                      onChange={(e) =>
                        handleInputChange('client', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalYears">
                    총 연차<span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={handleTotalYearsChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1년</SelectItem>
                      <SelectItem value="2">2년</SelectItem>
                      <SelectItem value="3">3년</SelectItem>
                      <SelectItem value="4">4년</SelectItem>
                      <SelectItem value="5">5년</SelectItem>
                      <SelectItem value="6">6년</SelectItem>
                      <SelectItem value="7">7년</SelectItem>
                      <SelectItem value="8">8년</SelectItem>
                      <SelectItem value="9">9년</SelectItem>
                      <SelectItem value="10">10년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.yearlyPeriods.length > 0 && (
                  <div className="space-y-4">
                    {formData.yearlyPeriods.map((period, index) => (
                      <div
                        key={period.year}
                        className="bg-muted/50 grid grid-cols-1 gap-4 rounded-xl p-4 lg:grid-cols-5"
                      >
                        <div className="flex items-center">
                          <Label className="font-medium">
                            {period.year}년차
                          </Label>
                        </div>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={`startDate-${period.year}`}
                              variant="outline"
                              className="w-full justify-start bg-white text-left font-normal lg:col-span-2"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {period.startDate
                                ? format(
                                    parseISO(period.startDate),
                                    'yyyy.MM.dd',
                                    { locale: ko },
                                  )
                                : '시작일 선택'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                period.startDate
                                  ? parseISO(period.startDate)
                                  : undefined
                              }
                              onSelect={(d) =>
                                handleYearlyPeriodChange(
                                  index,
                                  'startDate',
                                  toYMD(d || undefined),
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={`endDate-${period.year}`}
                              variant="outline"
                              className="w-full justify-start bg-white text-left font-normal lg:col-span-2"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {period.endDate
                                ? format(
                                    parseISO(period.endDate),
                                    'yyyy.MM.dd',
                                    { locale: ko },
                                  )
                                : '종료일 선택'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                period.endDate
                                  ? parseISO(period.endDate)
                                  : undefined
                              }
                              onSelect={(d) =>
                                handleYearlyPeriodChange(
                                  index,
                                  'endDate',
                                  toYMD(d || undefined),
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="researchType">
                      연구과제지원<span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange('researchType', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="연구과제지원 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="총괄">총괄</SelectItem>
                        <SelectItem value="1주관">1주관</SelectItem>
                        <SelectItem value="2주관">2주관</SelectItem>
                        <SelectItem value="3주관">3주관</SelectItem>
                        <SelectItem value="4주관">4주관</SelectItem>
                        <SelectItem value="5주관">5주관</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostInstitution">
                      주관기관<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="hostInstitution"
                      placeholder="주관기관을 입력하세요"
                      value={formData.hostInstitution}
                      onChange={(e) =>
                        handleInputChange('hostInstitution', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* 담당교수: 단일 선택 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    담당교수<span className="text-destructive">*</span>
                  </Label>

                  {/* 선택 버튼 */}
                  {!hostProfessor && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowHostProfessorModal(true)}
                      className="w-full justify-center"
                      title="담당교수 선택"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      담당교수 선택
                    </Button>
                  )}

                  {/* 선택 후 UI */}
                  {hostProfessor && (
                    <div className="bg-muted/50 mt-2 rounded-xl p-4">
                      <div className="flex gap-2">
                        <Input
                          disabled
                          placeholder="이름"
                          value={hostProfessor.name || ''}
                          className="bg-white"
                        />
                        <Input
                          disabled
                          placeholder="기관"
                          value={hostProfessor.organization || ''}
                          className="bg-white"
                        />
                        <Input
                          disabled
                          placeholder="부서"
                          value={hostProfessor.department || ''}
                          className="bg-white"
                        />
                        <Input
                          disabled
                          placeholder="직책"
                          value={hostProfessor.position || ''}
                          className="bg-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setHostProfessor(null)}
                          title="선택 해제"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SNUH PI: 다중 선택 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    SNUH PI<span className="text-destructive">*</span>
                  </Label>

                  {/* 추가 버튼 유지 */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSnuhPIModal(true)}
                    className="w-full justify-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    SNUH PI 추가
                  </Button>

                  {/* 선택 후 UI */}
                  {snuhPIs.length > 0 && (
                    <div className="bg-muted/50 mt-2 space-y-3 rounded-xl p-4">
                      {snuhPIs.map((p, index) => {
                        const key = getProfessorKey(p);
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <Input
                              disabled
                              placeholder="이름"
                              value={p.name || ''}
                              className="bg-white"
                            />
                            <Input
                              disabled
                              placeholder="기관"
                              value={p.organization || ''}
                              className="bg-white"
                            />
                            <Input
                              disabled
                              placeholder="부서"
                              value={p.department || ''}
                              className="bg-white"
                            />
                            <Input
                              disabled
                              placeholder="직책"
                              value={p.position || ''}
                              className="bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setSnuhPIs((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                              title="제거"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kimKwangSooRole">
                      김광수교수님<span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange('kimKwangSooRole', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="역할을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="공동연구자">공동연구자</SelectItem>
                        <SelectItem value="공동책임연구자">
                          공동책임연구자
                        </SelectItem>
                        <SelectItem value="책임연구자">책임연구자</SelectItem>
                        <SelectItem value="위탁">위탁</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 실무 책임자 */}
                  <div className="space-y-2">
                    <Label htmlFor="practicalManager">
                      실무 책임자<span className="text-destructive">*</span>
                    </Label>
                    <SingleUserSelectInput
                      value={formData.practicalManager}
                      onValueChange={(v) =>
                        handleInputChange('practicalManager', v)
                      }
                      onUserSelected={(u) => {
                        // 선택한 사용자 객체(ID 필요 시 활용)
                        setPracticalManagerId(u?.userId ?? null); // 옵션
                      }}
                      placeholder="실무 책임자 이름을 입력하세요"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participatingInstitutions">
                    참여기관<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="participatingInstitutions"
                    placeholder="참여기관을 입력하고 Enter를 누르세요"
                    value={institutionInput}
                    onChange={(e) => setInstitutionInput(e.target.value)}
                    onKeyDown={handleAddInstitution}
                    // IME 조합 상태 트래킹
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                  />

                  {formData.participatingInstitutions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.participatingInstitutions.map((institution) => (
                        <Badge
                          key={institution}
                          variant="secondary"
                          className="bg-border flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{institution}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInstitution(institution)}
                            className="rounded-full p-0.5 hover:cursor-pointer hover:bg-black/5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="includesThreeToFive">
                    3책5공<span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange('includesThreeToFive', value)
                    }
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="3책5공 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="포함">포함</SelectItem>
                      <SelectItem value="불포함">불포함</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progressStage">
                    현재 진행 과정<span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange('progressStage', value)
                    }
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="현재 진행 과정을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="공고 예정">공고 예정</SelectItem>
                      <SelectItem value="제안서 작성">제안서 작성</SelectItem>
                      <SelectItem value="제안서 탈락">제안서 탈락</SelectItem>
                      <SelectItem value="발표 준비">발표 준비</SelectItem>
                      <SelectItem value="발표 탈락">발표 탈락</SelectItem>
                      <SelectItem value="협약 진행">협약 진행</SelectItem>
                      <SelectItem value="1년차">1년차</SelectItem>
                      <SelectItem value="2년차">2년차</SelectItem>
                      <SelectItem value="3년차">3년차</SelectItem>
                      <SelectItem value="4년차">4년차</SelectItem>
                      <SelectItem value="5년차">5년차</SelectItem>
                      <SelectItem value="과제종료">과제종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isInternal">
                    원내과제 여부<span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={String(formData.isInternal)} // 항상 값 존재
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        isInternal: v === 'true',
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">원내</SelectItem>
                      <SelectItem value="false">원외</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex w-full justify-end gap-4 pt-8">
            <Button type="submit" className="px-10" disabled={submitting}>
              {submitting ? '등록 중…' : '등록'}
            </Button>
          </div>
        </form>
      </main>

      {/* 담당교수 선택 모달 (단일) */}
      <ExternalProfessorSelectModal
        open={showHostProfessorModal}
        onClose={() => setShowHostProfessorModal(false)}
        onSelect={(prof) => {
          setHostProfessor(prof);
          setShowHostProfessorModal(false);
        }}
        selectedProfessorKeys={selectedHostKeys}
      />

      {/* SNUH PI 선택 모달 (다중) */}
      <ExternalProfessorSelectModal
        open={showSnuhPIModal}
        onClose={() => setShowSnuhPIModal(false)}
        onSelect={(prof) => {
          const key = getProfessorKey(prof);
          setSnuhPIs((prev) =>
            prev.some((p) => getProfessorKey(p) === key)
              ? prev
              : [...prev, prof],
          );
          setShowSnuhPIModal(false);
        }}
        selectedProfessorKeys={selectedSnuhKeys}
      />
    </div>
  );
}
