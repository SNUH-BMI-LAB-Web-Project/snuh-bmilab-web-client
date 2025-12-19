'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Book, Conference, Award, Paper, Patent } from '@/lib/types';

import { AwardForm } from '@/components/portal/researches/achievement/form/award-form';
import { ConferenceForm } from '@/components/portal/researches/achievement/form/conference-form';
import { PatentForm } from '@/components/portal/researches/achievement/form/patent-form';
import { PaperForm } from '@/components/portal/researches/achievement/form/paper-form';
import { BookForm } from '@/components/portal/researches/achievement/form/book-form';

import { BookTable } from '@/components/portal/researches/achievement/table/book-table';
import { ConferenceTable } from '@/components/portal/researches/achievement/table/conference-table';
import { AwardTable } from '@/components/portal/researches/achievement/table/award-table';
import { PaperTable } from '@/components/portal/researches/achievement/table/paper-table';
import { PatentTable } from '@/components/portal/researches/achievement/table/patent-table';

interface ResearchManagementSystemProps {
  isUserView?: boolean;
}

export default function ResearchManagementSystem({
  isUserView = false,
}: ResearchManagementSystemProps) {
  const [activeTab, setActiveTab] = useState('book');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [books, setBooks] = useState<Book[]>([
    {
      id: 'book-1',
      name: '김철수',
      category: '저서',
      publishDate: '2023-05-15',
      publisher: '한국연구재단',
      publishingHouse: '테크북스',
      publicationName: '인공지능 연구의 최신 동향',
      title: '딥러닝 기반 자연어 처리 기법',
      isbn: '979-11-1234-567-8',
    },
    {
      id: 'book-2',
      name: '이영희',
      category: '기고',
      publishDate: '2024-03-20',
      publisher: '한국정보과학회',
      publishingHouse: '사이언스퍼블리싱',
      publicationName: '컴퓨터 비전 저널',
      title: '객체 인식 알고리즘의 발전',
      isbn: '978-89-9876-543-2',
    },
    {
      id: 'book-3',
      name: '박지민',
      category: '저서',
      publishDate: '2023-11-08',
      publisher: '교육부',
      publishingHouse: 'AI출판사',
      publicationName: '머신러닝 실전 가이드북',
      title: '강화학습 알고리즘 설계',
      isbn: '979-11-5678-234-1',
    },
  ]);

  const [conferences, setConferences] = useState<Conference[]>([
    {
      id: 'conference-1',
      name: '김철수',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      location: '서울 코엑스',
      organizer: '한국정보과학회',
      conferenceName: '2024 인공지능 국제 학술대회',
      presentationType: 'Oral',
      presentationTitle: '자연어 처리를 위한 트랜스포머 모델 개선',
      relatedProject: 'AI 기반 텍스트 분석 시스템',
      relatedTask: 'NLP 모델 최적화',
    },
    {
      id: 'conference-2',
      name: '이영희',
      startDate: '2024-06-20',
      endDate: '2024-06-22',
      location: '부산 BEXCO',
      organizer: '국제인공지능학회',
      conferenceName: 'ICAI 2024',
      presentationType: 'Poster',
      presentationTitle: '컴퓨터 비전 기반 객체 인식 알고리즘',
      relatedProject: '스마트 시티 비전 시스템',
      relatedTask: '실시간 객체 검출',
    },
    {
      id: 'conference-3',
      name: '박지민',
      startDate: '2023-11-10',
      endDate: '2023-11-12',
      location: '대전 컨벤션센터',
      organizer: '한국로봇학회',
      conferenceName: '2023 로봇공학 심포지엄',
      presentationType: 'Mini oral',
      presentationTitle: '강화학습을 활용한 로봇 제어 시스템',
      relatedProject: '자율주행 로봇 개발',
    },
    {
      id: 'conference-4',
      name: '최민수',
      startDate: '2024-09-05',
      endDate: '2024-09-07',
      location: '제주 ICC',
      organizer: '대한의료정보학회',
      conferenceName: '2024 의료 AI 컨퍼런스',
      presentationType: 'Oral',
      presentationTitle: '의료 영상 분석을 위한 딥러닝 모델',
      relatedProject: '의료 진단 AI 시스템',
      relatedTask: '영상 분할 알고리즘',
    },
  ]);

  const [awards, setAwards] = useState<Award[]>([
    {
      id: 'award-1',
      name: '김철수',
      date: '2024-03-20',
      organizer: '한국정보과학회',
      eventName: '2024 인공지능 국제 학술대회',
      awardName: '우수 논문상',
      presentationTitle: '자연어 처리를 위한 트랜스포머 모델 개선',
      relatedProject: 'AI 기반 텍스트 분석 시스템',
      relatedTask: 'NLP 모델 최적화',
    },
    {
      id: 'award-2',
      name: '이영희',
      date: '2023-12-01',
      organizer: '과학기술정보통신부',
      eventName: '2023 젊은 과학자상 시상식',
      awardName: '젊은 과학자상',
      presentationTitle: '컴퓨터 비전 분야의 혁신적 연구',
      relatedProject: '스마트 시티 비전 시스템',
    },
    {
      id: 'award-3',
      name: '박지민',
      date: '2024-11-15',
      organizer: '대한의료정보학회',
      eventName: '2024년 대한의료정보학회 추계학술대회',
      awardName: '최우수 포스터상',
      presentationTitle: '딥러닝 기반 의료 영상 진단 시스템',
      relatedProject: '의료 진단 AI 시스템',
      relatedTask: '질병 예측 모델',
    },
  ]);

  const [papers, setPapers] = useState<Paper[]>([
    {
      id: 'paper-1',
      acceptDate: '2024-01-15',
      publishDate: '2024-03-20',
      journalName: 'Journal of Artificial Intelligence Research',
      journalInfo: {
        name: 'Journal of Artificial Intelligence Research',
        category: 'SCI',
        publisher: 'AI Access Foundation',
        country: '미국',
        isbn: '978-1-234567-89-0',
        issn: '1076-9757',
        eissn: '1943-5037',
        jif: '4.985',
        jcrRank: 'Q1',
      },
      paperTitle:
        'Transformer-Based Natural Language Processing for Korean Text Analysis',
      firstAuthors: '김철수, 이영희',
      coAuthors: '박지민, John Smith, Jane Doe',
      allAuthors: '김철수, 이영희, 박지민, John Smith, Jane Doe',
      authorCount: 5,
      labMembers: ['김철수', '이영희'],
      correspondingAuthor: '김철수',
      vol: '45',
      page: '123-145',
      paperLink: 'https://example.com/paper1',
      doi: '10.1016/j.jair.2024.03.015',
      pmid: '38123456',
      attachments: ['paper1_manuscript.pdf', 'paper1_supplementary.pdf'],
      citationCount: '12',
      professorRole: '제1저자',
      isRepresentative: true,
    },
    {
      id: 'paper-2',
      acceptDate: '2023-10-20',
      publishDate: '2023-12-15',
      journalName:
        'IEEE Transactions on Pattern Analysis and Machine Intelligence',
      journalInfo: {
        name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
        category: 'SCIE',
        publisher: 'IEEE',
        country: '미국',
        isbn: '978-1-234567-90-6',
        issn: '0162-8890',
        eissn: '1939-3539',
        jif: '24.314',
        jcrRank: 'Q1',
      },
      paperTitle:
        'Deep Learning Approaches for Real-Time Object Detection in Urban Environments',
      firstAuthors: '이영희',
      coAuthors: '최민수, 박지민, Michael Brown',
      allAuthors: '이영희, 최민수, 박지민, Michael Brown',
      authorCount: 4,
      labMembers: ['이영희', '최민수'],
      correspondingAuthor: '이영희',
      vol: '42',
      page: '2341-2358',
      paperLink: 'https://example.com/paper2',
      doi: '10.1109/TPAMI.2023.1234567',
      pmid: '37654321',
      attachments: ['paper2_final.pdf'],
      citationCount: '28',
      professorRole: '교신저자',
      isRepresentative: true,
    },
    {
      id: 'paper-3',
      acceptDate: '2023-08-05',
      publishDate: '2023-10-12',
      journalName: 'Robotics and Autonomous Systems',
      journalInfo: {
        name: 'Robotics and Autonomous Systems',
        category: 'SCOPUS',
        publisher: 'Elsevier',
        country: '네덜란드',
        isbn: '978-0-444-89876-3',
        issn: '0921-8890',
        eissn: '1872-793X',
        jif: '4.802',
        jcrRank: 'Q2',
      },
      paperTitle:
        'Reinforcement Learning-Based Robot Control in Dynamic Environments',
      firstAuthors: '박지민, 김철수',
      coAuthors: 'Sarah Johnson',
      allAuthors: '박지민, 김철수, Sarah Johnson',
      authorCount: 3,
      labMembers: ['박지민'],
      correspondingAuthor: '박지민',
      vol: '156',
      page: '104201',
      paperLink: 'https://example.com/paper3',
      doi: '10.1016/j.robot.2023.104201',
      pmid: '36789012',
      attachments: ['paper3_preprint.pdf', 'paper3_code.zip'],
      citationCount: '8',
      professorRole: '공저자',
      isRepresentative: false,
    },
    {
      id: 'paper-4',
      acceptDate: '2024-05-10',
      publishDate: '2024-07-25',
      journalName: 'Medical Image Analysis',
      journalInfo: {
        name: 'Medical Image Analysis',
        category: 'SCI',
        publisher: 'Elsevier',
        country: '네덜란드',
        isbn: '978-0-444-89877-0',
        issn: '1361-8415',
        eissn: '1361-8423',
        jif: '10.711',
        jcrRank: 'Q1',
      },
      paperTitle:
        'AI-Powered Diagnostic System for Medical Image Interpretation',
      firstAuthors: '최민수',
      coAuthors: '김철수, 이영희, David Lee, Emily Chen',
      allAuthors: '최민수, 김철수, 이영희, David Lee, Emily Chen',
      authorCount: 5,
      labMembers: ['최민수', '김철수'],
      correspondingAuthor: '최민수',
      vol: '88',
      page: '102875',
      paperLink: 'https://example.com/paper4',
      doi: '10.1016/j.media.2024.102875',
      pmid: '39012345',
      attachments: [
        'paper4_manuscript.pdf',
        'paper4_figures.pdf',
        'paper4_data.xlsx',
      ],
      citationCount: '5',
      professorRole: '제1저자',
      isRepresentative: false,
    },
  ]);

  const [patents, setPatents] = useState<Patent[]>([
    {
      id: 'patent-1',
      applicationDate: '2024-01-15',
      applicationNumber: '10-2024-0012345',
      applicationName: '자연어 처리 기반 문서 분류 시스템 및 방법',
      allApplicants: '김철수, 이영희, 한국과학기술원',
      labApplicants: ['김철수', '이영희'],
      notes: '딥러닝 모델을 활용한 자동 문서 분류 시스템',
      relatedTask: 'NLP 모델 최적화',
      relatedProject:
        'Transformer-Based Natural Language Processing for Korean Text Analysis',
      attachments: ['patent1_application.pdf', 'patent1_drawings.pdf'],
    },
    {
      id: 'patent-2',
      applicationDate: '2023-06-10',
      applicationNumber: '10-2023-0098765',
      applicationName: '딥러닝 기반 실시간 객체 추적 장치',
      allApplicants: '박지민, 최민수, 서울대학교',
      labApplicants: ['박지민', '최민수'],
      notes: '컴퓨터 비전 기술을 활용한 객체 추적',
      relatedTask: '실시간 객체 검출',
      relatedProject:
        'Deep Learning Approaches for Real-Time Object Detection in Urban Environments',
      attachments: ['patent2_application.pdf'],
    },
    {
      id: 'patent-3',
      applicationDate: '2024-08-22',
      applicationNumber: '10-2024-0156789',
      applicationName: 'AI 기반 의료 영상 진단 지원 시스템',
      allApplicants: '최민수, 김철수, 연세대학교',
      labApplicants: ['최민수', '김철수'],
      notes: '의료 영상에서 질병을 자동으로 진단하는 AI 시스템',
      relatedTask: '영상 분할 알고리즘',
      relatedProject:
        'AI-Powered Diagnostic System for Medical Image Interpretation',
      attachments: ['patent3_application.pdf', 'patent3_claims.pdf'],
    },
  ]);

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, type: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('정말 삭제하시겠습니까?')) {
      // eslint-disable-next-line default-case
      switch (type) {
        case 'book':
          setBooks(books.filter((item) => item.id !== id));
          break;
        case 'conference':
          setConferences(conferences.filter((item) => item.id !== id));
          break;
        case 'award':
          setAwards(awards.filter((item) => item.id !== id));
          break;
        case 'paper':
          setPapers(papers.filter((item) => item.id !== id));
          break;
        case 'patent':
          setPatents(patents.filter((item) => item.id !== id));
          break;
      }
    }
  };

  const handleSave = (data: any, type: string) => {
    const newItem = {
      ...data,
      id: editingItem?.id || `${type}-${Date.now()}`,
    };

    // eslint-disable-next-line default-case
    switch (type) {
      case 'book':
        if (editingItem) {
          setBooks(
            books.map((item) => (item.id === editingItem.id ? newItem : item)),
          );
        } else {
          setBooks([...books, newItem]);
        }
        break;
      case 'conference':
        if (editingItem) {
          setConferences(
            conferences.map((item) =>
              item.id === editingItem.id ? newItem : item,
            ),
          );
        } else {
          setConferences([...conferences, newItem]);
        }
        break;
      case 'award':
        if (editingItem) {
          setAwards(
            awards.map((item) => (item.id === editingItem.id ? newItem : item)),
          );
        } else {
          setAwards([...awards, newItem]);
        }
        break;
      case 'paper':
        if (editingItem) {
          setPapers(
            papers.map((item) => (item.id === editingItem.id ? newItem : item)),
          );
        } else {
          setPapers([...papers, newItem]);
        }
        break;
      case 'patent':
        if (editingItem) {
          setPatents(
            patents.map((item) =>
              item.id === editingItem.id ? newItem : item,
            ),
          );
        } else {
          setPatents([...patents, newItem]);
        }
        break;
    }

    setIsDialogOpen(false);
    setEditingItem(null);
  };

  // 엑셀 파일 다운로드 함수
  const handleExportToExcel = () => {
    let tableData: any[] = [];

    switch (activeTab) {
      case 'book':
        tableData = books;
        break;
      case 'conference':
        tableData = conferences;
        break;
      case 'award':
        tableData = awards;
        break;
      case 'paper':
        tableData = papers;
        break;
      case 'patent':
        tableData = patents;
        break;
      default:
        return;
    }

    console.log(`${activeTab.toUpperCase()} TABLE`);
    console.table(tableData);
  };

  const getCurrentForm = () => {
    const type = editingItem?.type || activeTab;

    switch (type) {
      case 'book':
        return (
          <BookForm
            initialData={editingItem}
            onSave={(data) => handleSave(data, 'book')}
            onCancel={() => setIsDialogOpen(false)}
          />
        );
      case 'conference':
        return (
          <ConferenceForm
            initialData={editingItem}
            onSave={(data) => handleSave(data, 'conference')}
            onCancel={() => setIsDialogOpen(false)}
          />
        );
      case 'award':
        return (
          <AwardForm
            initialData={editingItem}
            onSave={(data) => handleSave(data, 'award')}
            onCancel={() => setIsDialogOpen(false)}
          />
        );
      case 'paper':
        return (
          <PaperForm
            initialData={editingItem}
            onSave={(data) => handleSave(data, 'paper')}
            onCancel={() => setIsDialogOpen(false)}
          />
        );
      case 'patent':
        return (
          <PatentForm
            initialData={editingItem}
            onSave={(data) => handleSave(data, 'patent')}
            onCancel={() => setIsDialogOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">연구 성과</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-2 md:flex-col md:items-end lg:flex-row">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="book">저서</TabsTrigger>
            <TabsTrigger value="conference">학회 발표</TabsTrigger>
            <TabsTrigger value="award">수상</TabsTrigger>
            <TabsTrigger value="paper">논문</TabsTrigger>
            <TabsTrigger value="patent">특허</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button onClick={handleExportToExcel} variant="outline">
              <FileDown className="h-4 w-4" />
              엑셀 파일 다운로드
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              연구 성과 등록
            </Button>
          </div>
        </div>

        <TabsContent value="book" className="space-y-4">
          <BookTable data={books} onEdit={handleEdit} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="conference" className="space-y-4">
          <ConferenceTable
            data={conferences}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="award" className="space-y-4">
          <AwardTable
            data={awards}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="paper" className="space-y-4">
          <PaperTable
            data={papers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isUserView={isUserView}
          />
        </TabsContent>

        <TabsContent value="patent" className="space-y-4">
          <PatentTable
            data={patents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? '연구성과 수정' : '새 연구 성과 등록'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? '연구성과 정보를 수정하세요.'
                : '새로운 연구 성과 정보를 입력하세요.'}
            </DialogDescription>
          </DialogHeader>
          {getCurrentForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
