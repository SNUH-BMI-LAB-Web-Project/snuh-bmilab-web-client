import { Button } from '@/components/ui/button';
import { ProjectTable } from '@/components/researches/projects/project-table';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">연구 & 프로젝트</h1>
        <Link href="/researches/projects/new">
          <Button>새 프로젝트 등록</Button>
        </Link>
      </div>
      <ProjectTable />
    </div>
  );
}
