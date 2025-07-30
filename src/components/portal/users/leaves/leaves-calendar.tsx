'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
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
import { cn } from '@/lib/utils';

/* =========================
 * Types
 * ======================= */
type VacationTypeKey =
  | 'ANNUAL'
  | 'HALF_AM'
  | 'HALF_PM'
  | 'SPECIAL_HALF_AM'
  | 'SPECIAL_HALF_PM'
  | 'SPECIAL_ANNUAL';

type Vacation = {
  id: number;
  name: string;
  type: VacationTypeKey;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
};

type VacationMeta = {
  name: string;
  color: string; // tailwind class
  requireReason: boolean;
};

/* =========================
 * Constants
 * ======================= */
const VACATION_TYPES: Record<VacationTypeKey, VacationMeta> = {
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

/* 샘플 데이터 */
const sampleVacations: Vacation[] = [
  {
    id: 1,
    name: '김철수',
    type: 'ANNUAL',
    startDate: '2025-07-02',
    endDate: '2025-07-03',
    reason: '개인 사정',
  },
  {
    id: 2,
    name: '이영희',
    type: 'HALF_AM',
    startDate: '2025-07-02',
    endDate: '2025-07-02',
    reason: '병원 진료',
  },
  {
    id: 3,
    name: '박민수',
    type: 'HALF_AM',
    startDate: '2025-07-02',
    endDate: '2025-07-02',
    reason: '병원 진료',
  },
  {
    id: 4,
    name: '정수진',
    type: 'SPECIAL_ANNUAL',
    startDate: '2025-07-02',
    endDate: '2025-07-02',
    reason: '가족 행사',
  },
  {
    id: 5,
    name: '최동현',
    type: 'HALF_PM',
    startDate: '2025-07-02',
    endDate: '2025-07-02',
    reason: '개인 업무',
  },
  {
    id: 6,
    name: '홍길동',
    type: 'ANNUAL',
    startDate: '2025-07-15',
    endDate: '2025-07-17',
    reason: '여행',
  },
  {
    id: 7,
    name: '김영수',
    type: 'SPECIAL_HALF_AM',
    startDate: '2025-07-20',
    endDate: '2025-07-20',
    reason: '개인 사정',
  },
];

/* =========================
 * Utils (date helpers)
 * ======================= */
const toYmd = (d: Date) => d.toISOString().split('T')[0];

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** 달력 6주(42칸) 생성: 주 시작은 일요일 */
function generateCalendarDays(base: Date): Date[] {
  const first = startOfMonth(base);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay()); // Sunday

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  // 6주 = 42칸
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

type SegmentKind = 'single' | 'start' | 'middle' | 'end';

function getVacationSegmentKind(v: Vacation, date: Date): SegmentKind | null {
  const ymd = toYmd(date);
  if (ymd < v.startDate || ymd > v.endDate) return null;

  if (v.startDate === v.endDate) return 'single';
  if (ymd === v.startDate) return 'start';
  if (ymd === v.endDate) return 'end';
  return 'middle';
}

/* =========================
 * Types
 * ======================= */
function Legend() {
  return (
    <div className="mb-6 flex flex-wrap gap-4 p-4">
      {Object.entries(VACATION_TYPES).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded ${value.color}`} />
          <span className="text-sm text-gray-900">{value.name}</span>
        </div>
      ))}
    </div>
  );
}

function DayCell({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}) {
  // 중첩 3항 없이 명시적 분기
  if (isSelected) {
    return (
      <div className="bg-muted-foreground flex size-5 items-center justify-center rounded-full">
        <span className="text-xs text-white">{date.getDate()}</span>
      </div>
    );
  }

  if (isToday) {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-blue-500">
        <span className="text-xs text-white">{date.getDate()}</span>
      </div>
    );
  }

  // 기본 표시: 요일에 따라 색상 지정 (일: 빨강, 토: 파랑, 평일: 기존 회색/검정)
  const dow = date.getDay(); // 0=일, 6=토
  let colorClass = '';
  if (dow === 0) {
    colorClass = isCurrentMonth ? 'text-red-600' : 'text-red-300';
  } else if (dow === 6) {
    colorClass = isCurrentMonth ? 'text-blue-600' : 'text-blue-300';
  } else {
    colorClass = isCurrentMonth ? 'text-gray-900' : 'text-gray-400';
  }

  return (
    <span
      className={`flex size-5 items-center justify-center rounded-full text-xs ${colorClass}`}
    >
      {date.getDate()}
    </span>
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
        'relative z-10 truncate px-2 py-1 text-xs text-gray-800',
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
  v: Vacation;
}) {
  return (
    <BasePill
      color={meta.color}
      name={v.name}
      label={meta.name}
      className="mx-1 rounded"
      title={`${v.name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function StartPill({ meta, v }: { meta: VacationMeta; v: Vacation }) {
  return (
    <BasePill
      color={meta.color}
      name={v.name}
      label={meta.name}
      className="-mr-px ml-1 rounded-l rounded-r-none"
      title={`${v.name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function MiddlePill({ meta, v }: { meta: VacationMeta; v: Vacation }) {
  return (
    <BasePill
      color={meta.color}
      name={v.name}
      label={meta.name}
      hideText
      ariaLabel={`${v.name} ${meta.name}`}
      className="-mx-px rounded-none px-0"
      title={`${v.name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

export function EndPill({ meta, v }: { meta: VacationMeta; v: Vacation }) {
  return (
    <BasePill
      color={meta.color}
      name={v.name}
      label={meta.name}
      hideText
      ariaLabel={`${v.name} ${meta.name}`}
      className="mr-1 -ml-px rounded-l-none rounded-r px-0"
      title={`${v.name} - ${meta.name}${v.reason ? ` (${v.reason})` : ''}`}
    />
  );
}

function Sidebar({
  selectedDate,
  vacations,
  onClose,
}: {
  selectedDate: Date | null;
  vacations: Vacation[];
  onClose: () => void;
}) {
  const selectedDateText =
    selectedDate &&
    `${selectedDate.getFullYear()}년 ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}일`;

  return (
    <div className="absolute right-0 h-full w-1/4 border-l bg-white py-4 pr-2 pl-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{selectedDateText}</h2>
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
            const meta = VACATION_TYPES[v.type];
            return (
              <div key={v.id} className="mr-6 ml-2 border-b pt-2 pb-4">
                <div className="mb-1 flex items-center gap-2">
                  <div className={`size-3 rounded ${meta.color}`} />
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {v.name}{' '}
                    <span className="text-muted-foreground text-xs">
                      example123@example.com
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground mb-1 ml-6 text-xs">
                  {meta.name}
                </div>
                <div className="text-muted-foreground ml-6 text-xs">
                  {v.startDate === v.endDate
                    ? v.startDate
                    : `${v.startDate} ~ ${v.endDate}`}
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
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [vacations, setVacations] = useState<Vacation[]>(sampleVacations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    type: '' | VacationTypeKey;
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

  /** 휴가를 날짜별로 빠르게 조회하기 위한 맵 (YYYY-MM-DD → Vacation[]) */
  const vacationsByDateMap = useMemo(() => {
    const map = new Map<string, Vacation[]>();
    vacations.forEach((v) => {
      eachDateRange(v.startDate, v.endDate, (d) => {
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
    (e: React.FormEvent) => {
      e.preventDefault();
      const { name, type, startDate, endDate, reason } = formData;
      if (!name || !type || !startDate || !endDate) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }
      if (isReasonRequired() && !reason.trim()) {
        alert('해당 휴가 종류는 사유를 입력해야 합니다.');
        return;
      }

      const newVacation: Vacation = {
        id: Date.now(),
        name,
        type,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      };

      setVacations((prev) => [...prev, newVacation]);
      setFormData({
        name: '',
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setIsModalOpen(false);
    },
    [formData, isReasonRequired],
  );

  return (
    <div className="mx-auto flex max-w-7xl bg-white">
      {/* 메인 캘린더 영역 */}
      <div
        className={`relative transition-all duration-300 ${isSidebarOpen ? 'w-3/4' : 'w-full'}`}
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
                      onValueChange={(value) =>
                        setFormData((s) => ({
                          ...s,
                          type: value as VacationTypeKey,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="휴가 종류를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VACATION_TYPES).map(([key, value]) => (
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
                      <Label htmlFor="endDate">
                        종료일 <span className="text-xs text-white">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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

              const dayVacations = vacationsByDateMap.get(toYmd(day)) ?? [];
              const displayVacations = dayVacations.slice(0, 3);
              const hasMore = dayVacations.length > 3;

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
                    />
                  </div>

                  {/* 휴가 리스트: 위부터 쌓임 */}
                  <div className="flex flex-col justify-start gap-1">
                    {[...displayVacations] // 기존 displayVacations 그대로 사용
                      .sort((a, b) => a.id - b.id)
                      .map((v) => {
                        const meta = VACATION_TYPES[v.type];
                        const kind = getVacationSegmentKind(v, day);
                        if (!kind) return null;

                        if (kind === 'single') {
                          return <SingleDayPill key={v.id} meta={meta} v={v} />;
                        }
                        if (kind === 'start') {
                          return <StartPill key={v.id} meta={meta} v={v} />;
                        }
                        if (kind === 'end') {
                          return <EndPill key={v.id} meta={meta} v={v} />;
                        }
                        return <MiddlePill key={v.id} meta={meta} v={v} />;
                      })}
                    {hasMore && (
                      <div className="bg-border/70 text-muted-foreground mx-1 rounded px-2 py-1 text-center text-xs">
                        + {dayVacations.length - 3}명
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
        />
      )}
    </div>
  );
}
