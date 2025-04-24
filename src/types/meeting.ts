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
