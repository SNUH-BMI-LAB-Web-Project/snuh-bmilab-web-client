'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileEditForm from '@/components/portal/mypage/profile-edit-form';
import ComingSoon from '@/components/common/coming-soon';

export default function MyPage() {
  const router = useRouter();
  const [tab, setTab] = useState('profile');

  return (
    <div className="flex flex-col px-30">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">마이 페이지</h1>
      </div>

      {/* 탭 */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 w-full justify-around">
          <TabsTrigger value="profile" className="flex-1">
            내 정보
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex-1">
            휴가 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="py-6">
          <ProfileEditForm />
        </TabsContent>
        <TabsContent value="leave">
          <ComingSoon />
        </TabsContent>
      </Tabs>
    </div>
  );
}
