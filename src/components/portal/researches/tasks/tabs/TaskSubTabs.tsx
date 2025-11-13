"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AcknowledgmentTab from "../detailTabs/SubTabs/AcknowledgmentTab"
import ResearchProjectsTab from "../detailTabs/SubTabs/ResearchProjectsTab"
import PapersTab from "../detailTabs/SubTabs/PapersTab"
import ConferencesTab from "../detailTabs/SubTabs/ConferencesTab"
import PatentsTab from "../detailTabs/SubTabs/PatentsTab"

export default function TaskSubTabs() {
  return (
    <Tabs defaultValue="acknowledgment" className="mt-16 w-full">
      {/* 상단 탭 리스트 */}
      <TabsList className="grid h-10 w-full grid-cols-5 rounded-lg border border-gray-200 bg-white shadow-sm">
        <TabsTrigger
          value="acknowledgment"
          className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-colors duration-150"
        >
          사사표기
        </TabsTrigger>
        <TabsTrigger
          value="research-projects"
          className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-colors duration-150"
        >
          관련연구과제
        </TabsTrigger>
        <TabsTrigger
          value="papers"
          className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-colors duration-150"
        >
          논문
        </TabsTrigger>
        <TabsTrigger
          value="conferences"
          className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-colors duration-150"
        >
          학회발표
        </TabsTrigger>
        <TabsTrigger
          value="patents"
          className="font-medium text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-colors duration-150"
        >
          특허
        </TabsTrigger>
      </TabsList>

      {/* 각 탭 컨텐츠 */}
      <TabsContent value="acknowledgment" className="mt-6">
        <AcknowledgmentTab />
      </TabsContent>

      <TabsContent value="research-projects" className="mt-6">
        <ResearchProjectsTab />
      </TabsContent>

      <TabsContent value="papers" className="mt-6">
        <PapersTab />
      </TabsContent>

      <TabsContent value="conferences" className="mt-6">
        <ConferencesTab />
      </TabsContent>

      <TabsContent value="patents" className="mt-6">
        <PatentsTab />
      </TabsContent>
    </Tabs>
  )
}
