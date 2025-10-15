'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import BasicInfoTab from '../detailTabs/BasicInfoTab/BasicInfoTab';
import ProposalTab from '../detailTabs/ProposalTab/ProposalTab';
import PresentationTab from '../detailTabs/PresentationTab/PresentationTab';
import ContractTab from '../detailTabs/ContractTab/ContractTab';
import YearlyTab from '../detailTabs/YearlyTab/YearlyTab';

export default function TaskMainTabs({ taskInfo }: { taskInfo?: any }) {
  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) alert('삭제 완료');
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end gap-2">
        <Button
          onClick={handleDelete}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          삭제
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid h-10 w-full grid-cols-5 rounded-lg border border-gray-200 bg-white">
          <TabsTrigger
            value="basic"
            className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            기본정보
          </TabsTrigger>
          <TabsTrigger
            value="proposal"
            className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            제안서
          </TabsTrigger>
          <TabsTrigger
            value="presentation"
            className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            발표준비
          </TabsTrigger>
          <TabsTrigger
            value="contract"
            className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            협약진행
          </TabsTrigger>
          <TabsTrigger
            value="yearly"
            className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            연차별
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab taskInfo={taskInfo} />
        </TabsContent>
        <TabsContent value="proposal" className="mt-6">
          <ProposalTab taskInfo={taskInfo?.proposal} />
        </TabsContent>
        <TabsContent value="presentation" className="mt-6">
          <PresentationTab taskInfo={taskInfo?.presentation} />
        </TabsContent>
        <TabsContent value="contract" className="mt-6">
          <ContractTab taskInfo={taskInfo?.contract} />
        </TabsContent>
        <TabsContent value="yearly" className="mt-6">
          <YearlyTab taskInfo={taskInfo?.yearly} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
