'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Search,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* =========================
 * Types
 * ======================= */
type EventType = 'SEMINAR' | 'CONFERENCE';
type SidebarTab = 'DATE' | 'SEARCH';

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

const overlapsDate = (ev: SeminarEvent, dayYmd: string) => {
  const end = ev.endDate ?? ev.startDate;
  return ev.startDate <= dayYmd && dayYmd <= end;
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
        'relative z-10 h-6 truncate px-2 py-1 text-xs',
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

function ContinuedPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  return (
    <BasePill
      color={meta.color}
      className="-mx-px rounded-none"
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

function ContinuedEndPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  return (
    <BasePill
      color={meta.color}
      className="-mx-px mr-1 rounded-l-none rounded-r"
      title={`${meta.name} · ${ev.title}${ev.description ? ` (${ev.description})` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
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

/* =========================
 * Sidebar with Tabs (DATE / SEARCH)
 * ======================= */
function Sidebar({
  selectedDate,
  dateEvents,
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchQueryChange,
  searchedEvents,
}: {
  selectedDate: Date | null;
  dateEvents: SeminarEvent[];
  isOpen: boolean;
  onClose: () => void;

  activeTab: SidebarTab;
  onTabChange: (v: SidebarTab) => void;

  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  searchedEvents: SeminarEvent[];
}) {
  if (!isOpen) return null;

  const selectedDateText =
    selectedDate &&
    `${selectedDate.getFullYear()}년 ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}일 (${weekdayLabels[selectedDate.getDay()]})`;

  return (
    <div className="absolute right-0 h-full w-1/4 border-l bg-white py-4 pr-2 pl-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">일정</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as SidebarTab)}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="DATE">
            날짜별
          </TabsTrigger>
          <TabsTrigger className="w-full" value="SEARCH">
            검색별
          </TabsTrigger>
        </TabsList>

        <TabsContent value="DATE" className="mt-4">
          <div className="mb-3">
            <div className="text-sm font-semibold">{selectedDateText}</div>
            <div className="text-muted-foreground mt-1 text-xs">
              일정 {dateEvents.length}개
            </div>
          </div>

          {dateEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              해당 날짜에 일정이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {dateEvents.map((ev) => {
                const meta = EVENT_TYPES[ev.type];
                const rangeText =
                  ev.endDate && ev.endDate !== ev.startDate
                    ? `${ev.startDate} ~ ${ev.endDate}`
                    : ev.startDate;

                return (
                  <div key={ev.id} className="mr-6 ml-2 border-b pt-2 pb-4">
                    <div className="mb-1 flex items-center gap-2">
                      <div
                        className={cn(
                          'size-3 flex-shrink-0 rounded',
                          meta.color,
                        )}
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
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="SEARCH" className="mt-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="sidebar-search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="검색"
                className="pl-9"
              />
            </div>

            {searchQuery.trim() && (
              <div className="mt-2 rounded border p-3">
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
                        <div
                          key={ev.id}
                          className="hover:bg-muted/40 flex w-full items-start justify-between gap-3 rounded p-2 text-left"
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
                            {ev.description && (
                              <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                {ev.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
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

  // 더미 데이터
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
        startDate: '2026-01-05',
        endDate: '2026-01-07',
        description: '워크샵/튜토리얼 참가',
      },
      {
        id: 4,
        type: 'SEMINAR',
        title: 'Seminar: Diffusion Model Overview',
        startDate: '2026-01-12',
        description: '기초 개념 + 최근 논문 리뷰',
      },
      {
        id: 5,
        type: 'CONFERENCE',
        title: '룰루랄라 학회',
        startDate: '2026-01-05',
        endDate: '2026-01-11',
        description: '워크샵/튜토리얼 참가',
      },
      {
        id: 6,
        type: 'CONFERENCE',
        title: '쿨쿨 학회',
        startDate: '2026-01-05',
        endDate: '2026-01-20',
        description: '워크샵/튜토리얼 참가',
      },
      {
        id: 7,
        type: 'SEMINAR',
        title: '냠냠 학회',
        startDate: '2026-01-15',
        endDate: '2026-01-19',
        description: '워크샵/튜토리얼 참가',
      },
    ],
    [],
  );

  const [events, setEvents] = useState<SeminarEvent[]>(dummyEvents);

  // 사이드바/선택 날짜
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 사이드바 탭
  const [activeTab, setActiveTab] = useState<SidebarTab>('DATE');

  // 검색(사이드바에서만)
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

  /** 이벤트를 날짜별로 조회하기 위한 맵(사이드바용은 유지) */
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
      setActiveTab('DATE');
      return date;
    });
  }, []);

  // 일정 추가 모달
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

      const d = fromYmdLocal(formData.startDate);
      if (d) {
        setSelectedDate(d);
        setIsSidebarOpen(true);
        setActiveTab('DATE');
      }

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

  /* =========================
   * ✅ NEW: 주 단위 트랙(3줄) 고정 배치
   * ======================= */
  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days]);

  type WeekTracks = (SeminarEvent | null)[][]; // [track(0..2)][dayIdx(0..6)]

  const weekTracksList = useMemo(() => {
    return weeks.map((weekDays) => {
      const weekStart = toYmd(weekDays[0]);
      const weekEnd = toYmd(weekDays[6]);

      // 이 주와 겹치는 이벤트만
      const weekEvents = events.filter((ev) => {
        const evEnd = ev.endDate ?? ev.startDate;
        return !(evEnd < weekStart || ev.startDate > weekEnd);
      });

      // 우선순위:
      // 1) 주 시작 전에 이미 시작한 ongoing 먼저(끊김 방지)
      // 2) CONFERENCE 먼저(원래 정책 유지)
      // 3) 시작일 빠른 순
      // 4) 길이가 긴 순(같은 시작일이면 긴 게 위에 올라가면 덜 끊김)
      const prioritized = [...weekEvents].sort((a, b) => {
        const aOngoing = a.startDate < weekStart;
        const bOngoing = b.startDate < weekStart;
        if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

        if (a.type !== b.type) return a.type === 'CONFERENCE' ? -1 : 1;

        if (a.startDate !== b.startDate)
          return a.startDate.localeCompare(b.startDate);

        const aEnd = a.endDate ?? a.startDate;
        const bEnd = b.endDate ?? b.startDate;

        const aDays =
          (new Date(aEnd).getTime() - new Date(a.startDate).getTime()) /
          (1000 * 60 * 60 * 24);
        const bDays =
          (new Date(bEnd).getTime() - new Date(b.startDate).getTime()) /
          (1000 * 60 * 60 * 24);
        return bDays - aDays;
      });

      const tracks: WeekTracks = Array.from({ length: 3 }, () =>
        Array(7).fill(null),
      );

      for (const ev of prioritized) {
        const occupyIdx: number[] = [];
        weekDays.forEach((d, idx) => {
          const dayYmd = toYmd(d);
          if (overlapsDate(ev, dayYmd)) occupyIdx.push(idx);
        });
        if (occupyIdx.length === 0) continue;

        // 들어갈 트랙 찾기 (해당 day칸이 모두 비어있어야 함)
        const trackIndex = tracks.findIndex((track) =>
          occupyIdx.every((idx) => track[idx] === null),
        );
        if (trackIndex === -1) continue;

        occupyIdx.forEach((idx) => {
          tracks[trackIndex][idx] = ev;
        });
      }

      return tracks;
    });
  }, [weeks, events]);

  // 특정 (weekIdx, dayIdx)의 표시 이벤트(트랙 0..2)
  const getDisplayEventsForCell = useCallback(
    (weekIdx: number, dayIdx: number) => {
      const tracks = weekTracksList[weekIdx] ?? [];
      const display: (SeminarEvent | null)[] = [];
      for (let t = 0; t < 3; t += 1) {
        display.push(tracks[t]?.[dayIdx] ?? null);
      }
      return display;
    },
    [weekTracksList],
  );

  // 해당 날짜에 실제로 겹치는 이벤트 수(+) 계산용
  const getTotalEventsCountForDay = useCallback(
    (day: Date) => {
      const dayYmd = toYmd(day);
      // eventsByDateMap로도 가능하지만, 여기선 overlaps로 정확히
      return events.filter((ev) => overlapsDate(ev, dayYmd)).length;
    },
    [events],
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
          <div className="absolute right-0 flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsSidebarOpen(true);
                setActiveTab('SEARCH');
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>

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

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="description">기타</Label>
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

              const weekStartYmd = toYmd(days[weekIdx * 7]); // 그 주 일요일
              const isWeekStart = dayIdx === 0; // 일요일

              // ✅ 트랙 3줄 고정 렌더
              const trackCells = getDisplayEventsForCell(weekIdx, dayIdx);

              // +N 계산: 그날 전체 겹치는 이벤트 수 - (그날 표시된 unique 이벤트 수)
              const totalCount = getTotalEventsCountForDay(day);
              const displayedUnique = new Set(
                trackCells.filter(Boolean).map((e) => (e as SeminarEvent).id),
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

                  {/* 이벤트 pills (트랙 3줄 고정) */}
                  <div className="flex flex-col justify-start gap-1">
                    {trackCells.map((ev, tIdx) => {
                      if (!ev)
                        return <div key={`empty-${tIdx}`} className="h-6" />;

                      // ✅ 기본 세그먼트(시작/중간/끝/단일)
                      const kind = getSegmentKind(ev, day);

                      // ✅ 주가 바뀌는 지점(새 주 일요일)인데, 이벤트는 이전 주부터 이어지는 경우 -> 제목 다시 표시
                      const shouldRepeatTitleAtWeekStart =
                        isWeekStart &&
                        ev.startDate < weekStartYmd &&
                        overlapsDate(ev, toYmd(day));

                      if (kind === 'single') {
                        return (
                          <SingleDayPill
                            key={`${ev.id}-${toYmd(day)}`}
                            ev={ev}
                          />
                        );
                      }

                      // 이벤트 시작일이면 StartPill
                      if (kind === 'start') {
                        return (
                          <StartPill key={`${ev.id}-${toYmd(day)}`} ev={ev} />
                        );
                      }

                      if (shouldRepeatTitleAtWeekStart) {
                        if (kind === 'end') {
                          return (
                            <ContinuedEndPill
                              key={`${ev.id}-${toYmd(day)}`}
                              ev={ev}
                            />
                          );
                        }

                        // 그 외엔 그냥 이어짐
                        return (
                          <ContinuedPill
                            key={`${ev.id}-${toYmd(day)}`}
                            ev={ev}
                          />
                        );
                      }

                      if (kind === 'end') {
                        return (
                          <EndPill key={`${ev.id}-${toYmd(day)}`} ev={ev} />
                        );
                      }

                      return (
                        <MiddlePill key={`${ev.id}-${toYmd(day)}`} ev={ev} />
                      );
                    })}

                    {hiddenCount > 0 && (
                      <div className="bg-border/70 text-muted-foreground mx-1 rounded px-2 py-1 text-center text-xs">
                        + {hiddenCount}개
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Sidebar
        selectedDate={selectedDate}
        dateEvents={selectedDateEvents}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchedEvents={searchedEvents}
      />
    </div>
  );
}
