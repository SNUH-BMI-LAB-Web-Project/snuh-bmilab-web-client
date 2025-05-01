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
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import { UserApi } from '@/generated-api/apis/UserApi';
import { Configuration } from '@/generated-api/runtime';
import { CurrentUserDetail } from '@/generated-api/models/CurrentUserDetail';
import {
  GetAllProjectsCategoryEnum,
  UpdateUserRequestCategoriesEnum,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileEditForm() {
  const { accessToken } = useAuthStore.getState();

  const [userDetail, setUserDetail] = useState<CurrentUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    categories: [] as string[],
    phoneNumber: '',
    seatNumber: '',
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    '/default-profile.png',
  );
  const [isEditable, setIsEditable] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editableFields = [
    'name',
    'email',
    'department',
    'phoneNumber',
    'seatNumber',
  ] as const;

  const fieldLabels: Record<(typeof editableFields)[number], string> = {
    name: '이름',
    email: '이메일',
    department: '부서',
    phoneNumber: '전화번호',
    seatNumber: '좌석번호',
  };

  useEffect(() => {
    async function fetchUserDetail() {
      setIsLoading(true);
      try {
        const api = new UserApi(
          new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
            accessToken: async () => accessToken || '',
          }),
        );
        const data = await api.getCurrentUser();
        setUserDetail(data);

        if (data.user) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            department: data.user.department || '',
            categories: data.user.categories || [],
            phoneNumber: data.user.phoneNumber || '',
            seatNumber: data.user.seatNumber || '',
          });
          setProfileImagePreview(
            data.user.profileImageUrl || '/default-profile-image.svg',
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserDetail();
  }, []);

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    if (!isEditable) return;
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter((c) => c !== category)
      : [...formData.categories, category];
    handleChange('categories', newCategories);
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
    }
  };

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
      const api = new UserApi(
        new Configuration({ basePath: process.env.NEXT_PUBLIC_API_BASE_URL! }),
      );
      await api.updateCurrentUser({
        request: payload,
        profileImage: profileImageFile ?? undefined,
      });
      setIsEditable(false);
      // TODO: 토스트 알림, 수정 기능 다시 확인, 비밀번호 기능 구현
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  return (
    <div className="flex flex-row gap-10">
      {/* 프로필 사진 */}
      <div className="flex flex-col items-center gap-8">
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
        </div>
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
                    {formData.categories.length > 0
                      ? formData.categories.join(', ')
                      : '연구 분야 선택'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="bg-background w-auto min-w-[var(--radix-popover-trigger-width)] rounded-md border p-2 shadow-md">
              <div className="flex flex-col gap-1 overflow-y-auto">
                {Object.values(GetAllProjectsCategoryEnum).map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => toggleCategory(category)}
                    disabled={
                      !isEditable || formData.categories.includes(category)
                    }
                    className={`flex w-full flex-row items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                      formData.categories.includes(category)
                        ? 'bg-muted/50 cursor-not-allowed'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span>{category}</span>
                    {formData.categories.includes(category) && (
                      <Check className="text-primary h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 버튼 */}
        <div className="flex w-full flex-row justify-end gap-4">
          {isEditable ? (
            <Button onClick={handleSubmit}>
              <UserCheck className="mr-2" /> 변경사항 저장
            </Button>
          ) : (
            <Button onClick={() => setIsEditable(true)}>
              <UserPen className="mr-2" /> 개인정보 수정
            </Button>
          )}
          <Button>
            <LockKeyhole className="mr-2" /> 비밀번호 변경
          </Button>
        </div>
      </div>
    </div>
  );
}
