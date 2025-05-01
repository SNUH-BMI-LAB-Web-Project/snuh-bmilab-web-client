import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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

export function formatDateTimeVer2(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy. M. d. (EEE)', { locale: ko });
}

export function formatDateTimeVer3(dateStr: string | Date): string {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const day = weekdays[date.getDay()];

  return `${format(date, 'yyyy. M. d.', { locale: ko })} (${day})`;
}
