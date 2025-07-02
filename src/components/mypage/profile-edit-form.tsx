import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LockKeyhole, UserCheck, UserPen, Camera } from 'lucide-react';
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
      new Blob([JSON.stringify(payload)], { type: 'application/json' }), // ✅ 정확한 전송 데이터
    );

    try {
      await userApi.updateCurrentUser({
        request: payload as UpdateUserRequest,
        profileImage: profileImageFile ?? undefined,
      });

      const currentEducations = educationGetterRef.current?.() ?? [];

      await Promise.all(
        currentEducations.map((edu) =>
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
                  <SelectValue placeholder="소속 선택" />
                </SelectTrigger>
                <SelectContent>
                  {affiliationOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData[field]}
                disabled={!isEditable}
                className={!isEditable ? 'bg-muted' : 'bg-white'}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="flex w-full flex-col gap-2">
          <Label className="font-semibold">연구 분야</Label>
          <Select
            disabled={!isEditable}
            onValueChange={(val) => {
              if (val === 'none') {
                setSelectedCategoryIds([]);
              } else {
                const categoryId = Number(val);
                toggleCategory(categoryId);
              }
            }}
          >
            <SelectTrigger
              className={`w-full ${!isEditable ? 'bg-muted' : 'bg-white'}`}
            >
              <SelectValue
                placeholder={
                  selectedCategoryIds.length > 0
                    ? categoryList
                        .filter((c) =>
                          selectedCategoryIds.includes(c.categoryId!),
                        )
                        .map((c) => c.name)
                        .join(', ')
                    : '연구 분야 선택'
                }
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">선택 없음</SelectItem>

              {categoryList.map((cat) => {
                const isSelected = selectedCategoryIds.includes(
                  cat.categoryId!,
                );
                return (
                  <SelectItem
                    key={cat.categoryId}
                    value={String(cat.categoryId)}
                    disabled={isSelected}
                  >
                    {cat.name}
                  </SelectItem>
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
