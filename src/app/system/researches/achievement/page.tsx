import ResearchManagementSystem from '@/components/portal/researches/achievement/achievement-management-system';

export default function AdminAchievementPage() {
  return (
    <main className="bg-background min-h-screen">
      <ResearchManagementSystem isUserView={false} />
    </main>
  );
}
