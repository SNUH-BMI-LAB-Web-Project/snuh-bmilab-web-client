'use client';

import { Input } from '@/components/ui/input';
import React from 'react';

interface Props {
  isEditMode: boolean;
  taskInfo?: any;
  editData?: any;
  setEditData?: (data: any) => void;
}

export default function ProposalContactsSection({
  isEditMode,
  taskInfo,
  editData,
  setEditData,
}: Props) {
  const client = taskInfo?.clientContacts?.[0] ?? {};
  const internal = taskInfo?.internalContacts?.[0] ?? {};

  const alwaysBlackInput =
    'bg-white text-black border-gray-300 [&:disabled]:text-black [&:disabled]:opacity-100';

  const handleChange = (key: string, value: string) => {
    setEditData?.((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">사업담당자 연락처</h3>

      <div className="mb-6">
        <h4 className="text-md mb-3 font-medium text-blue-600">
          발주처 담당자
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            className={alwaysBlackInput}
            placeholder="이름"
            value={editData?.contractorContactName ?? client.name ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('contractorContactName', e.target.value)
            }
          />
          <Input
            className={alwaysBlackInput}
            placeholder="소속"
            value={editData?.contractorContactDepartment ?? client.org ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('contractorContactDepartment', e.target.value)
            }
          />
          <Input
            className={alwaysBlackInput}
            placeholder="이메일"
            value={editData?.contractorContactEmail ?? client.email ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('contractorContactEmail', e.target.value)
            }
          />
          <Input
            className={alwaysBlackInput}
            placeholder="전화번호"
            value={editData?.contractorContactPhone ?? client.phone ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('contractorContactPhone', e.target.value)
            }
          />
        </div>
      </div>

      <div>
        <h4 className="text-md mb-3 font-medium text-blue-600">원내 담당자</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            className={alwaysBlackInput}
            placeholder="이름"
            value={editData?.internalContactName ?? internal.name ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('internalContactName', e.target.value)
            }
          />
          <Input
            className={alwaysBlackInput}
            placeholder="소속"
            value={editData?.internalContactDepartment ?? internal.org ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('internalContactDepartment', e.target.value)
            }
          />
          <Input
            className={alwaysBlackInput}
            placeholder="이메일"
            value={editData?.internalContactEmail ?? internal.email ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('internalContactEmail', e.target.value)
            }
          />
          <Input
            className={alwaysBlackInput}
            placeholder="전화번호"
            value={editData?.internalContactPhone ?? internal.phone ?? ''}
            disabled={!isEditMode}
            onChange={(e) =>
              handleChange('internalContactPhone', e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}
