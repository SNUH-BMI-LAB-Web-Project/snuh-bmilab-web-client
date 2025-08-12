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

/* =========================
 * Types
 * ======================= */
function Legend() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-10">
        {/* 왼쪽: 색상 범례 */}
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

        {/* 오른쪽: 툴팁 아이콘 */}
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
    // 선택일: 숫자는 선택 스타일 유지, 공휴일 이름만 월 여부에 따라 빨강 농도
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
    // 오늘: 숫자는 오늘 스타일 유지, 공휴일 이름만 월 여부에 따라 빨강 농도
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

  // 숫자 색상 계산 (공휴일 또는 일요일 빨강, 토요일 파랑, 평일 회색)
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
        'relative z-10 truncate px-2 py-1 text-xs',
        hideText && 'flex h-6 items-center px-0',
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
  return (
    <BasePill
      color={meta.color}
      name={v.user!.name!}
      label={meta.name}
      className="mx-1 rounded"
      title={`${v.user!.name!} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function StartPill({ meta, v }: { meta: VacationMeta; v: LeaveDetail }) {
  return (
    <BasePill
      color={meta.color}
      name={v.user!.name!}
      label={meta.name}
      className="-mr-px ml-1 rounded-l rounded-r-none"
      title={`${v.user!.name!} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function MiddlePill({
  meta,
  v,
}: {
  meta: VacationMeta;
  v: LeaveDetail;
}) {
  return (
    <BasePill
      color={meta.color}
      name={v.user!.name!}
      label={meta.name}
      hideText
      ariaLabel={`${v.user!.name!} ${meta.name}`}
      className="-mx-px rounded-none px-0"
      title={`${v.user!.name!} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function EndPill({ meta, v }: { meta: VacationMeta; v: LeaveDetail }) {
  return (
    <BasePill
      color={meta.color}
      name={v.user!.name!}
      label={meta.name}
      hideText
      ariaLabel={`${v.user!.name!} ${meta.name}`}
      className="mr-1 -ml-px rounded-l-none rounded-r px-0"
      title={`${v.user!.name!} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

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
              <div key={v.leaveId} className="mr-6 ml-2 border-b pt-2 pb-4">
                <div className="mb-1 flex items-center gap-2">
                  <div
                    className={`size-3 flex-shrink-0 rounded ${meta.color}`}
                  />

                  <div className="flex flex-col text-sm font-medium sm:flex-row sm:items-center sm:gap-2">
                    {/* 이름: truncate 적용 */}
                    <div className="max-w-[160px] truncate whitespace-nowrap">
                      {v.user!.name}
                    </div>

                    {/* 이메일: 줄바꿈 허용 + 항상 보이도록 별도 block으로 분리 */}
                    <div className="text-muted-foreground text-xs break-words">
                      {v.user!.email}
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

                    if (!end || start === end) {
                      return start;
                    }

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
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [vacations, setVacations] = useState<LeaveDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const today = useMemo(() => new Date(), []);

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

  /** 휴가를 날짜별로 빠르게 조회하기 위한 맵 (YYYY-MM-DD → Vacation[]) */
  const vacationsByDateMap = useMemo(() => {
    const map = new Map<string, LeaveDetail[]>();

    vacations.forEach((v) => {
      const start = v.startDate ? new Date(v.startDate) : null;
      const end = v.endDate ? new Date(v.endDate) : start;

      if (
        !start ||
        !end ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return;
      }

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
    return VACATION_TYPES[formData.type].requireReason;
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

  const isHalfDayType = useCallback(() => {
    return (
      formData.type === ApplyLeaveRequestTypeEnum.HalfAm ||
      formData.type === ApplyLeaveRequestTypeEnum.HalfPm ||
      formData.type === ApplyLeaveRequestTypeEnum.SpecialHalfAm ||
      formData.type === ApplyLeaveRequestTypeEnum.SpecialHalfPm
    );
  }, [formData.type]);

  type HolidayLite = { date: string; name: string };

  const [holidays, setHolidays] = useState<HolidayLite[]>([]);

  const holidaysMap = useMemo(() => {
    const map = new Map<string, HolidayLite>();
    holidays.forEach((h) => map.set(h.date, h));
    return map;
  }, [holidays]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const y = currentDate.getFullYear();
      const res = await fetch(`/api/holidays?y=${y}&around=1`, {
        cache: 'force-cache',
      });
      const data: HolidayLite[] = await res.json();
      if (!cancelled) setHolidays(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentDate]);

  return (
    <div className="mx-auto flex max-w-7xl bg-white">
      {/* 메인 캘린더 영역 */}
      <div
        className={`relative px-10 transition-all duration-300 ${isSidebarOpen ? 'w-3/4' : 'w-full'}`}
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
                      <Popover>
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

                      <Popover>
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
            {days.map((day) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isTodayFlag = isSameDay(day, today);
              const isSelectedFlag = selectedDate
                ? isSameDay(day, selectedDate)
                : false;

              const dayVacationsRaw = vacationsByDateMap.get(toYmd(day)) ?? [];
              const sortedDayVacations = [...dayVacationsRaw].sort((a, b) => {
                const aIsAll = String(a.type) === 'ALL';
                const bIsAll = String(b.type) === 'ALL';
                if (aIsAll !== bIsAll) return aIsAll ? -1 : 1;

                const kindA = getVacationSegmentKind(a, day);
                const kindB = getVacationSegmentKind(b, day);
                const kindOrder = {
                  start: 0,
                  middle: 1,
                  end: 2,
                  single: 3,
                } as const;
                const orderA = kindOrder[kindA] ?? 99;
                const orderB = kindOrder[kindB] ?? 99;
                if (orderA !== orderB) return orderA - orderB;

                return (a.leaveId ?? 0) - (b.leaveId ?? 0);
              });

              const displayVacations = sortedDayVacations.slice(0, 3);
              const hasMore = sortedDayVacations.length > 3;

              const holiday = holidaysMap.get(toYmd(day));
              const holidayName = holiday?.name;

              return (
                <button
                  key={toYmdLocal(day)}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`hover:bg-muted/30 relative flex h-full w-full cursor-pointer flex-col justify-start border-r border-b pt-7 text-left ${isCurrentMonth ? 'bg-white' : 'bg-muted/30'} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0`}
                  aria-pressed={isSelectedFlag}
                  aria-current={isTodayFlag ? 'date' : undefined}
                >
                  {/* 항상 좌상단 날짜 */}
                  <div className="absolute top-1 left-1">
                    <DayCell
                      date={day}
                      isCurrentMonth={isCurrentMonth}
                      isSelected={isSelectedFlag}
                      isToday={isTodayFlag && !isSelectedFlag}
                      holidayName={holidayName}
                    />
                  </div>

                  {/* 휴가 리스트: 위부터 쌓임 */}
                  <div className="flex flex-col justify-start gap-1">
                    {displayVacations.map((v) => {
                      const meta = VACATION_TYPES[v.type!];
                      const kind = getVacationSegmentKind(v, day);
                      if (!kind) return null;

                      switch (kind) {
                        case 'single':
                          return (
                            <SingleDayPill key={v.leaveId} meta={meta} v={v} />
                          );
                        case 'start':
                          return (
                            <StartPill key={v.leaveId} meta={meta} v={v} />
                          );
                        case 'end':
                          return <EndPill key={v.leaveId} meta={meta} v={v} />;
                        default:
                          return (
                            <MiddlePill key={v.leaveId} meta={meta} v={v} />
                          );
                      }
                    })}
                    {hasMore && (
                      <div className="bg-border/70 text-muted-foreground mx-1 rounded px-2 py-1 text-center text-xs">
                        + {sortedDayVacations.length - 3}명
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
