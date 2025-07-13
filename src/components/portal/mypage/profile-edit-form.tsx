import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  LockKeyhole,
  UserCheck,
  UserPen,
  Camera,
  Check,
  Plus,
} from 'lucide-react';
import { UserApi } from '@/generated-api/apis/UserApi';
import { Configuration } from '@/generated-api/runtime';
import {
  UpdateUserRequest,
  UpdateUserRequestPositionEnum,
  UserEducationRequestStatusEnum,
  UserEducationRequestTypeEnum,
  UserEducationSummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { ChangePasswordModal } from '@/components/portal/mypage/change-password-modal';
import EducationEditor from '@/components/portal/mypage/education-editor';
import { useProjectCategories } from '@/hooks/use-project-categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { positionOptions } from '@/constants/position-enum';

const userApi = new UserApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

export default function ProfileEditForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    organization: string;
    department: string;
    position: undefined | UpdateUserRequestPositionEnum;
    phoneNumber: string;
    seatNumber: string;
  }>({
    name: '',
    email: '',
    organization: '',
    department: '',
    position: undefined,
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

  const [seatFloor, setSeatFloor] = useState(''); // 층
  const [seatNumberOnly, setSeatNumberOnly] = useState(''); // 번호

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    '/default-profile-image.svg',
  );
  const [isEditable, setIsEditable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const seatParts = data.seatNumber?.split('-') ?? [];
          const floor = seatParts[1] ?? '';
          const number = seatParts[2] ?? '';

          setFormData({
            name: data.name || '',
            email: data.email || '',
            organization: data.organization || '',
            department: data.department || '',
            position:
              (data.position as UpdateUserRequestPositionEnum) ??
              UpdateUserRequestPositionEnum.ResearcherOrIntern,
            phoneNumber: data.phoneNumber || '',
            seatNumber: data.seatNumber || '',
          });

          setSeatFloor(floor);
          setSeatNumberOnly(number);

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
    title: edu.title!,
    status: edu.status! as UserEducationRequestStatusEnum,
    startYearMonth: edu.startYearMonth!,
    endYearMonth: edu.endYearMonth ? edu.endYearMonth : undefined,
    type: edu.type ?? UserEducationRequestTypeEnum.Bachelor,
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

    type ExtendedUpdateUserRequest = Omit<UpdateUserRequest, 'position'> & {
      position: UpdateUserRequestPositionEnum | null;
    };

    const payload: ExtendedUpdateUserRequest = {
      ...formData,
      seatNumber: `융합의학기술원-${seatFloor}-${seatNumberOnly}`,
      position: formData.position ?? null,
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

      const prevEmail = useAuthStore.getState().user?.email;
      const isEmailChanged = prevEmail && formData.email !== prevEmail;

      if (isEmailChanged) {
        useAuthStore.getState().logout();
        sessionStorage.setItem('emailChanged', 'true');
        router.push('/login');
        return;
      }

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
        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">
            이름<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="홍길동"
              value={formData.name}
              disabled={!isEditable}
              maxLength={10}
              className={`w-full pr-16 ${!isEditable ? 'bg-muted' : 'bg-white'}`}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {isEditable && (
              <span className="text-muted-foreground absolute right-2 bottom-2.5 text-xs">
                {formData.name.length}/10
              </span>
            )}
          </div>
        </div>

        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">
            이메일<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="bmi-lab@example.com"
              value={formData.email}
              disabled={!isEditable}
              maxLength={50}
              className={`w-full pr-16 ${!isEditable ? 'bg-muted' : 'bg-white'}`}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {isEditable && (
              <span className="text-muted-foreground absolute right-2 bottom-2.5 text-xs">
                {formData.email.length}/50
              </span>
            )}
          </div>
        </div>

        {/* 전화번호 */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">전화번호</Label>
          <div className="relative">
            <Input
              placeholder="010-1234-5678"
              value={formData.phoneNumber}
              disabled={!isEditable}
              maxLength={13}
              className={`w-full pr-16 ${!isEditable ? 'bg-muted' : 'bg-white'}`}
              onChange={(e) => {
                const { value: rawValue } = e.target;
                let value = rawValue;
                // 여기서 field === 'phoneNumber' → 이미 해당 인풋은 phoneNumber니까 그냥 처리
                const digits = value.replace(/\D/g, '').slice(0, 11);
                if (digits.length <= 3) value = digits;
                else if (digits.length <= 7)
                  value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                else
                  value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;

                handleChange('phoneNumber', value);
              }}
            />

            {isEditable && (
              <span className="text-muted-foreground absolute right-2 bottom-2.5 text-xs">
                {formData.phoneNumber.length}/13
              </span>
            )}
          </div>
        </div>

        {/* 주 소속 정보 */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">BMI LAB 소속 정보</Label>
          <div className="grid grid-cols-3 gap-2 rounded-md border p-3">
            <div className="flex flex-col gap-2">
              <Label>
                기관<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="서울대학교병원 의생명정보학연구실"
                value={formData.organization}
                disabled={!isEditable}
                maxLength={50}
                className="w-full bg-white pr-16"
                onChange={(e) => handleChange('organization', e.target.value)}
              />
              {isEditable && (
                <span className="text-muted-foreground absolute right-2 bottom-2.5 text-xs">
                  {formData.organization.length}/50
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>부서</Label>
              <Input
                placeholder="AI팀"
                value={formData.department}
                disabled={!isEditable}
                maxLength={20}
                className="w-full bg-white pr-16"
                onChange={(e) => handleChange('department', e.target.value)}
              />
              {isEditable && (
                <span className="text-muted-foreground absolute right-2 bottom-2.5 text-xs">
                  {formData.department.length}/20
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>구분</Label>
              <Select
                disabled={!isEditable}
                value={formData.position ?? 'none'}
                onValueChange={(value) =>
                  handleChange(
                    'position',
                    value === 'none'
                      ? undefined
                      : (value as UpdateUserRequestPositionEnum),
                  )
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="구분 선택" />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={4} className="!p-0">
                  {positionOptions.map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className={cn(
                        'relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm transition-colors select-none',
                        formData.position === value
                          ? 'bg-accent text-accent-foreground font-semibold'
                          : 'hover:bg-muted',
                      )}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">기타 소속 정보</Label>
            {isEditable && (
              <Button variant="outline">
                <Plus />
                기타 소속 추가
              </Button>
            )}
          </div>
          <div className="justfy-center text-muted-foreground flex flex-col items-center gap-2 rounded-md border px-2 py-6 text-sm">
            기재된 기타 소속 정보가 없습니다.
          </div>
        </div>

        {/* 연구 분야 */}
        <div className="flex w-full flex-col gap-2">
          <Label className="font-semibold">연구 분야</Label>
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
                  : '선택 없음'}
              </div>
            </SelectTrigger>

            <SelectContent>
              {/* 선택 안 함 항목 */}
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  'relative flex cursor-pointer items-center rounded-md border border-white px-3 py-2 text-sm select-none',
                  selectedCategoryIds.length === 0
                    ? 'bg-accent font-medium'
                    : 'hover:bg-accent',
                )}
                onClick={() => setSelectedCategoryIds([])}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedCategoryIds([]);
                  }
                }}
              >
                <span>선택 없음</span>
                {selectedCategoryIds.length === 0 && (
                  <Check className="text-primary absolute right-2 h-4 w-4" />
                )}
              </div>

              {/* 실제 카테고리 목록 */}
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
                    onClick={() => toggleCategory(cat.categoryId!)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleCategory(cat.categoryId!);
                      }
                    }}
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

        <div className="flex flex-col gap-2">
          <Label className="font-semibold">좌석 정보</Label>
          <div className="grid grid-cols-3 gap-2 rounded-md border p-3">
            {/* 건물 */}
            <div className="flex flex-col gap-2">
              <Label>건물</Label>
              <Input
                disabled
                value="융합의학기술원"
                className="w-full bg-white pr-16"
              />
            </div>

            {/* 층 */}
            <div className="flex flex-col gap-2">
              <Label>층</Label>
              <Input
                placeholder="MM"
                value={seatFloor}
                disabled={!isEditable}
                maxLength={10}
                className="w-full bg-white pr-16"
                onChange={(e) => setSeatFloor(e.target.value)}
              />
            </div>

            {/* 번호 */}
            <div className="flex flex-col gap-2">
              <Label>번호</Label>
              <Input
                placeholder="NN"
                value={seatNumberOnly}
                disabled={!isEditable}
                maxLength={10}
                className="w-full bg-white pr-16"
                onChange={(e) => setSeatNumberOnly(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 학력 */}
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
