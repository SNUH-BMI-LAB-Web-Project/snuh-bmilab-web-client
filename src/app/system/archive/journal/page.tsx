import { Suspense } from 'react';
import JournalClient from './JournalClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩중…</div>}>
      <JournalClient />
    </Suspense>
  );
}
