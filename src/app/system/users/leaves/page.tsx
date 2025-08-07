import LeavesAdmin from '@/components/system/users/leaves/leaves-table';
import React from 'react';

export default function LeavesPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">휴가 관리</h1>
      <LeavesAdmin />
    </div>
  );
}
