// =================== ENUM TYPES ===================

// 연구 카테고리
export type ProjectCategory =
  | 'Bioinformatics'
  | 'Medical AI (Pathology)'
  | 'Medical AI (Signal data)'
  | 'Medical Big Data'
  | 'NLP';

// 연구 상태
export type ResearchStatus = '진행 전' | '진행 중' | '진행 종료' | '진행 대기';

// 사용자 권한
export type Role = 'USER' | 'ADMIN';

// 휴가 상태
export type LeaveStatus = '대기' | '승인' | '반려';

// 휴가 유형
export type LeaveType = '연차' | '반차' | '병가' | '기타';

// =================== USER ===================

export interface User {
  userId: string;
  email: string;
  name: string;
  department: string;
  role: Role;
  createdAt: string;
  profileImageUrl?: string;
}

export interface UserInfo {
  userId: string;
  category?: string;
  seatNum?: string;
  phoneNumber?: string;
  joinedAt?: string;
  comment?: string;
}

export interface UserLeave {
  userLeaveId: string;
  userId: string;
  annualLeaveCount: number;
  usedLeaveCount: number;
}

// =================== PROJECT ===================

export interface Project {
  projectId: string;
  authorId: string; // userId
  title: string;
  content?: string;
  startDate: string;
  endDate: string;
  category: ProjectCategory;
  status: ResearchStatus;
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
}

// =================== PROJECT ===================
export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  participants: string[];
  summary: string;
  content: string;
  createdAt: string;
  createdBy: string;
  comments: MeetingComment[];
}

export interface MeetingComment {
  id: string;
  meetingId: string;
  userId: string;
  content: string;
  createdAt: string;
}

// =================== RSS ===================
export interface Rss {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  category: string;
  appbegin: string;
  appdue: string;
  budget: number;
}

// =================== SORT OPTION ===================

export interface SortOption {
  value: string;
  label: string;
}

// // 조인 테이블 타입 (DB 전용)
// export interface ProjectParticipant {
//   participantId: string;
//   projectId: string;
//   userId: string;
// }
//
// // 확장 타입: 참여자 정보 포함
// export interface ProjectWithParticipants extends Researches {
//   participantsDetail: User[];
// }
//
// // =================== REPORT ===================
//
// export interface Report {
//   reportId: string;
//   tag: string;
//   dueDate: string;
//   createdAt: string;
// }
//
// export interface UserReport {
//   userReportId: string;
//   userId: string;
//   reportId: string;
//   fileUrl: string;
//   submittedAt: string;
// }
//
// // =================== LEAVE ===================
//
// export interface Leave {
//   leaveId: string;
//   userId: string;
//   startDate: string;
//   endDate: string;
//   leaveStatus: LeaveStatus;
//   leaveType: LeaveType;
//   leaveReason?: string;
//   appliedAt: string;
// }
//
// // =================== ETC ===================
