'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatDateTimeVer2 } from '@/lib/utils';
import {
  ApplyLeaveRequestTypeEnum,
  LeaveApi,
  LeaveDetail,
  LeaveDetailTypeEnum,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

const leaveApi = new LeaveApi(getApiConfig());

/* =========================
 * Types
 * ======================= */
type VacationMeta = {
  name: string;
  color: string;
  requireReason: boolean;
};

type HolidayLite = { date: string; name: string };

/* =========================
 * Constants
 * ======================= */
export const VACATION_TYPES: Record<LeaveDetailTypeEnum, VacationMeta> = {
  ANNUAL: { name: '일반 연차', color: 'bg-blue-200', requireReason: false },
  HALF_AM: {
    name: '일반 반차(오전)',
    color: 'bg-green-200',
    requireReason: false,
  },
  HALF_PM: {
    name: '일반 반차(오후)',
    color: 'bg-yellow-200',
    requireReason: false,
  },
  SPECIAL_ANNUAL: {
    name: '특별 연차',
    color: 'bg-pink-200',
    requireReason: true,
  },
  SPECIAL_HALF_AM: {
    name: '특별 반차(오전)',
    color: 'bg-purple-200',
    requireReason: true,
  },
  SPECIAL_HALF_PM: {
    name: '특별 반차(오후)',
    color: 'bg-orange-200',
    requireReason: true,
  },
  ALL: {
    name: '랩실 전체 휴가',
    color: 'bg-red-400 text-white',
    requireReason: false,
  },
};

const monthNames = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
] as const;

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'] as const;

/* =========================
 * Utils (date helpers)
 * ======================= */
