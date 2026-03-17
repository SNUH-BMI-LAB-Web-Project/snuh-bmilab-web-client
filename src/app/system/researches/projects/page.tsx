import { Suspense } from 'react';
import ProjectsClient from './ProjectsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩중…</div>}>
      <ProjectsClient />
    </Suspense>
  );
}
