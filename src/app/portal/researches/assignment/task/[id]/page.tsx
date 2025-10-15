'use client';

import TaskHeaderCard from '@/components/portal/researches/tasks/tabs/TaskHeaderCard';
import TaskMainTabs from '@/components/portal/researches/tasks/tabs/TaskMainTabs';
import TaskSubTabs from '@/components/portal/researches/tasks/tabs/TaskSubTabs';

export default function Page() {
  return (
    <div className="min-h-screen p-20 pt-6">
      <TaskHeaderCard />
      <TaskMainTabs />
      <TaskSubTabs />
    </div>
  );
}