export const toYmd = (d: Date | string | undefined | null): string => {
  if (!d) throw new Error('Invalid date passed to toYmd (null or undefined)');

  const date = typeof d === 'string' ? new Date(d) : d;

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('Invalid date passed to toYmd');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const toYmdLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromYmdLocal = (s?: string) => {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** 달력 6주(42칸) 생성: 주 시작은 일요일 */
function generateCalendarDays(base: Date): Date[] {
  const first = startOfMonth(base);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  const days: Date[] = [];
  const cursor = new Date(gridStart);

  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** 두 날짜(YYYY-MM-DD)의 구간을 순회하며 콜백 실행 */
function eachDateRange(
  startYmd: string,
  endYmd: string,
  cb: (d: Date) => void,
) {
  const start = new Date(startYmd);
  const end = new Date(endYmd);
  const cur = new Date(start);
  while (cur <= end) {
    cb(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
}

export function getCalendarDateRange(current: Date): {
  startDate: string;
  endDate: string;
} {
  const firstDayOfMonth = new Date(
    current.getFullYear(),
    current.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    current.getFullYear(),
    current.getMonth() + 1,
    0,
  );

  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDayOfMonth);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  return {
    startDate: toYmd(gridStart),
    endDate: toYmd(gridEnd),
  };
}

const getVacationSegmentKind = (
  vacation: LeaveDetail,
  targetDate: Date,
): 'start' | 'end' | 'single' | 'middle' => {
  const start = vacation.startDate ? new Date(vacation.startDate) : null;
  const end = vacation.endDate ? new Date(vacation.endDate) : start;

  if (
    !start ||
    !end ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    console.warn('잘못된 휴가 날짜:', vacation);
    return 'single';
  }

  const target = toYmd(targetDate);
  const sd = toYmd(start);
  const ed = toYmd(end);

  if (sd === ed && sd === target) return 'single';
  if (sd === target) return 'start';
  if (ed === target) return 'end';
  return 'middle';
};

const overlapsDate = (v: LeaveDetail, dayYmd: string) => {
  if (!v.startDate) return false;
  const start = toYmd(new Date(v.startDate));
  const end = v.endDate ? toYmd(new Date(v.endDate)) : start;
  return start <= dayYmd && dayYmd <= end;
};

const getLeaveKey = (v: LeaveDetail) =>
  String(v.leaveId ?? `${v.user?.userId ?? 'u'}-${v.startDate}-${v.type}`);

/* =========================
 * UI Pieces
 * ======================= */
function Legend() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-10">
        <div className="flex flex-wrap gap-4">
          {Object.entries(VACATION_TYPES).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${value.color}`} />
              <span className="text-sm text-xs text-gray-900">
                {value.name}
              </span>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground text-xs">
          * 휴가 신청 내역에 대해서는{' '}
          <Settings className="text-muted-foreground mb-0.5 inline h-3 w-3 font-bold" />{' '}
          <strong>&gt; 마이 페이지 &gt; 휴가 내역</strong> 에서 확인할 수
          있습니다.
        </div>
      </div>
    </div>
  );
}

function DayCell({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  holidayName,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  holidayName?: string;
}) {
  const dayNumber = date.getDate();
  const holidayTextClass = isCurrentMonth ? 'text-red-600' : 'text-red-300';

  if (isSelected) {
    return (
      <div className="flex items-center gap-1 rounded-full">
        <span className="bg-muted-foreground flex size-5 items-center justify-center rounded-full text-xs text-white">
          {dayNumber}
        </span>
        {holidayName && (
          <span className={`text-xs whitespace-nowrap ${holidayTextClass}`}>
            {holidayName}
          </span>
        )}
      </div>
    );
  }

  if (isToday) {
    return (
      <div className="flex items-center gap-1 rounded-full">
        <span className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
          {dayNumber}
        </span>
        {holidayName && (
          <span className={`text-xs whitespace-nowrap ${holidayTextClass}`}>
            {holidayName}
          </span>
        )}
      </div>
    );
  }

  const isHoliday = Boolean(holidayName);
  const dow = date.getDay();
  let colorClass = '';
  if (isHoliday || dow === 0) {
    colorClass = isCurrentMonth ? 'text-red-600' : 'text-red-300';
  } else if (dow === 6) {
    colorClass = isCurrentMonth ? 'text-blue-600' : 'text-blue-300';
  } else {
    colorClass = isCurrentMonth ? 'text-gray-900' : 'text-gray-400';
  }

  return (
    <div className="flex items-center gap-1 rounded-full">
      <span
        className={`flex size-5 items-center justify-center rounded-full text-xs ${colorClass}`}
      >
        {dayNumber}
      </span>
      {holidayName && (
        <span className={`text-xs whitespace-nowrap ${holidayTextClass}`}>
          {holidayName}
        </span>
      )}
    </div>
  );
}

/* =========================
 * Pills (SeminarCalendar와 동일한 "구간 표현" 구조)
 * ======================= */
type BasePillProps = {
  className?: string;
  color: string;
  name: string;
  label: string;
  title?: string;
  hideText?: boolean;
  ariaLabel?: string;
};

export function BasePill({
  className,
  color,
  name,
  label,
  title,
  hideText,
  ariaLabel,
}: BasePillProps) {
  return (
    <div
      className={cn(
        color,
        'relative z-10 h-6 truncate px-2 py-1 text-xs',
        hideText && 'flex items-center px-0',
        className,
      )}
      title={title}
      aria-label={hideText ? (ariaLabel ?? `${name} ${label}`) : undefined}
    >
      {hideText ? (
        <span className="sr-only">{ariaLabel ?? `${name} ${label}`}</span>
      ) : (
        <>
          <strong className="font-semibold">{name}</strong> {label}
        </>
      )}
    </div>
  );
}

export function SingleDayPill({
  meta,
  v,
}: {
  meta: VacationMeta;
  v: LeaveDetail;
}) {
  const name = v.user?.name ?? '';
  return (
    <BasePill
      color={meta.color}
      name={name}
      label={meta.name}
      className="mx-1 rounded"
      title={`${name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function StartPill({ meta, v }: { meta: VacationMeta; v: LeaveDetail }) {
  const name = v.user?.name ?? '';
  return (
    <BasePill
      color={meta.color}
      name={name}
      label={meta.name}
      className="-mr-px ml-1 rounded-l rounded-r-none"
      title={`${name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

/** 기본 middle: 텍스트 숨김(연결감 유지) */
export function MiddlePill({
  meta,
  v,
}: {
  meta: VacationMeta;
  v: LeaveDetail;
}) {
  const name = v.user?.name ?? '';
  const label = meta.name;

  return (
    <BasePill
      color={meta.color}
      name={name}
      label={label}
      hideText
      ariaLabel={`${name} ${label}`}
      className="-mx-px rounded-none"
      title={`${name} - ${label}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

/** 주 시작(일요일)에서 “이전 주부터 이어지는” 구간: 텍스트 다시 표시 */
export function ContinuedPill({
  meta,
  v,
}: {
  meta: VacationMeta;
  v: LeaveDetail;
}) {
  const name = v.user?.name ?? '';
  return (
    <BasePill
      color={meta.color}
      name={name}
      label={meta.name}
      className="-mx-px rounded-none"
      title={`${name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

/** 기본 end: 오른쪽 둥글게 + 텍스트 숨김 */
export function EndPill({ meta, v }: { meta: VacationMeta; v: LeaveDetail }) {
  const name = v.user?.name ?? '';
  return (
    <BasePill
      color={meta.color}
      name={name}
      label={meta.name}
      hideText
      ariaLabel={`${name} ${meta.name}`}
      className="mr-1 -ml-px rounded-l-none rounded-r px-0"
      title={`${name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

/** 주 시작 + end(마지막날)인 경우: 오른쪽 둥글게 + 텍스트 표시 */
export function ContinuedEndPill({
  meta,
  v,
}: {
  meta: VacationMeta;
  v: LeaveDetail;
}) {
  const name = v.user?.name ?? '';
  return (
    <BasePill
      color={meta.color}
      name={name}
      label={meta.name}
      className="-mx-px mr-1 rounded-l-none rounded-r"
      title={`${name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

/* =========================
 * Sidebar
 * ======================= */
function Sidebar({
  selectedDate,
  vacations,
  onClose,
  holidayName,
}: {
  selectedDate: Date | null;
  vacations: LeaveDetail[];
  onClose: () => void;
  holidayName?: string;
}) {
  const selectedDateText =
    selectedDate &&
    `${selectedDate.getFullYear()}년 ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}일 (${weekdayLabels[selectedDate.getDay()]})`;

  return (
    <div className="absolute right-0 h-full w-1/4 border-l bg-white py-4 pr-2 pl-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{selectedDateText}</h2>
          {holidayName && (
            <span className="text-sm whitespace-nowrap text-red-600">
              {holidayName}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">
          휴가 인원 ({vacations.length}명)
        </h3>

        {vacations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            해당 날짜에 휴가자가 없습니다.
          </p>
        ) : (
          vacations.map((v) => {
            const meta = VACATION_TYPES[v.type || LeaveDetailTypeEnum.Annual];
            return (
              <div
                key={getLeaveKey(v)}
                className="mr-6 ml-2 border-b pt-2 pb-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <div
                    className={`size-3 flex-shrink-0 rounded ${meta.color}`}
                  />

                  <div className="flex flex-col text-sm font-medium sm:flex-row sm:items-center sm:gap-2">
                    <div className="max-w-[160px] truncate whitespace-nowrap">
                      {v.user?.name}
                    </div>
                    <div className="text-muted-foreground text-xs break-words">
                      {v.user?.email}
                    </div>
                  </div>
                </div>
                <div className="text-muted-foreground mb-1 ml-6 text-xs">
                  {meta.name}
                </div>
                <div className="text-muted-foreground ml-6 text-xs">
                  {(() => {
                    if (!v.startDate) return '날짜 정보 없음';

                    const start = formatDateTimeVer2(v.startDate);
                    const end = v.endDate
                      ? formatDateTimeVer2(v.endDate)
                      : null;

                    if (!end || start === end) return start;
                    return `${start} ~ ${end}`;
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* =========================
 * Main Component
 * ======================= */
export default function LeavesCalendar() {
  const role = useAuthStore((s) => s.role);

  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [vacations, setVacations] = useState<LeaveDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [formData, setFormData] = useState<{
    type: '' | ApplyLeaveRequestTypeEnum;
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const days = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

  const fetchLeaves = useCallback(async () => {
    const { startDate, endDate } = getCalendarDateRange(currentDate);
    try {
      const sd = new Date(startDate);
      const ed = new Date(endDate);
      const res = await leaveApi.getLeaves({ startDate: sd, endDate: ed });
      setVacations(res.leaves ?? []);
    } catch (error) {
      console.error('휴가 조회 실패:', error);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const changeMonth = useCallback((direction: number) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate((prev) => {
      const same = prev && isSameDay(prev, date);
      if (same) {
        setIsSidebarOpen(false);
        return null;
      }
      setIsSidebarOpen(true);
      return date;
    });
  }, []);

  const isReasonRequired = useCallback(() => {
    if (!formData.type) return false;
    return !!VACATION_TYPES[formData.type as LeaveDetailTypeEnum]
      ?.requireReason;
  }, [formData.type]);

  const isHalfDayType = useCallback(() => {
    return (
      formData.type === ApplyLeaveRequestTypeEnum.HalfAm ||
      formData.type === ApplyLeaveRequestTypeEnum.HalfPm ||
      formData.type === ApplyLeaveRequestTypeEnum.SpecialHalfAm ||
      formData.type === ApplyLeaveRequestTypeEnum.SpecialHalfPm
    );
  }, [formData.type]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const { type, startDate, endDate, reason } = formData;

      if (!type || !startDate) {
        toast.error('필수 항목을 모두 입력해주세요.');
        return;
      }

      if (isReasonRequired() && !reason.trim()) {
        toast.error('특별 연차 및 반차는 사유를 필수로 입력해야 합니다.');
        return;
      }

      try {
        await leaveApi.applyLeave({
          applyLeaveRequest: {
            type,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            reason: reason.trim() || undefined,
          },
        });

        toast.success('휴가 신청이 성공적으로 완료되었습니다.');
        await fetchLeaves();
        setFormData({
          type: '',
          startDate: '',
          endDate: '',
          reason: '',
        });
        setIsModalOpen(false);
      } catch (error) {
        console.error('휴가 신청 실패:', error);
      }
    },
    [formData, isReasonRequired, fetchLeaves],
  );

  /* =========================
   * Holidays
   * ======================= */
  const [holidays, setHolidays] = useState<HolidayLite[]>([]);

  const holidaysMap = useMemo(() => {
    const map = new Map<string, HolidayLite>();
    holidays.forEach((h) => map.set(h.date, h));
    return map;
  }, [holidays]);

  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/holidays?y=${currentYear}&around=1`, {
          cache: 'force-cache',
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('GET /api/holidays failed:', res.status, text);
          if (!cancelled) setHolidays([]);
          return;
        }

        const data: HolidayLite[] = await res.json();
        if (!cancelled) setHolidays(data);
      } catch (e) {
        console.error('GET /api/holidays threw:', e);
        if (!cancelled) setHolidays([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentYear]);

  /* =========================
   * Sidebar data (YYYY-MM-DD -> LeaveDetail[])
   * ======================= */
  const vacationsByDateMap = useMemo(() => {
    const map = new Map<string, LeaveDetail[]>();

    vacations.forEach((v) => {
      if (!v.startDate) return;

      const start = new Date(v.startDate);
      const end = v.endDate ? new Date(v.endDate) : start;

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      const sd = toYmd(start);
      const ed = toYmd(end);

      eachDateRange(sd, ed, (d) => {
        const key = toYmd(d);
        const list = map.get(key);
        if (list) list.push(v);
        else map.set(key, [v]);
      });
    });

    return map;
  }, [vacations]);

  const selectedDateVacations = useMemo(() => {
    if (!selectedDate) return [];
    return vacationsByDateMap.get(toYmd(selectedDate)) ?? [];
  }, [selectedDate, vacationsByDateMap]);

  /* =========================
   *  SeminarCalendar와 동일: 주 단위 트랙(3줄) 고정 배치
   *    + ALL(랩실 전체 휴가) 항상 최상단(가능하면 0번 트랙)
   * ======================= */
  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days]);

  type WeekTracks = (LeaveDetail | null)[][]; // [track(0..2)][dayIdx(0..6)]

  const weekTracksList = useMemo(() => {
    return weeks.map((weekDays) => {
      const weekStart = toYmd(weekDays[0]);
      const weekEnd = toYmd(weekDays[6]);

      // 이 주와 겹치는 휴가만
      const weekVacations = vacations.filter((v) => {
        if (!v.startDate) return false;

        const vStart = toYmd(new Date(v.startDate));
        const vEnd = v.endDate ? toYmd(new Date(v.endDate)) : vStart;

        return !(vEnd < weekStart || vStart > weekEnd);
      });

      // 우선순위:
      // 1) ALL 최상단
      // 2) 주 시작 전에 이미 시작한 ongoing 먼저(끊김 방지)
      // 3) 시작일 빠른 순
      // 4) (동률) leaveId
      const prioritized = [...weekVacations].sort((a, b) => {
        const aIsAll = String(a.type) === 'ALL';
        const bIsAll = String(b.type) === 'ALL';
        if (aIsAll !== bIsAll) return aIsAll ? -1 : 1;

        const aStartYmd = a.startDate ? toYmd(new Date(a.startDate)) : '';
        const bStartYmd = b.startDate ? toYmd(new Date(b.startDate)) : '';

        const aOngoing = Boolean(aStartYmd && aStartYmd < weekStart);
        const bOngoing = Boolean(bStartYmd && bStartYmd < weekStart);
        if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

        const aStartTime = a.startDate
          ? new Date(a.startDate).getTime()
          : Number.POSITIVE_INFINITY;
        const bStartTime = b.startDate
          ? new Date(b.startDate).getTime()
          : Number.POSITIVE_INFINITY;

        if (aStartTime !== bStartTime) return aStartTime - bStartTime;

        return (a.leaveId ?? 0) - (b.leaveId ?? 0);
      });

      const tracks: WeekTracks = Array.from({ length: 3 }, () =>
        Array(7).fill(null),
      );

      prioritized.forEach((v) => {
        if (!v.startDate) return;

        const occupyIdx: number[] = [];

        weekDays.forEach((d, idx) => {
          if (overlapsDate(v, toYmd(d))) occupyIdx.push(idx);
        });

        if (!occupyIdx.length) return;

        const isAll = String(v.type) === 'ALL';

        // ALL은 무조건 0번 트랙부터 시도
        let trackIndex = -1;

        if (isAll) {
          const ok = occupyIdx.every((i) => tracks[0][i] === null);
          if (ok) trackIndex = 0;
        }

        if (trackIndex === -1) {
          trackIndex = tracks.findIndex((track) =>
            occupyIdx.every((i) => track[i] === null),
          );
        }

        if (trackIndex === -1) return;

        occupyIdx.forEach((i) => {
          tracks[trackIndex][i] = v;
        });
      });

      return tracks;
    });
  }, [weeks, vacations]);

  const getDisplayVacationsForCell = useCallback(
    (weekIdx: number, dayIdx: number) => {
      const tracks = weekTracksList[weekIdx] ?? [];
      return [0, 1, 2].map((t) => tracks[t]?.[dayIdx] ?? null);
    },
    [weekTracksList],
  );

  const getTotalVacationsCountForDay = useCallback(
    (day: Date) => vacationsByDateMap.get(toYmd(day))?.length ?? 0,
    [vacationsByDateMap],
  );

  return (
    <div className="mx-auto flex max-w-7xl bg-white">
      {/* 메인 캘린더 영역 */}
      <div
        className={cn(
          'relative px-10 transition-all duration-300',
          isSidebarOpen ? 'w-3/4' : 'w-full',
        )}
      >
        {/* 헤더 */}
        <div className="relative mt-10 mb-6 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h1 className="text-3xl font-bold">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h1>

            <Button variant="ghost" size="sm" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 휴가 신청 버튼 */}
          <div className="absolute right-0">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  휴가 신청
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>휴가 신청</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">
                      휴가 종류{' '}
                      <span className="text-destructive text-xs">*</span>
                    </Label>

                    <Select
                      value={formData.type}
                      onValueChange={(value) => {
                        const isHalf =
                          value === ApplyLeaveRequestTypeEnum.HalfAm ||
                          value === ApplyLeaveRequestTypeEnum.HalfPm ||
                          value === ApplyLeaveRequestTypeEnum.SpecialHalfAm ||
                          value === ApplyLeaveRequestTypeEnum.SpecialHalfPm;

                        setFormData((s) => ({
                          ...s,
                          type: value as ApplyLeaveRequestTypeEnum,
                          endDate: isHalf ? '' : s.endDate,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="휴가 종류를 선택하세요" />
                      </SelectTrigger>

                      <SelectContent>
                        {Object.entries(VACATION_TYPES)
                          .filter(([key]) =>
                            key === 'ALL' ? role === 'ADMIN' : true,
                          )
                          .map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-3 w-3 rounded ${value.color}`}
                                />
                                {value.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 시작일 */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        시작일
                        <span className="text-destructive text-xs">*</span>
                      </Label>

                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            id="startDate"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                !formData.startDate && 'text-muted-foreground',
                              )}
                            />
                            <span
                              className={cn(
                                !formData.startDate && 'text-muted-foreground',
                              )}
                            >
                              {formData.startDate
                                ? format(
                                    fromYmdLocal(formData.startDate)!,
                                    'PPP',
                                    { locale: ko },
                                  )
                                : '날짜 선택'}
                            </span>
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromYmdLocal(formData.startDate)}
                            onSelect={(date) => {
                              if (!date) return;
                              setFormData((s) => ({
                                ...s,
                                startDate: toYmdLocal(date),
                              }));
                            }}
                            initialFocus
                            locale={ko}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* 종료일 */}
                    <div className="space-y-2">
                      <Label htmlFor="endDate">종료일</Label>

                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={isHalfDayType()}
                          >
                            <CalendarIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                !formData.endDate && 'text-muted-foreground',
                              )}
                            />
                            <span
                              className={cn(
                                !formData.endDate && 'text-muted-foreground',
                              )}
                            >
                              {formData.endDate
                                ? format(
                                    fromYmdLocal(formData.endDate)!,
                                    'PPP',
                                    { locale: ko },
                                  )
                                : '날짜 선택'}
                            </span>
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromYmdLocal(formData.endDate)}
                            onSelect={(date) => {
                              if (!date) return;
                              setFormData((s) => ({
                                ...s,
                                endDate: toYmdLocal(date),
                              }));
                            }}
                            initialFocus
                            locale={ko}
                            disabled={
                              formData.startDate
                                ? { before: fromYmdLocal(formData.startDate)! }
                                : undefined
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {isReasonRequired() && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">
                        사유 <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData((s) => ({ ...s, reason: e.target.value }))
                        }
                        placeholder="휴가 사유를 입력해주세요"
                        rows={3}
                        required
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit">신청</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 범례 */}
        <Legend />

        {/* 캘린더 */}
        <div className="mb-10 overflow-hidden rounded-lg border">
          {/* 요일 헤더 */}
          <div className="bg-muted grid grid-cols-7">
            {weekdayLabels.map((wd) => (
              <div
                key={wd}
                className="text-muted-foreground border-r p-2 text-center text-sm font-semibold last:border-r-0"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid auto-rows-[145px] grid-cols-7">
            {days.map((day, idx) => {
              const weekIdx = Math.floor(idx / 7);
              const dayIdx = idx % 7;

              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isTodayFlag = isSameDay(day, today);
              const isSelectedFlag = selectedDate
                ? isSameDay(day, selectedDate)
                : false;

              const holiday = holidaysMap.get(toYmd(day));
              const holidayName = holiday?.name;

              const weekStartYmd = toYmd(days[weekIdx * 7]);
              const isWeekStart = dayIdx === 0;

              const trackCells = getDisplayVacationsForCell(weekIdx, dayIdx);

              const totalCount = getTotalVacationsCountForDay(day);
              const displayedUnique = new Set(
                trackCells
                  .filter(Boolean)
                  .map((v) => getLeaveKey(v as LeaveDetail)),
              ).size;
              const hiddenCount = Math.max(0, totalCount - displayedUnique);

              return (
                <button
                  key={toYmdLocal(day)}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'hover:bg-muted/30 relative flex h-full w-full cursor-pointer flex-col justify-start border-r border-b pt-7 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0',
                    isCurrentMonth ? 'bg-white' : 'bg-muted/30',
                  )}
                  aria-pressed={isSelectedFlag}
                  aria-current={isTodayFlag ? 'date' : undefined}
                >
                  {/* 좌상단 날짜 */}
                  <div className="absolute top-1 left-1">
                    <DayCell
                      date={day}
                      isCurrentMonth={isCurrentMonth}
                      isSelected={isSelectedFlag}
                      isToday={isTodayFlag && !isSelectedFlag}
                      holidayName={holidayName}
                    />
                  </div>

                  {/* 휴가 pills (트랙 3줄 고정) */}
                  <div className="flex flex-col justify-start gap-1">
                    {trackCells.map((v, tIdx) => {
                      if (!v)
                        // eslint-disable-next-line react/no-array-index-key
                        return <div key={`empty-${tIdx}`} className="h-6" />;

                      const meta =
                        VACATION_TYPES[v.type || LeaveDetailTypeEnum.Annual];
                      const kind = getVacationSegmentKind(v, day);

                      const vStartYmd = v.startDate
                        ? toYmd(new Date(v.startDate))
                        : '';
                      const shouldRepeatTitleAtWeekStart =
                        isWeekStart &&
                        Boolean(vStartYmd && vStartYmd < weekStartYmd) &&
                        overlapsDate(v, toYmd(day));

                      if (kind === 'single') {
                        return (
                          <SingleDayPill
                            key={`${getLeaveKey(v)}-${toYmd(day)}`}
                            meta={meta}
                            v={v}
                          />
                        );
                      }

                      if (kind === 'start') {
                        return (
                          <StartPill
                            key={`${getLeaveKey(v)}-${toYmd(day)}`}
                            meta={meta}
                            v={v}
                          />
                        );
                      }

                      if (shouldRepeatTitleAtWeekStart) {
                        if (kind === 'end') {
                          return (
                            <ContinuedEndPill
                              key={`${getLeaveKey(v)}-${toYmd(day)}`}
                              meta={meta}
                              v={v}
                            />
                          );
                        }

                        return (
                          <ContinuedPill
                            key={`${getLeaveKey(v)}-${toYmd(day)}`}
                            meta={meta}
                            v={v}
                          />
                        );
                      }

                      if (kind === 'end') {
                        return (
                          <EndPill
                            key={`${getLeaveKey(v)}-${toYmd(day)}`}
                            meta={meta}
                            v={v}
                          />
                        );
                      }

                      return (
                        <MiddlePill
                          key={`${getLeaveKey(v)}-${toYmd(day)}`}
                          meta={meta}
                          v={v}
                        />
                      );
                    })}

                    {hiddenCount > 0 && (
                      <div className="bg-border/70 text-muted-foreground mx-1 rounded px-2 py-1 text-center text-xs">
                        + {hiddenCount}명
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 우측 사이드바 */}
      {isSidebarOpen && (
        <Sidebar
          selectedDate={selectedDate}
          vacations={selectedDateVacations}
          onClose={() => setIsSidebarOpen(false)}
          holidayName={
            selectedDate
              ? holidaysMap.get(toYmd(selectedDate))?.name
              : undefined
          }
        />
      )}
    </div>
  );
}
