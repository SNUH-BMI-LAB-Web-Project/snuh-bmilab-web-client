'use client';

import React, { useEffect, useState } from 'react';
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
import { toast } from 'sonner';

interface TaskEditModalProps {
  open: boolean;
  onClose: () => void;
  taskId: number;
}

interface YearlyPeriod {
  year: number;
  startDate: string;
  endDate: string;
}

export default function TaskEditModal({
  open,
  onClose,
  taskId,
}: TaskEditModalProps) {
  if (!open) return null;

  const raw = localStorage.getItem('auth-storage');
  const token = raw ? JSON.parse(raw)?.state?.accessToken : null;

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
    return m ? Number(m[1]) : 0;
  };

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
    participatingInstitutions: [] as string[],
    includesThreeToFive: '',
    progressStage: '',
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

  const selectedHostKeys = hostProfessor
    ? [getProfessorKey(hostProfessor)]
    : [];
  const selectedSnuhKeys = snuhPIs.map(getProfessorKey);

  const toYMD = (d?: Date) => (d ? format(d, 'yyyy-MM-dd') : '');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addInstitution = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    if (isComposing) return;

    e.preventDefault();
    const newInst = institutionInput.trim();
    if (!newInst) return;

    if (!formData.participatingInstitutions.includes(newInst)) {
      setFormData((prev) => ({
        ...prev,
        participatingInstitutions: [...prev.participatingInstitutions, newInst],
      }));
    }
    setInstitutionInput('');
  };

  const removeInstitution = (inst: string) => {
    setFormData((prev) => ({
      ...prev,
      participatingInstitutions: prev.participatingInstitutions.filter(
        (x) => x !== inst,
      ),
    }));
  };

  const handleTotalYearsChange = (value: string) => {
    const years = Number(value);
    const list: YearlyPeriod[] = [];

    for (let i = 1; i <= years; i++) {
      list.push({ year: i, startDate: '', endDate: '' });
    }

    setFormData((prev) => ({
      ...prev,
      totalYears: value,
      yearlyPeriods: list,
    }));
  };

  const handleYearlyPeriodChange = (
    index: number,
    field: 'startDate' | 'endDate',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      yearlyPeriods: prev.yearlyPeriods.map((p, idx) =>
        idx === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          toast.error('과제 정보를 불러오지 못했습니다.');
          return;
        }

        const task = await res.json();

        const periods =
          task.periods?.map(
            (p: {
              yearNumber: number;
              startDate?: string;
              endDate?: string;
            }) => ({
              year: p.yearNumber,
              startDate: p.startDate || '',
              endDate: p.endDate || '',
            }),
          ) ?? [];

        setFormData({
          researchNumber: task.researchTaskNumber ?? '',
          taskName: task.title ?? '',
          rfpNumber: task.rfpNumber ?? '',
          rfpName: task.rfpName ?? '',
          projectName: task.businessName ?? '',
          client: task.issuingAgency ?? '',
          totalYears: String(task.totalYears ?? ''),
          yearlyPeriods: periods,
          researchType:
            Object.keys(supportTypeMap).find(
              (k) => supportTypeMap[k] === task.supportType,
            ) || '',
          hostInstitution: task.leadInstitution ?? '',
          hostProfessor: task.leadProfessor ?? '',
          snuhPI: task.snuhPi ?? '',
          kimKwangSooRole:
            Object.keys(professorRoleMap).find(
              (k) => professorRoleMap[k] === task.professorRole,
            ) || '',
          practicalManager: task.practicalManagerName ?? '',
          participatingInstitutions: task.participatingInstitutions
            ? task.participatingInstitutions
                .split(',')
                .map((s: string) => s.trim())
            : [],
          includesThreeToFive: task.threeFiveRule ? '포함' : '불포함',
          progressStage:
            Object.keys(statusMap).find((k) => statusMap[k] === task.status) ||
            '',
        });

        if (task.leadProfessor) {
          setHostProfessor({
            name: task.leadProfessor,
            organization: '',
            department: '',
            position: '',
          });
        }

        if (task.snuhPi) {
          setSnuhPIs(
            task.snuhPi.split(',').map((n: string) => ({
              name: n.trim(),
              organization: '',
              department: '',
              position: '',
            })),
          );
        }
      } catch {
        toast.error('과제 정보를 불러오지 못했습니다.');
      }
    })();
  }, [open, taskId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!hostProfessor) {
      toast.error('담당교수를 선택하세요.');
      return;
    }

    if (snuhPIs.length === 0) {
      toast.error('SNUH PI를 1명 이상 선택하세요.');
      return;
    }

    if (!practicalManagerId) {
      toast.error('실무 책임자를 선택하세요.');
      return;
    }

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
      researchTaskNumber: formData.researchNumber,
      title: formData.taskName,
      rfpNumber: formData.rfpNumber,
      rfpName: formData.rfpName,
      businessName: formData.projectName,
      issuingAgency: formData.client,

      supportType: supportTypeMap[formData.researchType],
      threeFiveRule,
      totalYears,
      currentYear,

      periods,

      leadInstitution: formData.hostInstitution,
      leadProfessor: hostProfessor.name ?? '',
      snuhPi: snuhPIs.map((p) => p.name).join(', '),

      professorRole: professorRoleMap[formData.kimKwangSooRole],
      practicalManagerId, // null 불가

      participatingInstitutions: formData.participatingInstitutions.join(', '),

      status: statusMap[formData.progressStage],
    };

    try {
      setSubmitting(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        toast.error('수정 중 오류가 발생했습니다.');
        return;
      }

      toast.success('과제가 수정되었습니다.');
      onClose();
    } catch (error) {
      toast.error('수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl p-8 shadow-xl">
        {/* ---------------- UI 원본 유지 ---------------- */}
        <form onSubmit={handleSubmit}>
          <Card className="border-gray-200 py-8 shadow-none">
            <CardContent className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={onClose} className="p-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-foreground text-3xl font-bold">
                    과제 수정
                  </h1>
                </div>

                {/* ------ 이하 UI 모두 동일 유지 ------ */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>연구과제번호 *</Label>
                    <Input
                      value={formData.researchNumber}
                      onChange={(e) =>
                        handleInputChange('researchNumber', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>과제명 *</Label>
                    <Input
                      value={formData.taskName}
                      onChange={(e) =>
                        handleInputChange('taskName', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>RFP번호 *</Label>
                    <Input
                      value={formData.rfpNumber}
                      onChange={(e) =>
                        handleInputChange('rfpNumber', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>RFP명 *</Label>
                    <Input
                      value={formData.rfpName}
                      onChange={(e) =>
                        handleInputChange('rfpName', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>사업명 *</Label>
                    <Input
                      value={formData.projectName}
                      onChange={(e) =>
                        handleInputChange('projectName', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>발주처 *</Label>
                    <Input
                      value={formData.client}
                      onChange={(e) =>
                        handleInputChange('client', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>총 연차 *</Label>
                  <Select
                    value={formData.totalYears}
                    onValueChange={handleTotalYearsChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.yearlyPeriods.length > 0 && (
                  <div className="space-y-4">
                    {formData.yearlyPeriods.map((p, index) => (
                      <div
                        key={p.year}
                        className="bg-muted/50 grid grid-cols-1 gap-4 rounded-xl p-4 lg:grid-cols-5"
                      >
                        <Label className="flex items-center">
                          {p.year}년차
                        </Label>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start bg-white"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {p.startDate
                                ? format(parseISO(p.startDate), 'yyyy.MM.dd', {
                                    locale: ko,
                                  })
                                : '시작일 선택'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="p-0">
                            <Calendar
                              mode="single"
                              selected={
                                p.startDate ? parseISO(p.startDate) : undefined
                              }
                              onSelect={(d) =>
                                handleYearlyPeriodChange(
                                  index,
                                  'startDate',
                                  toYMD(d || undefined),
                                )
                              }
                            />
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start bg-white"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {p.endDate
                                ? format(parseISO(p.endDate), 'yyyy.MM.dd', {
                                    locale: ko,
                                  })
                                : '종료일 선택'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="p-0">
                            <Calendar
                              mode="single"
                              selected={
                                p.endDate ? parseISO(p.endDate) : undefined
                              }
                              onSelect={(d) =>
                                handleYearlyPeriodChange(
                                  index,
                                  'endDate',
                                  toYMD(d || undefined),
                                )
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>연구과제지원 *</Label>
                    <Select
                      value={formData.researchType}
                      onValueChange={(v) =>
                        handleInputChange('researchType', v)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="연구과제지원 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(supportTypeMap).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>주관기관 *</Label>
                    <Input
                      value={formData.hostInstitution}
                      onChange={(e) =>
                        handleInputChange('hostInstitution', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>담당교수 *</Label>

                  {!hostProfessor && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowHostProfessorModal(true)}
                      className="w-full justify-center"
                    >
                      <Plus className="mr-2 h-4 w-4" /> 담당교수 선택
                    </Button>
                  )}

                  {hostProfessor && (
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex gap-2">
                        <Input
                          disabled
                          value={hostProfessor.name}
                          className="bg-white"
                        />
                        <Input
                          disabled
                          value={hostProfessor.organization}
                          className="bg-white"
                        />
                        <Input
                          disabled
                          value={hostProfessor.department}
                          className="bg-white"
                        />
                        <Input
                          disabled
                          value={hostProfessor.position}
                          className="bg-white"
                        />

                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => setHostProfessor(null)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>SNUH PI *</Label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSnuhPIModal(true)}
                    className="w-full justify-center"
                  >
                    <Plus className="mr-2 h-4 w-4" /> SNUH PI 추가
                  </Button>

                  {snuhPIs.length > 0 && (
                    <div className="bg-muted/50 mt-2 space-y-3 rounded-xl p-4">
                      {snuhPIs.map((p, index) => (
                        <div key={index} className="flex gap-2">
                          <Input disabled value={p.name} className="bg-white" />
                          <Input
                            disabled
                            value={p.organization}
                            className="bg-white"
                          />
                          <Input
                            disabled
                            value={p.department}
                            className="bg-white"
                          />
                          <Input
                            disabled
                            value={p.position}
                            className="bg-white"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              setSnuhPIs((prev) =>
                                prev.filter((_, idx) => idx !== index),
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>김광수교수님 *</Label>
                    <Select
                      value={formData.kimKwangSooRole}
                      onValueChange={(v) =>
                        handleInputChange('kimKwangSooRole', v)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="역할 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(professorRoleMap).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>실무 책임자 *</Label>
                    <SingleUserSelectInput
                      value={formData.practicalManager}
                      onValueChange={(v) =>
                        handleInputChange('practicalManager', v)
                      }
                      onUserSelected={(u) =>
                        setPracticalManagerId(u?.userId ?? null)
                      }
                      placeholder="실무 책임자 입력"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>참여기관 *</Label>
                  <Input
                    placeholder="참여기관 입력 후 Enter"
                    value={institutionInput}
                    onChange={(e) => setInstitutionInput(e.target.value)}
                    onKeyDown={addInstitution}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                  />

                  {formData.participatingInstitutions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.participatingInstitutions.map((i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-border flex items-center gap-1 rounded-full px-3 py-1"
                        >
                          {i}
                          <button
                            type="button"
                            onClick={() => removeInstitution(i)}
                            className="rounded-full p-0.5 hover:bg-black/5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>3책5공 *</Label>
                    <Select
                      value={formData.includesThreeToFive}
                      onValueChange={(v) =>
                        handleInputChange('includesThreeToFive', v)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="포함">포함</SelectItem>
                        <SelectItem value="불포함">불포함</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>현재 진행 과정 *</Label>
                    <Select
                      value={formData.progressStage}
                      onValueChange={(v) =>
                        handleInputChange('progressStage', v)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusMap).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-8">
            <Button type="submit" className="px-10" disabled={submitting}>
              {submitting ? '수정 중…' : '저장'}
            </Button>
          </div>
        </form>

        <ExternalProfessorSelectModal
          open={showHostProfessorModal}
          onClose={() => setShowHostProfessorModal(false)}
          onSelect={(p) => {
            setHostProfessor(p);
            setShowHostProfessorModal(false);
          }}
          selectedProfessorKeys={selectedHostKeys}
        />

        <ExternalProfessorSelectModal
          open={showSnuhPIModal}
          onClose={() => setShowSnuhPIModal(false)}
          onSelect={(p) => {
            const key = getProfessorKey(p);
            setSnuhPIs((prev) =>
              prev.some((x) => getProfessorKey(x) === key)
                ? prev
                : [...prev, p],
            );
            setShowSnuhPIModal(false);
          }}
          selectedProfessorKeys={selectedSnuhKeys}
        />
      </div>
    </div>
  );
}
