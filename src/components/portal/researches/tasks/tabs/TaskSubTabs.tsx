'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function TaskSubTabs() {
  return (
    <Tabs defaultValue="acknowledgment" className="mt-16 w-full">
      {/* 상단 탭 리스트 */}
      <TabsList className="grid h-10 w-full grid-cols-5 rounded-lg border border-gray-200 bg-white">
        <TabsTrigger
          value="acknowledgment"
          className="font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          사사표기
        </TabsTrigger>
        <TabsTrigger
          value="research-projects"
          className="font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          관련연구과제
        </TabsTrigger>
        <TabsTrigger
          value="papers"
          className="font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          논문
        </TabsTrigger>
        <TabsTrigger
          value="conferences"
          className="font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          학회발표
        </TabsTrigger>
        <TabsTrigger
          value="patents"
          className="font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          특허
        </TabsTrigger>
      </TabsList>

      {/* 각 탭 컨텐츠 */}
      <TabsContent value="acknowledgment" className="mt-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">사사표기 문구</h3>
          <p className="text-gray-700">본 연구는 OOO 지원으로 수행되었음</p>
        </div>
      </TabsContent>

      <TabsContent value="research-projects" className="mt-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          등록된 관련연구과제가 없습니다.
        </div>
      </TabsContent>

      <TabsContent value="papers" className="mt-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">논문</h3>
          <p className="text-gray-700">논문 데이터가 여기에 표시됩니다.</p>
        </div>
      </TabsContent>

      <TabsContent value="conferences" className="mt-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">학회발표</h3>
          <p className="text-gray-700">학회 발표 데이터가 여기에 표시됩니다.</p>
        </div>
      </TabsContent>

      <TabsContent value="patents" className="mt-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">특허</h3>
          <p className="text-gray-700">특허 데이터가 여기에 표시됩니다.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
