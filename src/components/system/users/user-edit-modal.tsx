'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, CalendarIcon, Crown, User, Shield, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AdminUserApi,
  ProjectCategoryApi,
  ProjectCategorySummary,
  RegisterUserRequestPositionEnum,
  RegisterUserRequestRoleEnum,
  UserDetail,
  UserEducationSummary,
  UserEducationSummaryStatusEnum,
  UserItem,
  UserSubAffiliationRequest,
  type UserSubAffiliationSummary,
} from '@/generated-api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { positionOptions } from '@/constants/position-enum';
import { statusLabelMap } from '@/constants/education-enum';
import { toast } from 'sonner';
import { roleOptions } from '@/constants/role-enum';
import { getApiConfig } from '@/lib/config';

const categoryApi = new ProjectCategoryApi(getApiConfig());

const adminUserApi = new AdminUserApi(getApiConfig());

interface UserEditModalProps {
  user: UserDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (userData: UserItem) => void;
}

export default function UserEditModal({
  user,
  open,
  onOpenChange,
  onUserUpdate,
}: UserEditModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    organization: string;
    department: string;
    position: RegisterUserRequestPositionEnum | null;
    subAffiliations: UserSubAffiliationSummary[];
    annualLeaveCount: number;
    usedLeaveCount: number;
    categories: number[];
    seatNumber: string;
    seatBuilding: string;
    seatFloor: string;
    seatCode: string;
    phoneNumber: string;
    educations: UserEducationSummary[];
    joinedAt: Date;
    comment: string;
    role: RegisterUserRequestRoleEnum;
  }>({
    name: '',
    email: '',
    organization: '',
    department: '',
    position: null,
    subAffiliations: [],
    annualLeaveCount: 15,
    usedLeaveCount: 0,
    categories: [],
    seatNumber: '',
    seatBuilding: '융합기술연구원',
    seatFloor: '',
    seatCode: '',
    phoneNumber: '',
    educations: [],
    joinedAt: new Date(),
    comment: '',
    role: RegisterUserRequestRoleEnum.User,
  });

  // 카테고리 옵션들
  const [categoryOptions, setCategoryOptions] = useState<
    ProjectCategorySummary[]
  >([]);

  const [showSubAffiliations, setShowSubAffiliations] = useState(false);
  const [newSubAffiliation, setNewSubAffiliation] =
    useState<UserSubAffiliationRequest>({
      organization: '',
      department: '',
      position: '',
    });

  // 학력 상태 옵션들
  const educationStatusOptions = Object.entries(statusLabelMap).map(
    ([value, label]) => ({
      value: value as UserEducationSummaryStatusEnum,
      label,
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

  // 사용자 데이터로 폼 초기화
  useEffect(() => {
    if (user && open && categoryOptions.length > 0) {
      const [building, floor, code] = (user.seatNumber ?? '').split('-');

      setFormData({
        name: user.name || '',
        email: user.email || '',
        organization: user.organization || '',
        department: user.department || '',
        position: user.position || null,
        subAffiliations: user.subAffiliations ?? [],
        annualLeaveCount: user.annualLeaveCount || 15,
        usedLeaveCount: user.usedLeaveCount || 0,
        categories:
          user.categories
            ?.map((c) => c.categoryId)
            .filter((id): id is number => id !== undefined) ?? [],
        seatNumber: user.seatNumber ?? '',
        seatBuilding: building ?? '융합의학기술원',
        seatFloor: floor ?? '',
        seatCode: code ?? '',
        phoneNumber: user.phoneNumber || '',
        educations: user.educations || [],
        joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
        comment: user.comment || '',
        role: user.role ?? RegisterUserRequestRoleEnum.User,
      });
    }
  }, [user, open, categoryOptions]);

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? Array.from(new Set([...prev.categories, categoryId]))
        : prev.categories.filter((id) => id !== categoryId),
    }));
  };

  const addSubAffiliation = () => {
    if (
      newSubAffiliation.organization.trim() &&
      newSubAffiliation.department?.trim() &&
      newSubAffiliation.position?.trim()
    ) {
      setFormData((prev) => ({
        ...prev,
        subAffiliations: [
          ...prev.subAffiliations,
          {
            organization: newSubAffiliation.organization.trim(),
            department: newSubAffiliation.department?.trim(),
            position: newSubAffiliation.position?.trim(),
          },
        ],
      }));
      setNewSubAffiliation({
        organization: '',
        department: '',
        position: '',
      });
      setShowSubAffiliations(false);
    }
  };

  const removeSubAffiliation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subAffiliations: prev.subAffiliations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.organization
    ) {
      toast.error('필수 항목을 입력해주세요.');
      return;
    }

    if (formData.annualLeaveCount < formData.usedLeaveCount) {
      toast.error('연간 연차 일수는 사용한 연차보다 작을 수 없습니다.');
      return;
    }

    try {
      const currentIds = [...new Set(formData.categories)];
      const originalIds = [
        ...new Set(
          user?.categories
            ?.map((c) => c.categoryId)
            .filter((id): id is number => typeof id === 'number'),
        ),
      ];

      const newCategoryIds = currentIds.filter(
        (id) => !originalIds.includes(id),
      );
      const deletedCategoryIds = originalIds.filter(
        (id) => !currentIds.includes(id),
      );

      const requestBody = {
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        department: formData.department,
        position: formData.position as RegisterUserRequestPositionEnum,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subAffiliations: formData.subAffiliations as any,
        phoneNumber: formData.phoneNumber,
        seatNumber: formData.seatNumber,
        annualLeaveCount: formData.annualLeaveCount,
        comment: formData.comment,
        newCategoryIds,
        deletedCategoryIds,
        role: formData.role,
      };

      await adminUserApi.updateUserById({
        userId: user?.userId || -1,
        adminUpdateUserRequest: requestBody,
      });

      onUserUpdate({
        ...user,
        ...requestBody,
        categories: categoryOptions
          .filter((cat) => cat.categoryId !== undefined)
          .filter((cat) => formData.categories.includes(cat.categoryId!)),
      });
      onOpenChange(false);

      toast.success('사용자 정보가 성공적으로 수정되었습니다.');
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (
        field === 'seatBuilding' ||
        field === 'seatFloor' ||
        field === 'seatCode'
      ) {
        const building =
          field === 'seatBuilding' ? String(value) : prev.seatBuilding;
        const floor = field === 'seatFloor' ? String(value) : prev.seatFloor;
        const code = field === 'seatCode' ? String(value) : prev.seatCode;

        const paddedFloor = floor.padStart(2, '0');
        const paddedCode = code.padStart(2, '0');

        updated.seatNumber = `${building}-${paddedFloor}-${paddedCode}`;
      }

      return updated;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!open && document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = 'auto';
      }
    }, 300); // 0.3초마다 검사

    return () => clearInterval(interval);
  }, [open]);

  if (!user) return null;

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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setTimeout(() => {
            document.body.style.pointerEvents = 'auto';
          }, 50);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] !max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            사용자 정보 수정
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold">기본 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="홍길동"
                  required
                  maxLength={10}
                  className="bg-white"
                />
                <p className="text-muted-foreground text-right text-xs">
                  {formData.name.length}/10자
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="hong.gildong@example.com"
                  required
                  maxLength={50}
                  className="bg-white"
                />
                <p className="text-muted-foreground text-right text-xs">
                  {formData.email.length}/50자
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  전화번호 <span className="text-destructive text-xs">*</span>
                </Label>
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
                  className="bg-white"
                />
                <p className="text-muted-foreground text-right text-xs">
                  {formData.phoneNumber.length}/13자
                </p>
              </div>
            </div>

            {/* 입사일 */}
            <div className="space-y-2">
              <Label>입사일</Label>
              <Button
                variant="outline"
                disabled
                className={cn(
                  'w-full cursor-not-allowed justify-start text-left font-normal',
                  !formData.joinedAt && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.joinedAt, 'PPP', { locale: ko })}
              </Button>
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
                        <h4 className="font-semibold text-gray-700">{label}</h4>
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
                  <Shield className="text-destructive h-4 w-4" />
                  <span className="text-destructive text-sm font-semibold">
                    관리자 권한 주의사항
                  </span>
                </div>
                <p className="text-destructive mt-1 text-xs">
                  관리자는 모든 사용자 데이터에 접근하고 시스템 설정을 변경할 수
                  있습니다. 신중하게 부여해주세요.
                </p>
              </div>
            )}
          </div>

          {/* 소속 정보 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">BMI LAB 소속 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="organization">
                  기관 <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange('organization', e.target.value)
                  }
                  placeholder="융합의학연구실"
                  maxLength={50}
                />
                <p className="text-muted-foreground text-right text-xs">
                  {formData.organization.length}/50자
                </p>
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
                <p className="text-muted-foreground text-right text-xs">
                  {formData.department.length}/20자
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">소속</Label>
                <Select
                  value={formData.position || ''}
                  onValueChange={(value) =>
                    handleInputChange(
                      'position',
                      value === 'none'
                        ? null
                        : (value as RegisterUserRequestPositionEnum),
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="구분 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 추가 소속 목록 */}
            {formData.subAffiliations.length > 0 && (
              <div className="space-y-2">
                <Label>추가 소속</Label>
                {formData.subAffiliations.map((aff, index) => (
                  <div
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm">
                        {aff.organization} | {aff.department} | {aff.position}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSubAffiliation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* 추가 소속 등록 버튼 */}
            {!showSubAffiliations && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSubAffiliations(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                추가 소속 등록
              </Button>
            )}

            {/* 새 소속 입력 폼 */}
            {showSubAffiliations && (
              <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                <h4 className="text-sm font-medium">추가 소속</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>기관</Label>
                    <Input
                      value={newSubAffiliation.organization}
                      onChange={(e) =>
                        setNewSubAffiliation((prev) => ({
                          ...prev,
                          organization: e.target.value,
                        }))
                      }
                      placeholder="기관명"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>부서</Label>
                    <Input
                      value={newSubAffiliation.department}
                      onChange={(e) =>
                        setNewSubAffiliation((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="부서명"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>구분</Label>
                    <Input
                      value={newSubAffiliation.position}
                      onChange={(e) =>
                        setNewSubAffiliation((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                      placeholder="구분"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSubAffiliation}
                    className="flex-1"
                    disabled={
                      !newSubAffiliation.organization.trim() ||
                      !newSubAffiliation.department?.trim() ||
                      !newSubAffiliation.position?.trim()
                    }
                  >
                    추가 소속 등록
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewSubAffiliation({
                        organization: '',
                        department: '',
                        position: '',
                      });
                      setShowSubAffiliations(false);
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 카테고리 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">연구 분야</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {categoryOptions.map((category) =>
                category.categoryId !== undefined ? (
                  <div
                    key={category.categoryId}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.categoryId}`}
                      checked={formData.categories.includes(
                        category.categoryId,
                      )}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(
                          category.categoryId!,
                          checked as boolean,
                        )
                      }
                    />
                    <Label
                      htmlFor={`category-${category.categoryId}`}
                      className="text-sm font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ) : null,
              )}
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
                  value={formData.annualLeaveCount}
                  onChange={(e) =>
                    handleInputChange(
                      'annualLeaveCount',
                      Number(e.target.value),
                    )
                  }
                  placeholder="15"
                  min={formData.usedLeaveCount}
                  max={99999}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usedLeaveCount">사용한 연차 일수</Label>
                <Input
                  id="usedLeaveCount"
                  type="number"
                  step="0.5"
                  value={formData.usedLeaveCount}
                  onChange={(e) =>
                    handleInputChange('usedLeaveCount', Number(e.target.value))
                  }
                  disabled
                  placeholder="0"
                />
              </div>
            </div>
            {/* 연차 현황 표시 */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  남은 연차
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {(
                    formData.annualLeaveCount - formData.usedLeaveCount
                  ).toFixed(1)}
                  일
                </span>
              </div>
              {formData.annualLeaveCount - formData.usedLeaveCount < 0 && (
                <p className="text-destructive mt-1 text-xs">
                  ⚠️ 연차가 초과되었습니다!
                </p>
              )}
            </div>
          </div>

          {/* 좌석 정보 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">좌석 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="seatBuilding">건물</Label>
                <Input
                  id="seatBuilding"
                  value={formData.seatBuilding}
                  onChange={(e) =>
                    handleInputChange('seatBuilding', e.target.value)
                  }
                  placeholder="융합의학기술원"
                  maxLength={10}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatFloor">층</Label>
                <Input
                  id="seatFloor"
                  value={formData.seatFloor}
                  onChange={(e) =>
                    handleInputChange('seatFloor', e.target.value.slice(0, 2))
                  }
                  placeholder="MM"
                  maxLength={2}
                />
                <p className="text-muted-foreground text-right text-xs">
                  {formData.seatFloor.length}/2자
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatCode">번호</Label>
                <Input
                  id="seatCode"
                  value={formData.seatCode}
                  onChange={(e) =>
                    handleInputChange('seatCode', e.target.value.slice(0, 2))
                  }
                  placeholder="NN"
                  maxLength={2}
                />
                <p className="text-muted-foreground text-right text-xs">
                  {formData.seatCode.length}/2자
                </p>
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
                {formData.educations.map((edu) => (
                  <div
                    key={edu.title}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{edu.title}</p>
                      <p className="text-sm text-gray-600">
                        {edu.startYearMonth
                          ? `${edu.startYearMonth}`
                          : '날짜 미지정'}{' '}
                        ~ {edu.endYearMonth ? `${edu.endYearMonth}` : '현재'} |{' '}
                        {
                          educationStatusOptions.find(
                            (s) => s.value === edu.status,
                          )?.label
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 코멘트 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">코멘트</h3>
            <div className="space-y-2">
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="특이사항, 메모, 추가 정보를 입력하세요..."
                className="min-h-[100px] resize-none"
                maxLength={300}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">최대 300자</p>
                <p className="text-right text-xs text-gray-500">
                  {formData.comment.length}/300자
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              수정 완료
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
