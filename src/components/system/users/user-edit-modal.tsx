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
import { Edit, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AdminUserApi,
  Configuration,
  ProjectCategoryApi,
  ProjectCategorySummary,
  RegisterUserRequestAffiliationEnum,
  UserDetail,
  UserEducationSummary,
  UserEducationSummaryStatusEnum,
  UserItem,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { affiliationLabelMap } from '@/constants/affiliation-enum';
import { statusLabelMap } from '@/constants/education-enum';
import { toast } from 'sonner';

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
    affiliation: RegisterUserRequestAffiliationEnum | null;
    annualLeaveCount: number;
    usedLeaveCount: number;
    categories: number[];
    seatNumber: string;
    phoneNumber: string;
    educations: UserEducationSummary[];
    joinedAt: Date;
    comment: string;
  }>({
    name: '',
    email: '',
    organization: '',
    department: '',
    affiliation: null,
    annualLeaveCount: 15,
    usedLeaveCount: 0,
    categories: [],
    seatNumber: '',
    phoneNumber: '',
    educations: [],
    joinedAt: new Date(),
    comment: '',
  });

  const categoryApi = new ProjectCategoryApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  const adminUserApi = new AdminUserApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  // 카테고리 옵션들
  const [categoryOptions, setCategoryOptions] = useState<
    ProjectCategorySummary[]
  >([]);

  // 소속 옵션들
  const affiliationOptions = Object.entries(affiliationLabelMap).map(
    ([value, label]) => ({
      value: value as RegisterUserRequestAffiliationEnum,
      label,
    }),
  );

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
      setFormData({
        name: user.name || '',
        email: user.email || '',
        organization: user.organization || '',
        department: user.department || '',
        affiliation: user.affiliation || null,
        annualLeaveCount: user.annualLeaveCount || 15,
        usedLeaveCount: user.usedLeaveCount || 0,
        categories:
          user.categories
            ?.map((c) => c.categoryId)
            .filter((id): id is number => id !== undefined) ?? [],
        seatNumber: user.seatNumber || '',
        phoneNumber: user.phoneNumber || user.phoneNumber || '',
        educations: user.educations || [],
        joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
        comment: user.comment || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('이름은 필수 입력 항목입니다.');
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
        affiliation: formData.affiliation as RegisterUserRequestAffiliationEnum,
        phoneNumber: formData.phoneNumber,
        seatNumber: formData.seatNumber,
        annualLeaveCount: formData.annualLeaveCount,
        comment: formData.comment,
        newCategoryIds,
        deletedCategoryIds,
      };

      console.log(requestBody);

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

      toast.success('사용자 정보가 수정되었습니다.');
    } catch (err) {
      console.error('사용자 정보 수정 실패:', err);
      toast.error('사용자 정보 수정에 실패했습니다.');
    }
  };

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="hong.gildong@example.com"
                  required
                />
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

          {/* 소속 정보 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">소속 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="organization">조직/연구실</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange('organization', e.target.value)
                  }
                  placeholder="융합의학연구실"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">부서/팀</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange('department', e.target.value)
                  }
                  placeholder="개발팀"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliation">소속</Label>
                <Select
                  value={formData.affiliation || ''}
                  onValueChange={(value) =>
                    handleInputChange(
                      'affiliation',
                      value as RegisterUserRequestAffiliationEnum,
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
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ 연차가 초과되었습니다!
                </p>
              )}
            </div>
          </div>

          {/* 카테고리 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">연구 분야 카테고리</h3>
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

          {/* 연락처 및 위치 정보 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">연락처 및 위치</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  placeholder="010-1234-5678"
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
            <h3 className="text-sm font-semibold">특이사항 및 코멘트</h3>
            <div className="space-y-2">
              {/* <Label htmlFor="comment">코멘트</Label> */}
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="특이사항, 메모, 추가 정보를 입력하세요..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">최대 500자</p>
                <p className="text-right text-xs text-gray-500">
                  {formData.comment.length}/500
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
