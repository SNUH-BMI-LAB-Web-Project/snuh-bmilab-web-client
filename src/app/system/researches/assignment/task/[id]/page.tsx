'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import TaskHeaderCard from '@/components/portal/researches/tasks/tabs/TaskHeaderCard';
import TaskMainTabs from '@/components/portal/researches/tasks/tabs/TaskMainTabs';
import TaskSubTabs from '@/components/portal/researches/tasks/tabs/TaskSubTabs';
import { Button } from '@/components/ui/button';

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-20 pt-6 lg:p-20">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>
        </div>
      </div>

      <TaskHeaderCard />
      <TaskMainTabs />
      <TaskSubTabs />
    </div>
  );
}
