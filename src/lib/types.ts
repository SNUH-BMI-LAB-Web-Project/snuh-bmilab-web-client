export interface Book {
  id: string;
  name: string;
  category: '기고' | '저서';
  publishDate: string;
  publisher: string;
  publishingHouse: string;
  publicationName: string;
  title: string;
  isbn: string;
}

export interface Conference {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  conferenceName: string;
  presentationType: 'Oral' | 'Mini oral' | 'Poster';
  presentationTitle: string;
  relatedProject?: string;
  relatedTask?: string;
}

export interface Award {
  id: string;
  name: string;
  date: string;
  organizer: string;
  eventName: string;
  awardName: string;
  presentationTitle: string;
  relatedProject?: string;
  relatedTask?: string;
}

export interface JournalInfo {
  name: string;
  category: 'SCI' | 'SCIE' | 'SCOPUS' | 'ESCI';
  publisher: string;
  country: string;
  isbn: string;
  issn: string;
  eissn: string;
  jif: string;
  jcrRank: string;
}

export interface Paper {
  id: string;
  acceptDate: string;
  publishDate: string;
  journalName: string;
  journalInfo?: JournalInfo; // 저널 정보 추가
  paperTitle: string;
  firstAuthors: string; // 제1저자 (필수)
  coAuthors: string; // 공동저자
  allAuthors: string; // 표시용 (자동 생성)
  authorCount: number;
  labMembers: string[];
  correspondingAuthor: string;
  vol: string;
  page: string;
  paperLink: string;
  doi: string;
  pmid: string;
  attachments: string[];
  citationCount: string;
  professorRole: '제1저자' | '공저자' | '교신저자';
  isRepresentative: boolean;
}

export interface Patent {
  id: string;
  applicationDate: string;
  applicationNumber: string;
  applicationName: string;
  allApplicants: string;
  labApplicants: string[];
  notes: string;
  relatedTask?: string;
  relatedProject?: string; // 연계 논문에서 연계 프로젝트로 변경
  attachments: string[];
}
