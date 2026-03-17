import { Suspense } from 'react';
import RssClient from './RssClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩중…</div>}>
      <RssClient />
    </Suspense>
  );
}
