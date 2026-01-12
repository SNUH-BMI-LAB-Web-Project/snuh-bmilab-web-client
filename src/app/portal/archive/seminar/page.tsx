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
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* =========================
 * Types
 * ======================= */
type EventType = 'SEMINAR' | 'CONFERENCE';

type SeminarEvent = {
  id: number;
  title: string;
  type: EventType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional)
  description?: string;
};

/* =========================
 * Constants
 * ======================= */
type TypeMeta = { name: string; color: string };

const EVENT_TYPES: Record<EventType, TypeMeta> = {
  SEMINAR: { name: '세미나', color: 'bg-blue-200' },
  CONFERENCE: { name: '학회', color: 'bg-pink-200' },
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
const toYmd = (d: Date | string): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

const getSegmentKind = (
  ev: SeminarEvent,
  targetDate: Date,
): 'start' | 'end' | 'single' | 'middle' => {
  const start = new Date(ev.startDate);
  const end = ev.endDate ? new Date(ev.endDate) : new Date(ev.startDate);

  const target = toYmd(targetDate);
  const sd = toYmd(start);
  const ed = toYmd(end);

  if (sd === ed && sd === target) return 'single';
  if (sd === target) return 'start';
  if (ed === target) return 'end';
  return 'middle';
};

/* =========================
 * UI Pieces
 * ======================= */
function Legend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      {Object.entries(EVENT_TYPES).map(([key, meta]) => (
        <div key={key} className="flex items-center gap-2">
          <div className={cn('h-4 w-4 rounded', meta.color)} />
          <span className="text-xs text-gray-900">{meta.name}</span>
        </div>
      ))}
    </div>
  );
}

function BasePill({
  color,
  title,
  className,
  children,
}: {
  color: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        color,
        'relative z-10 truncate px-2 py-1 text-xs',
        className,
      )}
      title={title}
    >
      {children}
    </div>
  );
}

function SingleDayPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  return (
    <BasePill
      color={meta.color}
      className="mx-1 rounded"
      title={`${meta.name} · ${ev.title}${ev.description ? ` (${ev.description})` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
    </BasePill>
  );
}
function StartPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  return (
    <BasePill
      color={meta.color}
      className="-mr-px ml-1 rounded-l rounded-r-none"
      title={`${meta.name} · ${ev.title}${ev.description ? ` (${ev.description})` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
    </BasePill>
  );
}
function MiddlePill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  return (
    <BasePill
      color={meta.color}
      className="-mx-px rounded-none px-0"
      title={`${meta.name} · ${ev.title}${ev.description ? ` (${ev.description})` : ''}`}
    >
      <span className="sr-only">
        {meta.name} {ev.title}
      </span>
    </BasePill>
  );
}
function EndPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  return (
    <BasePill
      color={meta.color}
      className="mr-1 -ml-px rounded-l-none rounded-r px-0"
      title={`${meta.name} · ${ev.title}${ev.description ? ` (${ev.description})` : ''}`}
    >
      <span className="sr-only">
        {meta.name} {ev.title}
      </span>
    </BasePill>
  );
}

