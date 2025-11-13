'use client';

import { Input } from '@/components/ui/input';

interface ContractDateSectionProps {
  isEditMode?: boolean;
  contractDate: string;
  setContractDate: (date: string) => void;
}

export default function ContractDateSection({
  isEditMode = false,
  contractDate,
  setContractDate,
}: ContractDateSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">협약일</h3>
      <div className="grid grid-cols-1 gap-x-16 gap-y-6">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">
            협약 체결일
          </div>
          {isEditMode ? (
            <Input
              type="date"
              value={contractDate}
              onChange={(e) => setContractDate(e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="text-lg text-gray-900">
              {contractDate || '협약일이 설정되지 않았습니다'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
