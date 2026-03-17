import ResearchManagementSystem from '@/components/portal/researches/achievement/achievement-management-system';
import { Suspense } from 'react';

export default function AdminAchievementPage() {
  return (
    <main className="bg-background min-h-screen">
      <Suspense fallback={<div className="container mx-auto py-8">로딩중…</div>}>
        <ResearchManagementSystem isUserView={false} />
      </Suspense>
    </main>
  );
}
