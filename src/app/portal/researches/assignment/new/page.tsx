'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface YearlyPeriod {
  year: number;
  startDate: string;
  endDate: string;
}

export default function AddTaskPage() {
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
  });

  const [institutionInput, setInstitutionInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 과제 저장 로직 추가
    console.log('과제 데이터:', formData);
    // 저장 후 메인 페이지로 이동
    window.location.href = '/portal/researches/assignment';
  };

  const handleCancel = () => {
    window.location.href = '/portal/researches/assignment';
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
            <CardContent className="space-y-10">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    </SelectContent>
                  </Select>
                </div>

                {formData.yearlyPeriods.length > 0 && (
                  <div className="space-y-4">
                    <Label>
                      연차별 기간<span className="text-destructive">*</span>
                    </Label>
                    {formData.yearlyPeriods.map((period, index) => (
                      <div
                        key={period.year}
                        className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-3"
                      >
                        <div className="flex items-center">
                          <Label className="font-medium">
                            {period.year}년차
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`startDate-${period.year}`}>
                            시작일
                          </Label>
                          <Input
                            id={`startDate-${period.year}`}
                            type="date"
                            value={period.startDate}
                            onChange={(e) =>
                              handleYearlyPeriodChange(
                                index,
                                'startDate',
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`endDate-${period.year}`}>
                            종료일
                          </Label>
                          <Input
                            id={`endDate-${period.year}`}
                            type="date"
                            value={period.endDate}
                            onChange={(e) =>
                              handleYearlyPeriodChange(
                                index,
                                'endDate',
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <SelectValue placeholder="선택하세요" />
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

                <div className="space-y-2">
                  <Label htmlFor="hostProfessor">
                    담당교수<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hostProfessor"
                    placeholder="담당교수를 입력하세요"
                    value={formData.hostProfessor}
                    onChange={(e) =>
                      handleInputChange('hostProfessor', e.target.value)
                    }
                    required
                  />
                </div>

                {/* SNUH PI */}
                <div className="space-y-2">
                  <Label htmlFor="snuhPI">
                    SNUH PI<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="snuhPI"
                    placeholder="SNUH PI를 입력하세요"
                    value={formData.snuhPI}
                    onChange={(e) =>
                      handleInputChange('snuhPI', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <Input
                      id="practicalManager"
                      placeholder="실무 책임자를 입력하세요"
                      value={formData.practicalManager}
                      onChange={(e) =>
                        handleInputChange('practicalManager', e.target.value)
                      }
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
                        <div
                          key={institution}
                          className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          <span>{institution}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInstitution(institution)}
                            className="rounded-full p-0.5 hover:bg-blue-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <SelectValue placeholder="선택하세요" />
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
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex w-full justify-end gap-4 pt-8">
            <Button type="submit" className="px-10">
              등록
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
