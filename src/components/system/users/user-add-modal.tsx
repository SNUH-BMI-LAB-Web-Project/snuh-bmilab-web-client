'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Plus,
  RefreshCw,
  Copy,
  CalendarIcon,
  X,
  Shield,
  User,
  Crown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AdminUserApi,
  Configuration,
  ProjectCategoryApi,
  ProjectCategorySummary,
  RegisterUserRequest,
  RegisterUserRequestAffiliationEnum,
  RegisterUserRequestRoleEnum,
  ResponseError,
  UserEducationRequest,
  UserEducationRequestStatusEnum,
  UserEducationSummaryStatusEnum,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import EmailConfirmationModal from '@/components/system/users/email-confirmation-modal';
import YearMonthPicker from '@/components/system/users/year-month-picker';
import { statusLabelMap } from '@/constants/education-enum';
import { toast } from 'sonner';
import { affiliationOptions } from '@/constants/affiliation-enum';
import { roleOptions } from '@/constants/role-enum';

interface UserAddModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onUserAdd: (
    userData: RegisterUserRequest & { categories: ProjectCategorySummary[] },
  ) => void;
}

export default function UserAddModal({
  open,
  setOpen,
  onUserAdd,
}: UserAddModalProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [createdUserData, setCreatedUserData] =
    useState<RegisterUserRequest | null>(null);
  const [newEducationError, setNewEducationError] = useState(''); // 학력 에러 문구를 표시하기 위함

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '서울대병원 융합의학연구실',
    department: '',
    affiliation: undefined,
    annualLeaveCount: 0,
    usedLeaveCount: 0,
    categoryIds: [] as number[],
    seatNumber: '',
    phoneNumber: '',
    educations: [] as UserEducationRequest[],
    joinedAt: new Date(),
    role: RegisterUserRequestRoleEnum.User,
  });
  const [newEducation, setNewEducation] = useState<UserEducationRequest>({
    title: '',
    status: undefined,
    startYearMonth: '',
    endYearMonth: '',
  });

  // 카테고리 옵션들
  const [categoryOptions, setCategoryOptions] = useState<
    ProjectCategorySummary[]
  >([]);

  // 학력 상태 옵션들
  const educationStatusOptions = Object.entries(statusLabelMap).map(
    ([value, label]) => ({
      value: value as UserEducationSummaryStatusEnum,
      label,
    }),
  );

  const adminUserApi = new AdminUserApi(
    new Configuration({
      accessToken: async () => useAuthStore.getState().accessToken ?? '',
    }),
  );

  const categoryApi = new ProjectCategoryApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  useEffect(() => {
    const fetchCategorys = async () => {
      try {
        const res = await categoryApi.getAllProjectCategories();
        setCategoryOptions(res.categories ?? []);
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    };

    fetchCategorys();
  }, []);

  // useEffect(() => {
  //   if (!open) {
  //     // 모달이 닫힐 때 form 초기화
  //     setFormData({
  //       name: '',
  //       email: '',
  //       password: '',
  //       organization: '서울대병원 융합의학연구실',
  //       department: '',
  //       affiliation: undefined,
  //       annualLeaveCount: 0,
  //       usedLeaveCount: 0,
  //       categoryIds: [],
  //       seatNumber: '',
  //       phoneNumber: '',
  //       educations: [],
  //       joinedAt: new Date(),
  //       role: RegisterUserRequestRoleEnum.User,
  //     });
  //
  //     setNewEducation({
  //       title: '',
  //       status: undefined,
  //       startYearMonth: '',
  //       endYearMonth: '',
  //     });
  //
  //     setNewEducationError('');
  //     setCreatedUserData(null);
  //   }
  // }, [open]);

  // 임의 비밀번호 생성
  const generatePassword = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i += 1) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleCopyPassword = async () => {
    if (formData.password) {
      try {
        await navigator.clipboard.writeText(formData.password);
        toast.success('비밀번호가 클립보드에 복사되었습니다.');
      } catch (err) {
        toast.error('비밀번호 복사에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 전화번호 000-0000-0000의 형식으로 입력되도록하는 함수
  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');

    if (numbersOnly.length <= 3) {
      return numbersOnly;
    }
    if (numbersOnly.length <= 7) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
    }
    if (numbersOnly.length <= 11) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`;
    }
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: checked
        ? [...prev.categoryIds, categoryId]
        : prev.categoryIds.filter((id) => id !== categoryId),
    }));
  };

  const addEducation = () => {
    setNewEducationError('');

    if (
      !newEducation.title ||
      !newEducation.status ||
      !newEducation.startYearMonth
    ) {
      setNewEducationError('모든 필수 정보를 입력해주세요.');
      return;
    }

    if (
      newEducation.startYearMonth &&
      newEducation.endYearMonth &&
      new Date(newEducation.startYearMonth) >
        new Date(newEducation.endYearMonth)
    ) {
      setNewEducationError('종료 년월은 시작 년월보다 빠를 수 없습니다.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      educations: [...prev.educations, { ...newEducation }],
    }));

    setNewEducation({
      title: '',
      status: undefined,
      startYearMonth: '',
      endYearMonth: '',
    });
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('이름, 이메일, 비밀번호는 필수 입력 사항입니다.');
      return;
    }

    const userData = {
      ...formData,
      educations: formData.educations.map((edu) => ({
        ...edu,
        startYearMonth: edu.startYearMonth || undefined,
        endYearMonth: edu.endYearMonth || undefined,
      })),
      joinedAt: (() => {
        const date = new Date(formData.joinedAt);
        date.setHours(12, 0, 0, 0); // 오후 12시로 설정 → UTC 변환 시 날짜 유지
        return date;
      })(),
    };

    const selectedCategories = categoryOptions.filter(
      (cat): cat is ProjectCategorySummary =>
        cat.categoryId !== undefined &&
        formData.categoryIds.includes(cat.categoryId),
    );

    try {
      await adminUserApi.registerNewUser({ registerUserRequest: userData });
      onUserAdd({
        ...userData,
        categories: selectedCategories,
      });

      setCreatedUserData(userData);
      setEmailModalOpen(true);

      setTimeout(() => setOpen(false), 0);

      // 초기화
      setFormData({
        name: '',
        email: '',
        password: '',
        organization: '서울대병원 융합의학연구실',
        department: '',
        affiliation: undefined,
        annualLeaveCount: 0,
        usedLeaveCount: 0,
        categoryIds: [],
        seatNumber: '',
        phoneNumber: '',
        educations: [],
        joinedAt: new Date(),
        role: RegisterUserRequestRoleEnum.User,
      });
      setNewEducation({
        title: '',
        status: undefined,
        startYearMonth: '',
        endYearMonth: '',
      });

      toast.success('사용자가 성공적으로 추가되었습니다');
    } catch (error: unknown) {
      if (error instanceof ResponseError && error?.response?.status === 409) {
        const body = await error.response.json();
        toast.error(body?.message ?? '중복된 요청입니다.');
      } else {
        toast.error('사용자 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | boolean | Date | null,
  ) => {
    setFormData((prev) => {
      if (field === 'annualLeaveCount' && typeof value === 'number') {
        const sanitized = Math.max(0, Number(String(value).slice(0, 5))); // 5자리 제한
        const adjustedUsed = Math.min(prev.usedLeaveCount, sanitized);
        return {
          ...prev,
          annualLeaveCount: sanitized,
          usedLeaveCount: adjustedUsed,
        };
      }

      if (field === 'usedLeaveCount' && typeof value === 'number') {
        const max = prev.annualLeaveCount;
        const sanitized = Math.max(0, Number(String(value).slice(0, 5))); // 5자리 제한
        return { ...prev, usedLeaveCount: Math.min(sanitized, max) };
      }

      return { ...prev, [field]: value };
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] !max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
              <h3 className="text-sm font-semibold">기본 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="홍길동"
                    required
                    maxLength={10}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="bmi.lab@example.com"
                    required
                    maxLength={50}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder="비밀번호 생성 필요"
                    className="flex-1 bg-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generatePassword}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    disabled={!formData.password}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 입사일 */}
              <div className="space-y-2">
                <Label>입사일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.joinedAt && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.joinedAt ? (
                        format(formData.joinedAt, 'PPP', { locale: ko })
                      ) : (
                        <span>날짜 선택</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.joinedAt}
                      onSelect={(date) =>
                        handleInputChange('joinedAt', date || new Date())
                      }
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 시스템 권한 */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">시스템 권한 설정</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {roleOptions.map(({ value, label }) => {
                  const Icon =
                    value === RegisterUserRequestRoleEnum.Admin ? Crown : User;
                  const isSelected = formData.role === value;

                  return (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      key={value}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-gray-700 bg-gray-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => handleInputChange('role', value)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isSelected ? 'bg-gray-800' : 'bg-gray-400'
                          }`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700">
                            {label}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {value === RegisterUserRequestRoleEnum.Admin
                              ? '모든 권한 보유'
                              : '기본 기능 사용'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {String(formData.role) === RegisterUserRequestRoleEnum.Admin && (
                <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      관리자 권한 주의사항
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-red-700">
                    관리자는 모든 사용자 데이터에 접근하고 시스템 설정을 변경할
                    수 있습니다. 신중하게 부여해주세요.
                  </p>
                </div>
              )}
            </div>

            {/* 소속 정보 */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">소속 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="organization">기관</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange('organization', e.target.value)
                    }
                    placeholder="서울대병원 융합의학연구실"
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange('department', e.target.value)
                    }
                    placeholder="개발팀"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliation">소속</Label>
                  <Select
                    value={formData.affiliation ?? ''}
                    onValueChange={(value) =>
                      handleInputChange(
                        'affiliation',
                        value === 'none'
                          ? null
                          : (value as RegisterUserRequestAffiliationEnum),
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="소속 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {affiliationOptions.map((affiliation) => (
                        <SelectItem
                          key={affiliation.value}
                          value={affiliation.value}
                        >
                          {affiliation.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 연차 정보 */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">연차 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="annualLeaveCount">연간 연차 일수</Label>
                  <Input
                    id="annualLeaveCount"
                    type="number"
                    inputMode="numeric"
                    pattern="\d*"
                    value={formData.annualLeaveCount}
                    onChange={(e) =>
                      handleInputChange(
                        'annualLeaveCount',
                        Number(e.target.value),
                      )
                    }
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usedLeaveCount">사용한 연차 일수</Label>
                  <Input
                    id="usedLeaveCount"
                    type="number"
                    inputMode="numeric"
                    pattern="\d*"
                    step="0.5"
                    value={formData.usedLeaveCount}
                    onChange={(e) =>
                      handleInputChange(
                        'usedLeaveCount',
                        Number(e.target.value),
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* 카테고리 */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">연구 분야</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {categoryOptions.map((category) => (
                  <div
                    key={category.categoryId}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={String(category.categoryId)}
                      checked={formData.categoryIds.includes(
                        category.categoryId || -1,
                      )}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(
                          category.categoryId || -1,
                          checked as boolean,
                        )
                      }
                    />

                    <Label
                      htmlFor={String(category.categoryId)}
                      className="text-sm font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 연락처 및 위치 정보 */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">연락처 및 위치</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">전화번호</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange(
                        'phoneNumber',
                        formatPhoneNumber(e.target.value),
                      )
                    }
                    placeholder="010-1234-5678"
                    maxLength={13}
                    inputMode="numeric"
                    pattern="^\d{3}-\d{3,4}-\d{4}$"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatNumber">좌석번호</Label>
                  <Input
                    id="seatNumber"
                    value={formData.seatNumber}
                    onChange={(e) =>
                      handleInputChange('seatNumber', e.target.value)
                    }
                    placeholder="12-30"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* 학력 정보 */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">학력 정보</h3>

              {/* 기존 학력 목록 */}
              {formData.educations.length > 0 && (
                <div className="space-y-2">
                  <Label>등록된 학력</Label>
                  {formData.educations.map((edu, index) => (
                    <div
                      key={edu.title}
                      className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{edu.title}</p>
                        <p className="text-sm text-gray-600">
                          {edu.startYearMonth} ~ {edu.endYearMonth || '현재'} |{' '}
                          {
                            educationStatusOptions.find(
                              (s) => s.value === edu.status,
                            )?.label
                          }
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 학력 추가 */}
              <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                <Label className="text-sm font-medium">새 학력 추가</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="eduTitle">학교 및 학과</Label>
                    <Input
                      id="eduTitle"
                      value={newEducation.title}
                      onChange={(e) =>
                        setNewEducation((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="국민대학교 소프트웨어학부"
                      maxLength={30}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eduStatus">상태</Label>
                    <Select
                      value={newEducation.status}
                      onValueChange={(value) =>
                        setNewEducation((prev) => ({
                          ...prev,
                          status: value as UserEducationRequestStatusEnum,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eduStart">시작 년월</Label>
                    <YearMonthPicker
                      value={
                        newEducation.startYearMonth
                          ? {
                              year: Number.parseInt(
                                newEducation.startYearMonth.split('-')[0],
                                10,
                              ),
                              month: Number.parseInt(
                                newEducation.startYearMonth.split('-')[1],
                                10,
                              ),
                            }
                          : null
                      }
                      onChange={(value) => {
                        const dateString = value
                          ? `${value.year}-${value.month.toString().padStart(2, '0')}`
                          : '';
                        setNewEducation((prev) => ({
                          ...prev,
                          startYearMonth: dateString,
                        }));
                      }}
                      placeholder="시작 년월 선택"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eduEnd">종료 년월 (선택사항)</Label>
                    <YearMonthPicker
                      value={
                        newEducation.endYearMonth
                          ? {
                              year: Number.parseInt(
                                newEducation.endYearMonth.split('-')[0],
                                10,
                              ),
                              month: Number.parseInt(
                                newEducation.endYearMonth.split('-')[1],
                                10,
                              ),
                            }
                          : null
                      }
                      onChange={(value) => {
                        const dateString = value
                          ? `${value.year}-${value.month.toString().padStart(2, '0')}`
                          : '';
                        setNewEducation((prev) => ({
                          ...prev,
                          endYearMonth: dateString,
                        }));
                      }}
                      placeholder="종료 년월 선택 (현재 재학중이면 비워두세요)"
                      allowClear
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEducation}
                  className="w-full bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  학력 추가
                </Button>
                {newEducationError && (
                  <p className="text-sm text-red-500">{newEducationError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">사용자 추가</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 이메일 발송 모달 */}
      <EmailConfirmationModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        userData={createdUserData}
      />
    </>
  );
}
