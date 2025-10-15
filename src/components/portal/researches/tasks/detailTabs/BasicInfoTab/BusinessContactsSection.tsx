'use client';

import { Input } from '@/components/ui/input';

interface BusinessContactInfo {
  businessContactName: string;
  businessContactDepartment: string;
  businessContactEmail: string;
  businessContactPhone: string;
}

interface BusinessContactsSectionProps {
  isEditMode: boolean;
  editData?: BusinessContactInfo;
  setEditData?: (
    updater: (prev: BusinessContactInfo) => BusinessContactInfo,
  ) => void;
  taskInfo?: BusinessContactInfo | null;
}

export default function BusinessContactsSection({
  isEditMode,
  editData,
  setEditData,
  taskInfo,
}: BusinessContactsSectionProps) {
  const alwaysBlackInput =
    'bg-white text-black border-gray-300 [&:disabled]:text-black [&:disabled]:opacity-100';

  const handleChange = (key: keyof BusinessContactInfo, value: string) => {
    if (!setEditData) return;
    setEditData((prev: BusinessContactInfo) => ({
      ...prev,
      [key]: value,
    }));
  };

  const info: BusinessContactInfo = {
    businessContactName:
      editData?.businessContactName ?? taskInfo?.businessContactName ?? '',
    businessContactDepartment:
      editData?.businessContactDepartment ??
      taskInfo?.businessContactDepartment ??
      '',
    businessContactEmail:
      editData?.businessContactEmail ?? taskInfo?.businessContactEmail ?? '',
    businessContactPhone:
      editData?.businessContactPhone ?? taskInfo?.businessContactPhone ?? '',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">사업담당자 정보</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="businessContactName"
            className="mb-2 block text-sm font-medium text-blue-600"
          >
            이름
          </label>
          <Input
            id="businessContactName"
            className={alwaysBlackInput}
            placeholder="담당자 이름"
            value={info.businessContactName}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('businessContactName', e.target.value)
            }
          />
        </div>

        <div>
          <label
            htmlFor="businessContactDepartment"
            className="mb-2 block text-sm font-medium text-blue-600"
          >
            소속
          </label>
          <Input
            id="businessContactDepartment"
            className={alwaysBlackInput}
            placeholder="소속 부서"
            value={info.businessContactDepartment}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('businessContactDepartment', e.target.value)
            }
          />
        </div>

        <div>
          <label
            htmlFor="businessContactEmail"
            className="mb-2 block text-sm font-medium text-blue-600"
          >
            이메일
          </label>
          <Input
            id="businessContactEmail"
            className={alwaysBlackInput}
            placeholder="이메일 주소"
            value={info.businessContactEmail}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('businessContactEmail', e.target.value)
            }
          />
        </div>

        <div>
          <label
            htmlFor="businessContactPhone"
            className="mb-2 block text-sm font-medium text-blue-600"
          >
            전화번호
          </label>
          <Input
            id="businessContactPhone"
            className={alwaysBlackInput}
            placeholder="전화번호"
            value={info.businessContactPhone}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('businessContactPhone', e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}
