export type ProjectCategory =
  | 'Bioinformatics'
  | 'Medical AI (Pathology)'
  | 'Medical AI (Signal data)'
  | 'Medical Big Data'
  | 'NLP';

export type ProjectStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';

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
