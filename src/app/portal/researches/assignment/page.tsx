import { Suspense } from 'react';
import TaskManagementClient from './TaskManagementClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩중…</div>}>
      <TaskManagementClient />
    </Suspense>
  );
}
