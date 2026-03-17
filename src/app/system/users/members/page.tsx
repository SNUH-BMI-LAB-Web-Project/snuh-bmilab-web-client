import { Suspense } from 'react';
import MembersClient from './MembersClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩중…</div>}>
      <MembersClient />
    </Suspense>
  );
}
