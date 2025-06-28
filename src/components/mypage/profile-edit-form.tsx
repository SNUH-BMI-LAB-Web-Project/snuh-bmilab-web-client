import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Check,
  ChevronDown,
  LockKeyhole,
  UserCheck,
  UserPen,
  Camera,
} from 'lucide-react';
import { UserApi } from '@/generated-api/apis/UserApi';
import { Configuration } from '@/generated-api/runtime';
import {
  GetAllProjectsCategoryEnum,
  UpdateUserRequestCategoriesEnum,
  UserEducationSummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { ChangePasswordModal } from '@/components/mypage/change-password-modal';
import EducationEditor from '@/components/mypage/education-editor';
import { getCategoryLabel } from '@/utils/project-utils';

const userApi = new UserApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

// TODO: 대공사 (소속 ENUM 적용, 분야 ENUM 없애고 타입 맞추기, 학력 CRD 테스트 등)

export default function ProfileEditForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    department: '',
    affiliation: '',
    categories: [] as string[],
    phoneNumber: '',
    seatNumber: '',
  });
  const [educations, setEducations] = useState<UserEducationSummary[]>([]);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    '/default-profile-image.svg',
  );
  const [isEditable, setIsEditable] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
    affiliation: '소속 (선택)',
    phoneNumber: '전화번호',
    seatNumber: '좌석번호',
  };

  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const fetchUserDetail = async () => {
      try {
        const data = await userApi.getCurrentUser();

        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            organization: data.organization || '',
            department: data.department || '',
            affiliation: data.affiliation || '',
            categories: data.categories || [],
            phoneNumber: data.phoneNumber || '',
            seatNumber: data.seatNumber || '',
          });
          setProfileImagePreview(
            data.profileImageUrl || '/default-profile-image.svg',
          );
          setEducations(data.educations || []);
        }
      } catch (err) {
        toast.error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
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

  const toggleCategory = (category: GetAllProjectsCategoryEnum) => {
    if (!isEditable) return;

    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category) // 선택 해제
        : [...prev.categories, category], // 선택
    }));
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

  const pad = (n: number) => String(n).padStart(2, '0');

  const toRequest = (edu: UserEducationSummary) => ({
    title: edu.title,
    status: edu.status,
    startYearMonth:
      edu.startYearMonth?.year && edu.startYearMonth?.monthValue
        ? `${edu.startYearMonth.year}-${pad(edu.startYearMonth.monthValue)}`
        : undefined,
    endYearMonth:
      edu.endYearMonth?.year && edu.endYearMonth?.monthValue
        ? `${edu.endYearMonth.year}-${pad(edu.endYearMonth.monthValue)}`
        : undefined,
  });

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      categories: formData.categories as UpdateUserRequestCategoriesEnum[],
    };

    const formDataToSend = new FormData();
    if (profileImageFile) {
      formDataToSend.append('profileImage', profileImageFile);
    }
    formDataToSend.append(
      'request',
      new Blob([JSON.stringify(formData)], { type: 'application/json' }),
    );

    try {
      await userApi.updateCurrentUser({
        request: payload,
        profileImage: profileImageFile ?? undefined,
      });

      await Promise.all(
        educations.map((edu) =>
          userApi.addEducationsRaw({
            userEducationRequest: toRequest(edu) as any,
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
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
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
          className="cursor-pointer rounded-full object-cover"
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
            <Label className="font-semibold">{fieldLabels[field]}</Label>
            <Input
              value={formData[field]}
              readOnly={!isEditable}
              className={!isEditable ? 'bg-muted' : 'bg-white'}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          </div>
        ))}

        <div className="flex w-full flex-col gap-2">
          <Label className="font-semibold">연구 분야</Label>
          <Popover
            open={isPopoverOpen}
            onOpenChange={(open) => isEditable && setIsPopoverOpen(open)}
          >
            <PopoverTrigger asChild>
              <div
                className={`w-full rounded-md border px-3 py-2 text-sm transition ${
                  isEditable
                    ? 'hover:bg-muted cursor-pointer bg-white'
                    : 'bg-muted cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      formData.categories.length > 0
                        ? ''
                        : 'text-muted-foreground'
                    }
                  >
                    {formData.categories
                      .filter((c): c is GetAllProjectsCategoryEnum =>
                        Object.values(GetAllProjectsCategoryEnum).includes(
                          c as GetAllProjectsCategoryEnum,
                        ),
                      )
                      .map(getCategoryLabel)
                      .join(', ')}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="bg-background w-auto min-w-[var(--radix-popover-trigger-width)] rounded-md border p-2 shadow-md">
              <div className="flex flex-col gap-1 overflow-y-auto">
                {Object.values(GetAllProjectsCategoryEnum).map((category) => {
                  const isSelected = formData.categories.includes(category);

                  return (
                    <button
                      type="button"
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`flex w-full flex-row items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                        isSelected ? 'bg-muted/50' : 'hover:bg-muted'
                      }`}
                    >
                      <span>{getCategoryLabel(category)}</span>
                      {isSelected && <Check className="text-primary h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <EducationEditor
          educations={educations}
          editMode={isEditable}
          onChange={setEducations}
          userApi={userApi}
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