function Sidebar({
  selectedDate,
  events,
  onClose,
}: {
  selectedDate: Date | null;
  events: SeminarEvent[];
  onClose: () => void;
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
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">
          일정 ({events.length}개)
        </h3>

        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            해당 날짜에 일정이 없습니다.
          </p>
        ) : (
          events.map((ev) => {
            const meta = EVENT_TYPES[ev.type];
            const rangeText =
              ev.endDate && ev.endDate !== ev.startDate
                ? `${ev.startDate} ~ ${ev.endDate}`
                : ev.startDate;

            return (
              <div key={ev.id} className="mr-6 ml-2 border-b pt-2 pb-4">
                <div className="mb-1 flex items-center gap-2">
                  <div
                    className={cn('size-3 flex-shrink-0 rounded', meta.color)}
                  />
                  <div className="text-sm font-medium">{ev.title}</div>
                </div>
                <div className="text-muted-foreground ml-6 text-xs">
                  {meta.name}
                </div>
                <div className="text-muted-foreground ml-6 text-xs">
                  {rangeText}
                </div>
                {ev.description && (
                  <div className="text-muted-foreground mt-2 ml-6 text-xs whitespace-pre-wrap">
                    {ev.description}
                  </div>
                )}
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
export default function SeminarCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // ✅ 더미 데이터
  const dummyEvents: SeminarEvent[] = useMemo(
    () => [
      {
        id: 1,
        type: 'CONFERENCE',
        title: 'ㅇㅇㅇ학회 춘계학술대회',
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        description: '포스터 발표 준비 / 세션 A 참석',
      },
      {
        id: 2,
        type: 'SEMINAR',
        title: 'Lab Seminar: WSI Annotation Tool',
        startDate: '2026-01-22',
        description: 'OpenSeadragon 좌표계/ROI 변환 공유',
      },
      {
        id: 3,
        type: 'CONFERENCE',
        title: '바이오인포매틱스 학회',
        startDate: '2026-02-05',
        endDate: '2026-02-07',
      },
    ],
    [],
  );

  const [events, setEvents] = useState<SeminarEvent[]>(dummyEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    type: '' | EventType;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
  }>({
    type: '',
    title: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  // ✅ 검색
  const [searchQuery, setSearchQuery] = useState('');
  const searchedEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return events
      .filter((ev) => {
        const meta = EVENT_TYPES[ev.type].name;
        return (
          ev.title.toLowerCase().includes(q) ||
          meta.toLowerCase().includes(q) ||
          (ev.description ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, searchQuery]);

  const days = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

  /** 이벤트를 날짜별로 조회하기 위한 맵 */
  const eventsByDateMap = useMemo(() => {
    const map = new Map<string, SeminarEvent[]>();

    events.forEach((ev) => {
      const sd = ev.startDate;
      const ed = ev.endDate ?? ev.startDate;

      eachDateRange(sd, ed, (d) => {
        const key = toYmd(d);
        const list = map.get(key);
        if (list) list.push(ev);
        else map.set(key, [ev]);
      });
    });

    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDateMap.get(toYmd(selectedDate)) ?? [];
  }, [selectedDate, eventsByDateMap]);

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

  const isAllRequiredValid = useMemo(() => {
    const { type, title, startDate } = formData;
    if (!type) return false;
    if (!title.trim()) return false;
    if (!startDate) return false;
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isAllRequiredValid) {
        toast.error('필수 항목을 모두 입력해주세요.');
        return;
      }

      // ✅ 승인 없이 즉시 추가
      setEvents((prev) => {
        const nextId = (prev.at(-1)?.id ?? 0) + 1;
        const end = formData.endDate || undefined;

        return [
          ...prev,
          {
            id: nextId,
            type: formData.type as EventType,
            title: formData.title.trim(),
            startDate: formData.startDate,
            endDate: end,
            description: formData.description.trim() || undefined,
          },
        ];
      });

      toast.success('일정이 캘린더에 추가되었습니다.');
      setFormData({
        type: '',
        title: '',
        startDate: '',
        endDate: '',
        description: '',
      });
      setIsModalOpen(false);
    },
    [formData, isAllRequiredValid],
  );

  // (선택) 현재 월로 넘어갈 때, 더미데이터가 갱신되는 느낌만 주고 싶으면 useEffect로 뭔가 할 수 있지만
  // 지금은 "API 없음" 조건이라 특별히 fetch 없음.

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
        <div className="relative mt-10 mb-4 flex items-center justify-center">
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

          {/* 일정 추가 버튼 */}
          <div className="absolute right-0">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  일정 추가
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>세미나/학회 일정 추가</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 타입 */}
                  <div className="space-y-2">
                    <Label htmlFor="type">
                      라벨 <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((s) => ({ ...s, type: value as EventType }))
                      }
                    >
                      <SelectTrigger className="w-full" id="type">
                        <SelectValue placeholder="세미나/학회를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEMINAR">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-3 w-3 rounded',
                                EVENT_TYPES.SEMINAR.color,
                              )}
                            />
                            세미나
                          </div>
                        </SelectItem>
                        <SelectItem value="CONFERENCE">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-3 w-3 rounded',
                                EVENT_TYPES.CONFERENCE.color,
                              )}
                            />
                            학회
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 제목 */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      제목 <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((s) => ({ ...s, title: e.target.value }))
                      }
                      placeholder="예) ㅇㅇㅇ학회 춘계학술대회"
                      required
                    />
                  </div>

                  {/* 날짜 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 시작일 */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        시작일{' '}
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
                                // startDate가 바뀌면 endDate가 startDate보다 앞일 수 있으니 정리
                                endDate:
                                  s.endDate &&
                                  fromYmdLocal(s.endDate) &&
                                  date > fromYmdLocal(s.endDate)!
                                    ? ''
                                    : s.endDate,
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
                      <Label htmlFor="endDate">종료일 (선택)</Label>

                      <Popover modal>
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

                  {/* 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor="description">메모 (선택)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((s) => ({
                          ...s,
                          description: e.target.value,
                        }))
                      }
                      placeholder="발표/참석/준비 메모 등"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={!isAllRequiredValid}>
                      추가
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 범례 */}
        <Legend />

        {/* 검색 */}
        <div className="mb-6">
          <Label htmlFor="search" className="mb-2 block">
            검색
          </Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="예) ㅇㅇㅇ학회, 세미나, 키워드..."
          />

          {searchQuery.trim() && (
            <div className="mt-3 rounded border p-3">
              <div className="text-muted-foreground mb-2 text-xs">
                검색 결과 {searchedEvents.length}개
              </div>

              {searchedEvents.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  일치하는 일정이 없습니다.
                </div>
              ) : (
                <div className="space-y-2">
                  {searchedEvents.map((ev) => {
                    const meta = EVENT_TYPES[ev.type];
                    const range =
                      ev.endDate && ev.endDate !== ev.startDate
                        ? `${ev.startDate} ~ ${ev.endDate}`
                        : ev.startDate;

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        className="hover:bg-muted/40 flex w-full items-start justify-between gap-3 rounded p-2 text-left"
                        onClick={() => {
                          // 검색 결과 클릭하면 해당 날짜로 사이드바 열어줌
                          const d = fromYmdLocal(ev.startDate);
                          if (d) {
                            setSelectedDate(d);
                            setIsSidebarOpen(true);
                          }
                        }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn('h-3 w-3 rounded', meta.color)}
                            />
                            <div className="truncate text-sm font-medium">
                              {ev.title}
                            </div>
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {meta.name} · {range}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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

              const dayEventsRaw = eventsByDateMap.get(toYmd(day)) ?? [];

              // (원하면 여기서 타입 우선순위 정렬 가능: 학회 먼저 등)
              const sorted = [...dayEventsRaw].sort((a, b) => {
                // CONFERENCE를 위로
                if (a.type !== b.type) return a.type === 'CONFERENCE' ? -1 : 1;
                return a.startDate.localeCompare(b.startDate);
              });

              const display = sorted.slice(0, 3);
              const hasMore = sorted.length > 3;

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
                  {/* 날짜 */}
                  <div className="absolute top-1 left-1">
                    <div className="flex items-center gap-1 rounded-full">
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-full text-xs',
                          isSelectedFlag
                            ? 'bg-muted-foreground text-white'
                            : isTodayFlag
                              ? 'bg-blue-500 text-white'
                              : isCurrentMonth
                                ? 'text-gray-900'
                                : 'text-gray-400',
                        )}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                  </div>

                  {/* 이벤트 pills */}
                  <div className="flex flex-col justify-start gap-1">
                    {display.map((ev) => {
                      const kind = getSegmentKind(ev, day);

                      switch (kind) {
                        case 'single':
                          return (
                            <SingleDayPill
                              key={`${ev.id}-${toYmd(day)}`}
                              ev={ev}
                            />
                          );
                        case 'start':
                          return (
                            <StartPill key={`${ev.id}-${toYmd(day)}`} ev={ev} />
                          );
                        case 'end':
                          return (
                            <EndPill key={`${ev.id}-${toYmd(day)}`} ev={ev} />
                          );
                        default:
                          return (
                            <MiddlePill
                              key={`${ev.id}-${toYmd(day)}`}
                              ev={ev}
                            />
                          );
                      }
                    })}

                    {hasMore && (
                      <div className="bg-border/70 text-muted-foreground mx-1 rounded px-2 py-1 text-center text-xs">
                        + {sorted.length - 3}개
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
          events={selectedDateEvents}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
