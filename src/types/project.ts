export type ProjectCategory =
  | 'Bioinformatics'
  | 'Medical AI (Pathology)'
  | 'Medical AI (Signal data)'
  | 'Medical Big Data'
  | 'NLP';

export type ProjectStatus = '진행 전' | '진행 중' | '진행 종료' | '진행 대기';

export interface Project {
  projectId: string;
  authorId: string; // userId
  title: string;
  content?: string;
  startDate: string;
  endDate: string;
  category: ProjectCategory;
  status: ProjectStatus;
  createdAt: string;
  updatedAt?: string;

  // 프론트 확장 필드
  leaderId: string[]; // userId[] or name[]
  participantId: string[]; // userId[] only
  files?: ProjectFile[];
}

export interface ProjectFile {
  name: string;
  size: string;
  type: string;
  url: string;
}
