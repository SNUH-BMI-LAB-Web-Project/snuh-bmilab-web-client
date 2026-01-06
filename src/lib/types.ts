export interface Journal {
  id: number;

  paperTitle: string;
  journalName: string;

  publishDate: string;
  acceptDate?: string;

  allAuthors: string;
  firstAuthor?: string;
  coAuthors?: string;

  vol?: string;
  page?: string;

  doi?: string;
  pmid?: string;
  paperLink?: string;

  projectId?: number;
  taskId?: number;
}

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
  journalInfo?: JournalInfo;
  journal?: {
    id: number;
    name?: string;
  };

  paperTitle: string;

  firstAuthors: string;
  coAuthors: string;
  allAuthors: string;
  correspondingAuthor: string;
  labMembers: string[];

  authorCount: number;

  vol: string;
  page: string;

  paperLink: string;
  doi: string;
  pmid: string;

  attachments: string[];

  citationCount: string;
  citations?: number;

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
