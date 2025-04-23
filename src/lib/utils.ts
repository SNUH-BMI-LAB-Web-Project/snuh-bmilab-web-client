import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ResearchStatus } from '@/types/researches';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const day = weekdays[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}년 ${mm}월 ${dd}일 (${day}) ${hh}:${min}`;
}

export const getStatusColor = (status: ResearchStatus) => {
  switch (status) {
    case '진행 전':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case '진행 중':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case '진행 종료':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case '진행 대기':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    default:
      return '';
  }
};
