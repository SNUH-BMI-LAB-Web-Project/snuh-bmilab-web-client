import LeavesAdmin from '@/components/system/users/leaves/leaves-table';
import React from 'react';

export default function LeavesPage() {
  return (
    <div className="mb-8 flex flex-col">
      <h1 className="text-3xl font-bold">휴가 관리</h1>
      <LeavesAdmin />
    </div>
  );
}
