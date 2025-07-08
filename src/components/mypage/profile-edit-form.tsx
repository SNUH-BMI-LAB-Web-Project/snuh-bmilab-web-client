import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LockKeyhole, UserCheck, UserPen, Camera, Check } from 'lucide-react';
import { UserApi } from '@/generated-api/apis/UserApi';
import { Configuration } from '@/generated-api/runtime';
import {
  UpdateUserRequest,
  UpdateUserRequestAffiliationEnum,
  UserEducationSummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { ChangePasswordModal } from '@/components/mypage/change-password-modal';
import EducationEditor from '@/components/mypage/education-editor';
import { useProjectCategories } from '@/hooks/use-project-categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { affiliationOptions } from '@/constants/affiliation-enum';
import { cn } from '@/lib/utils';

const userApi = new UserApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

export default function ProfileEditForm() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    organization: string;
    department: string;
    affiliation: undefined | UpdateUserRequestAffiliationEnum;
    phoneNumber: string;
    seatNumber: string;
  }>({
    name: '',
    email: '',
    organization: '',
    department: '',
    affiliation: undefined,
    phoneNumber: '',
    seatNumber: '',
  });
  const { data: categoryList = [] } = useProjectCategories();

  const [initialCategoryIds, setInitialCategoryIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [educations, setEducations] = useState<UserEducationSummary[]>([]);
  const educationGetterRef = useRef<(() => UserEducationSummary[]) | null>(
    null,
  );

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    '/default-profile-image.svg',
  );
  const [isEditable, setIsEditable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editableFields = [
    'name',
    'email',
    'organization',
    'department',
    'affiliation',
    'phoneNumber',
    'seatNumber',
  ] as const;

  const fieldLabels: Record<(typeof editableFields)[number], string> = {
    name: '이름',
    email: '이메일',
    organization: '기관',
    department: '부서',
    affiliation: '구분',
    phoneNumber: '전화번호',
    seatNumber: '좌석번호',
  };

  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const fetchUserDetail = async () => {
      try {
        const data = await userApi.getCurrentUser();
        const existingCategoryIds =
          data.categories?.map((c) => c.categoryId!) ?? [];

        setInitialCategoryIds(existingCategoryIds);
        setSelectedCategoryIds(existingCategoryIds);

        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            organization: data.organization || '',
            department: data.department || '',
            affiliation:
              (data.affiliation as UpdateUserRequestAffiliationEnum) ??
              UpdateUserRequestAffiliationEnum.ResearcherOrIntern,
            phoneNumber: data.phoneNumber || '',
            seatNumber: data.seatNumber || '',
          });
          setProfileImagePreview(
            data.profileImageUrl || '/default-profile-image.svg',
          );
          setEducations(data.educations || []);
        }
      } catch (err) {
        toast.error(
          '사용자 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
        );
      }
    };

    fetchUserDetail();
  }, [accessToken]);

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: number) => {
    if (!isEditable) return;

    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleImageClick = () => {
    if (!isEditable) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
      toast.success('프로필 이미지가 성공적으로 업로드 되었습니다.');
    }
  };

  const toRequest = (edu: UserEducationSummary) => ({
    title: edu.title,
    status: edu.status,
    startYearMonth: edu.startYearMonth ? edu.startYearMonth : undefined,
    endYearMonth: edu.endYearMonth ? edu.endYearMonth : undefined,
  });

  const newCategoryIds = selectedCategoryIds.filter(
    (id) => !initialCategoryIds.includes(id),
  );
  const deletedCategoryIds = initialCategoryIds.filter(
    (id) => !selectedCategoryIds.includes(id),
  );

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('이름과 이메일은 필수 항목입니다.');
      return;
    }

    let currentEducations: UserEducationSummary[] = [];
    try {
      currentEducations = educationGetterRef.current?.() ?? [];
    } catch (err) {
      return;
    }

    type ExtendedUpdateUserRequest = Omit<UpdateUserRequest, 'affiliation'> & {
      affiliation: UpdateUserRequestAffiliationEnum | null;
    };

    const payload: ExtendedUpdateUserRequest = {
      ...formData,
      affiliation: formData.affiliation ?? null,
      newCategoryIds,
      deletedCategoryIds,
    };

    const formDataToSend = new FormData();
    if (profileImageFile) {
      formDataToSend.append('profileImage', profileImageFile);
    }
    formDataToSend.append(
      'request',
      new Blob([JSON.stringify(payload)], { type: 'application/json' }),
    );

    try {
      await userApi.updateCurrentUser({
        request: payload as UpdateUserRequest,
        profileImage: profileImageFile ?? undefined,
      });

      await Promise.all(
        currentEducations
          .filter((edu) => !edu.educationId)
          .map((edu) =>
            userApi.addEducations({
              userEducationRequest: toRequest(edu),
            }),
          ),
      );

      useAuthStore.setState((prev) => ({
        user: {
          ...prev.user!,
          name: formData.name,
          email: formData.email,
          department: formData.department,
          profileImageUrl: profileImagePreview,
        },
      }));

      setIsEditable(false);
      toast.success('개인정보 및 학력이 성공적으로 저장되었습니다.');
    } catch (err) {
      toast.error(
        '개인정보 및 학력 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
      );
    }
  };

  const maxLengthMap: Partial<Record<(typeof editableFields)[number], number>> =
    {
      name: 10,
      email: 50,
      organization: 50,
      department: 20,
      phoneNumber: 13,
      seatNumber: 10,
    };

  return (
    <div className="flex flex-row gap-10">
      {/* 프로필 사진 */}
      <div className="relative mx-10 h-48 w-48">
        <Image
          src={profileImagePreview}
          alt={`${formData.name} 프로필`}
          fill
          className="cursor-pointer rounded-full border-2 object-cover shadow-lg"
          onClick={handleImageClick}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {isEditable && (
          <button
            onClick={handleImageClick}
            type="button"
            className="hover:bg-muted absolute right-2 bottom-2 rounded-full bg-white p-2 shadow transition"
          >
            <Camera className="size-6 text-gray-600" />
            <span className="sr-only">프로필 사진 수정</span>
          </button>
        )}
      </div>

      {/* 개인정보 수정 */}
      <div className="w-3/4 space-y-6">
        {editableFields.map((field) => (
          <div key={field} className="flex flex-col gap-2">
            <Label className="font-semibold">
              {fieldLabels[field]}
              {(field === 'name' || field === 'email') && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            {field === 'affiliation' ? (
              <Select
                disabled={!isEditable}
                value={formData.affiliation ?? 'none'}
                onValueChange={(value) =>
                  handleChange(
                    'affiliation',
                    value === 'none'
                      ? undefined
                      : (value as UpdateUserRequestAffiliationEnum),
                  )
                }
              >
                <SelectTrigger
                  className={`w-full ${!isEditable ? 'bg-muted' : 'bg-white'}`}
                >
                  <SelectValue placeholder="구분 선택" />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={4} className="!p-0">
                  {affiliationOptions.map(({ value, label }) => {
                    const isSelected = formData.affiliation === value;
                    return (
                      <SelectItem
                        key={value}
                        value={value}
                        className={cn(
                          'relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm transition-colors select-none',
                          isSelected
                            ? 'bg-accent text-accent-foreground font-semibold'
                            : 'hover:bg-muted',
                        )}
                      >
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative">
                <Input
                  value={formData[field]}
                  disabled={!isEditable}
                  maxLength={maxLengthMap[field]}
                  className={`w-full pr-16 ${!isEditable ? 'bg-muted' : 'bg-white'}`}
                  onChange={(e) => {
                    let { value } = e.target;

                    // 전화번호는 숫자만 허용 + 하이픈 자동 삽입
                    if (field === 'phoneNumber') {
                      const digits = value.replace(/\D/g, '').slice(0, 11);
                      if (digits.length <= 3) value = digits;
                      else if (digits.length <= 7)
                        value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                      else
                        value = `${digits.slice(0, 3)}-${digits.slice(
                          3,
                          7,
                        )}-${digits.slice(7)}`;
                    }

                    handleChange(field, value);
                  }}
                />
                {isEditable && maxLengthMap[field] && (
                  <span className="text-muted-foreground absolute right-2 bottom-2.5 text-xs">
                    {formData[field]?.length ?? 0}/{maxLengthMap[field]}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex w-full flex-col gap-2">
          <Label className="font-semibold">연구 분야</Label>

          {/* 셀렉트 트리거 영역 */}
          <Select open={undefined}>
            <SelectTrigger
              disabled={!isEditable}
              className={cn('w-full', !isEditable ? 'bg-muted' : 'bg-white')}
            >
              <div className="truncate text-sm text-black">
                {selectedCategoryIds.length > 0
                  ? categoryList
                      .filter((c) =>
                        selectedCategoryIds.includes(c.categoryId!),
                      )
                      .map((c) => c.name)
                      .join(', ')
                  : '연구 분야 선택'}
              </div>
            </SelectTrigger>

            {/* 커스텀 다중 선택 컨텐츠 */}
            <SelectContent>
              {categoryList.map((cat) => {
                const isSelected = selectedCategoryIds.includes(
                  cat.categoryId!,
                );
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={cat.categoryId}
                    className={cn(
                      'relative flex cursor-pointer items-center rounded-md border border-white px-3 py-2 text-sm select-none',
                      isSelected ? 'bg-accent font-medium' : 'hover:bg-accent',
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleCategory(cat.categoryId!);
                      }
                    }}
                    onClick={() => toggleCategory(cat.categoryId!)}
                  >
                    <span>{cat.name}</span>
                    {isSelected && (
                      <Check className="text-primary absolute right-2 h-4 w-4" />
                    )}
                  </div>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <EducationEditor
          educations={educations}
          editMode={isEditable}
          userApi={userApi}
          onRefReady={(getter) => {
            educationGetterRef.current = getter;
          }}
        />

        {/* 버튼 */}
        <div className="flex w-full flex-row justify-end gap-4">
          {isEditable ? (
            <Button onClick={handleSubmit} className="min-w-[130px]">
              <UserCheck className="mr-2" /> 변경사항 저장
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditable(true)}
              className="min-w-[130px]"
            >
              <UserPen className="mr-2" /> 개인정보 수정
            </Button>
          )}
          <ChangePasswordModal
            triggerButton={
              <Button className="min-w-[130px]">
                <LockKeyhole className="mr-2" /> 비밀번호 변경
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
