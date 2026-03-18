'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Search,
  Trash2,
  Edit,
  Clock,
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
import {
  format,
  startOfMonth as fnsStartOfMonth,
  endOfMonth as fnsEndOfMonth,
} from 'date-fns';
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
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  googleCalendarLink?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

const EVENT_TYPES: Record<EventType, { name: string; color: string }> = {
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
const TRACK_KEYS = ['t0', 't1', 't2'] as const;

/* =========================
 * Utils
 * ======================= */
const toYmd = (d: Date | string): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromYmdLocal = (s?: string) => {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function generateCalendarDays(base: Date): Date[] {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

const getSegmentKind = (ev: SeminarEvent, targetDate: Date) => {
  const target = toYmd(targetDate);
  if (ev.startDate === ev.endDate && ev.startDate === target) return 'single';
  if (ev.startDate === target) return 'start';
  if (ev.endDate === target) return 'end';
  return 'middle';
};

const overlapsDate = (ev: SeminarEvent, dayYmd: string) => {
  const end = ev.endDate ?? ev.startDate;
  return ev.startDate <= dayYmd && dayYmd <= end;
};

type LocalTimeLike = {
  hour?: number;
  minute?: number;
  second?: number;
  nano?: number;
};

const parseLegacyTimeNote = (note?: unknown) => {
  const raw = typeof note === 'string' ? note : '';
  if (!raw.trim()) return { note: raw };

  // 지원 포맷 예:
  // - "시간: 23:30"
  // - "시간: 23:30 ~ 01:00"
  // - "시간 · 23:30~01:00"
  // - note 여러 줄 중 한 줄에 포함
  const re =
    /(^|\n)\s*시간\s*[:：·]\s*([01]\d|2[0-3]):([0-5]\d)\s*(?:(?:~|-|–|—)\s*([01]\d|2[0-3]):([0-5]\d))?\s*(?=\n|$)/;
  const m = re.exec(raw);
  if (!m) return { note: raw };

  const startTime = `${m[2]}:${m[3]}`;
  const endTime =
    m[4] != null && m[5] != null ? `${m[4]}:${m[5]}` : undefined;

  const before = raw.slice(0, m.index) + (m[1] === '\n' ? '' : '');
  const after = raw.slice(m.index + m[0].length);
  const cleaned = `${before}${after}`.replace(/^\n+|\n+$/g, '').trimEnd();

  return { note: cleaned, startTime, endTime };
};

const normalizeTime = (t?: unknown): string | undefined => {
  if (t == null) return undefined;

  // 1) swagger `LocalTime` object: {hour, minute, second, nano}
  if (typeof t === 'object') {
    const lt = t as LocalTimeLike;
    if (
      typeof lt.hour === 'number' &&
      typeof lt.minute === 'number' &&
      lt.hour >= 0 &&
      lt.hour <= 23 &&
      lt.minute >= 0 &&
      lt.minute <= 59
    ) {
      return `${String(lt.hour).padStart(2, '0')}:${String(lt.minute).padStart(2, '0')}`;
    }
    return undefined;
  }

  // 2) "HH:mm" 또는 "HH:mm:ss" 문자열
  if (typeof t !== 'string') return undefined;
  const trimmed = t.trim();
  if (!trimmed) return undefined;
  const m = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(trimmed);
  if (!m) return undefined;
  return `${m[1]}:${m[2]}`;
};

const toLocalTime = (hhmm?: string): LocalTimeLike | undefined => {
  const norm = normalizeTime(hhmm);
  if (!norm) return undefined;
  const [h, m] = norm.split(':').map(Number);
  return { hour: h, minute: m, second: 0, nano: 0 };
};

const formatTimeRange = (startTime?: string, endTime?: string) => {
  const st = normalizeTime(startTime);
  const et = normalizeTime(endTime);
  if (st && et) return `${st} ~ ${et}`;
  if (st) return st;
  if (et) return et;
  return null;
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
  const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
  return (
    <BasePill
      color={meta.color}
      className="mx-1 rounded"
      title={`${meta.name} · ${ev.title}${timeLabel ? ` · ${timeLabel}` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
    </BasePill>
  );
}

function StartPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
  return (
    <BasePill
      color={meta.color}
      className="-mr-px ml-1 rounded-l rounded-r-none"
      title={`${meta.name} · ${ev.title}${timeLabel ? ` · ${timeLabel}` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
    </BasePill>
  );
}

function ContinuedPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
  return (
    <BasePill
      color={meta.color}
      className="-mx-px rounded-none"
      title={`${meta.name} · ${ev.title}${timeLabel ? ` · ${timeLabel}` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
    </BasePill>
  );
}

function MiddlePill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
  return (
    <BasePill
      color={meta.color}
      className="-mx-px rounded-none px-0"
      title={`${meta.name} · ${ev.title}${timeLabel ? ` · ${timeLabel}` : ''}`}
    >
      <span className="sr-only">
        {meta.name} {ev.title}
      </span>
    </BasePill>
  );
}

function ContinuedEndPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
  return (
    <BasePill
      color={meta.color}
      className="-mx-px mr-1 rounded-l-none rounded-r"
      title={`${meta.name} · ${ev.title}${timeLabel ? ` · ${timeLabel}` : ''}`}
    >
      <strong className="font-semibold">{meta.name}</strong> {ev.title}
    </BasePill>
  );
}

function EndPill({ ev }: { ev: SeminarEvent }) {
  const meta = EVENT_TYPES[ev.type];
  const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
  return (
    <BasePill
      color={meta.color}
      className="mr-1 -ml-px rounded-l-none rounded-r px-0"
      title={`${meta.name} · ${ev.title}${timeLabel ? ` · ${timeLabel}` : ''}`}
    >
      <span className="sr-only">
        {meta.name} {ev.title}
      </span>
    </BasePill>
  );
}

/* =========================
 * Main Component
 * ======================= */
export default function SeminarCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [events, setEvents] = useState<SeminarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('DATE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedEvents, setSearchedEvents] = useState<SeminarEvent[]>([]);

  // 모달 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: '' as '' | EventType,
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  const days = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

  // API 1: 기간 내 일정 조회
  const fetchEvents = useCallback(async () => {
    const token = getToken();
    const start = toYmd(fnsStartOfMonth(currentDate));
    const end = toYmd(fnsEndOfMonth(currentDate));
    try {
      const res = await fetch(
        `${API_BASE}/seminars/calendar?startDate=${start}&endDate=${end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = data.seminars.map((s: Record<string, unknown>) => {
          const legacy = parseLegacyTimeNote(s.note);
          const apiStartTime = normalizeTime((s as Record<string, unknown>).startTime);
          const apiEndTime = normalizeTime((s as Record<string, unknown>).endTime);
          return {
            id: s.id,
            title: s.title,
            type: s.label as EventType,
            startDate: s.startDate,
            endDate: s.endDate,
            startTime: apiStartTime ?? legacy.startTime,
            endTime: apiEndTime ?? legacy.endTime,
            description: legacy.note,
            googleCalendarLink: (s as Record<string, unknown>)
              .googleCalendarLink as string | undefined,
          };
        });
        setEvents(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // API 2: 검색
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchedEvents([]);
        return;
      }
      const token = getToken();
      try {
        const res = await fetch(
          `${API_BASE}/seminars/search?keyword=${encodeURIComponent(searchQuery)}&page=0&size=20`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setSearchedEvents(
            data.seminars.map((s: Record<string, unknown>) => {
              const legacy = parseLegacyTimeNote(s.note);
              const apiStartTime = normalizeTime(
                (s as Record<string, unknown>).startTime,
              );
              const apiEndTime = normalizeTime((s as Record<string, unknown>).endTime);
              return {
                id: s.id,
                title: s.title,
                type: s.label as EventType,
                startDate: s.startDate,
                endDate: s.endDate,
                startTime: apiStartTime ?? legacy.startTime,
                endTime: apiEndTime ?? legacy.endTime,
                description: legacy.note,
                googleCalendarLink: (s as Record<string, unknown>)
                  .googleCalendarLink as string | undefined,
              };
            }),
          );
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      type: '',
      title: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      description: '',
    });
  };

  // API 3: 일정 생성(POST) 및 수정(PUT) 통합
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.title.trim() || !formData.startDate) return;

    // 시작일이 종료일보다 뒤면 수정/추가 불가
    if (formData.endDate && formData.startDate > formData.endDate) {
      toast.error('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }

    const token = getToken();
    const legacy = parseLegacyTimeNote(formData.description);
    const inferredStart = !formData.startTime ? legacy.startTime : undefined;
    const inferredEnd = !formData.endTime ? legacy.endTime : undefined;

    const startTime = normalizeTime(formData.startTime || inferredStart);
    const endTime = normalizeTime(formData.endTime || inferredEnd);

    if (formData.startTime && !startTime) {
      toast.error('시작 시간 형식이 올바르지 않습니다. (예: 23:30)');
      return;
    }
    if (formData.endTime && !endTime) {
      toast.error('종료 시간 형식이 올바르지 않습니다. (예: 23:30)');
      return;
    }

    const body = {
      label: formData.type,
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      startTime: startTime ? toLocalTime(startTime) : undefined,
      endTime: endTime ? toLocalTime(endTime) : undefined,
      // 레거시로 note에 섞여있던 "시간:" 라인은 제거하고 저장
      note: legacy.note?.trim() ? legacy.note : undefined,
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/seminars/${editingId}`
        : `${API_BASE}/seminars`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingId ? '수정되었습니다.' : '일정이 추가되었습니다.');
        // 수정/생성 성공 시 fetchEvents 호출하여 뷰 갱신
        fetchEvents();
        handleCloseModal();
      } else if (res.status === 403) {
        toast.error('권한이 없습니다.');
      } else {
        toast.error('실패하였습니다.');
      }
    } catch (err) {
      toast.error('실패하였습니다.');
    }
  };

  // API 4: 일정 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm('일정을 삭제하시겠습니까?')) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/seminars/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('삭제되었습니다.');
        fetchEvents();
      } else if (res.status === 403) {
        toast.error('권한이 없습니다.');
      } else if (res.status === 500 || res.status === 400) {
        toast.error(
          '연계된 데이터가 있어 삭제할 수 없습니다. 연결을 해제한 뒤 다시 시도해 주세요.',
        );
      } else {
        toast.error('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Seminar delete error:', err);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const openEditModal = (ev: SeminarEvent) => {
    const legacy = parseLegacyTimeNote(ev.description);
    setEditingId(ev.id);
    setFormData({
      type: ev.type,
      title: ev.title,
      startDate: ev.startDate,
      endDate: ev.endDate || '',
      startTime: ev.startTime || legacy.startTime || '',
      endTime: ev.endTime || legacy.endTime || '',
      description: legacy.note || '',
    });
    setIsModalOpen(true);
  };

  const selectedDateEvents = useMemo(() => {
    const dayYmd = selectedDate ? toYmd(selectedDate) : '';
    return events.filter((ev) => overlapsDate(ev, dayYmd));
  }, [selectedDate, events]);

  const changeMonth = (dir: number) =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1),
    );

  const handleDateClick = (date: Date) => {
    setSelectedDate((prev) => {
      if (prev && isSameDay(prev, date)) {
        setIsSidebarOpen(false);
        return null;
      }
      setIsSidebarOpen(true);
      setActiveTab('DATE');
      return date;
    });
  };

  /* =========================
   * Track Logic
   * ======================= */
  const weeks = useMemo(() => {
    const weekCount = Math.ceil(days.length / 7);
    return Array.from({ length: weekCount }, (_, i) =>
      days.slice(i * 7, i * 7 + 7),
    );
  }, [days]);

  const weekTracksList = useMemo(() => {
    return weeks.map((weekDays) => {
      const weekStart = toYmd(weekDays[0]);
      const weekEnd = toYmd(weekDays[6]);
      const weekEvents = events.filter((ev) => {
        const evEnd = ev.endDate ?? ev.startDate;
        return !(evEnd < weekStart || ev.startDate > weekEnd);
      });
      const prioritized = [...weekEvents].sort((a) =>
        a.startDate < weekStart ? -1 : 1,
      );
      const tracks: (SeminarEvent | null)[][] = Array.from({ length: 3 }, () =>
        Array(7).fill(null),
      );
      prioritized.forEach((ev) => {
        const occupy: number[] = [];
        weekDays.forEach((d, idx) => {
          if (overlapsDate(ev, toYmd(d))) occupy.push(idx);
        });
        const tIdx = tracks.findIndex((t) =>
          occupy.every((i) => t[i] === null),
        );
        if (tIdx !== -1)
          occupy.forEach((i) => {
            tracks[tIdx][i] = ev;
          });
      });
      return tracks;
    });
  }, [weeks, events]);

  return (
    <div className="mx-auto flex max-w-7xl bg-white">
      <div
        className={cn(
          'relative px-10 transition-all duration-300',
          isSidebarOpen ? 'w-3/4' : 'w-full',
        )}
      >
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
            <Dialog
              open={isModalOpen}
              onOpenChange={(open) => !open && handleCloseModal()}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  일정 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? '일정 수정' : '세미나/학회 일정 추가'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      라벨 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData((s) => ({ ...s, type: v as EventType }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="세미나/학회를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEMINAR">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-blue-200" />
                            세미나
                          </div>
                        </SelectItem>
                        <SelectItem value="CONFERENCE">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-pink-200" />
                            학회
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      제목 <span className="text-destructive">*</span>
                    </Label>
                    <Input
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
                      <Label>
                        시작일 <span className="text-destructive">*</span>
                      </Label>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate || '날짜 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fromYmdLocal(formData.startDate)}
                            onSelect={(d) =>
                              d &&
                              setFormData((s) => ({
                                ...s,
                                startDate: toYmd(d),
                              }))
                            }
                            locale={ko}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>종료일 (선택)</Label>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate || '날짜 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fromYmdLocal(formData.endDate)}
                            onSelect={(d) =>
                              d &&
                              setFormData((s) => ({ ...s, endDate: toYmd(d) }))
                            }
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작 시간 (선택)</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            startTime: e.target.value,
                            endTime:
                              s.endTime &&
                              e.target.value &&
                              s.endTime < e.target.value
                                ? ''
                                : s.endTime,
                          }))
                        }
                        step={60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>종료 시간 (선택)</Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            endTime: e.target.value,
                          }))
                        }
                        step={60}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>기타</Label>
                    <Textarea
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
                      onClick={handleCloseModal}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !formData.type ||
                        !formData.title ||
                        !formData.startDate ||
                        (!!formData.endDate &&
                          formData.startDate > formData.endDate)
                      }
                    >
                      {editingId ? '수정' : '추가'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Legend />
        <div className="mb-10 overflow-hidden rounded-lg border">
          <div className="bg-muted grid grid-cols-7">
            {weekdayLabels.map((wd) => (
              <div
                key={wd}
                className="border-r p-2 text-center text-sm font-semibold"
              >
                {wd}
              </div>
            ))}
          </div>
          <div className="grid auto-rows-[145px] grid-cols-7">
            {days.map((day, idx) => {
              const weekIdx = Math.floor(idx / 7);
              const dayIdx = idx % 7;
              const dayYmd = toYmd(day);
              const isCurr = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, today);
              const tracks = weekTracksList[weekIdx] || [];
              const cells = tracks.map((t) => t?.[dayIdx] ?? null);
              const total = events.filter((e) =>
                overlapsDate(e, dayYmd),
              ).length;
              const displayed = new Set(cells.filter(Boolean).map((e) => e!.id))
                .size;
              return (
                <button
                  type="button"
                  key={dayYmd}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'relative flex h-full w-full flex-col border-r border-b pt-7 text-left',
                    isCurr ? 'bg-white' : 'bg-muted/30',
                  )}
                >
                  <div className="absolute top-1 left-1">
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full text-xs',
                        (() => {
                          if (selectedDate && isSameDay(day, selectedDate))
                            return 'bg-muted-foreground text-white';
                          if (isToday) return 'bg-blue-500 text-white';
                          if (isCurr) return 'text-gray-900';
                          return 'text-gray-400';
                        })(),
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {TRACK_KEYS.map((trackKey, tIdx) => {
                      const ev = cells[tIdx];
                      if (!ev)
                        return (
                          <div
                            key={`empty-${dayYmd}-${trackKey}`}
                            className="h-6"
                          />
                        );
                      const kind = getSegmentKind(ev, day);
                      if (kind === 'single')
                        return <SingleDayPill key={ev.id} ev={ev} />;
                      if (kind === 'start')
                        return <StartPill key={ev.id} ev={ev} />;
                      if (dayIdx === 0 && ev.startDate < dayYmd)
                        return kind === 'end' ? (
                          <ContinuedEndPill key={ev.id} ev={ev} />
                        ) : (
                          <ContinuedPill key={ev.id} ev={ev} />
                        );
                      if (kind === 'end')
                        return <EndPill key={ev.id} ev={ev} />;
                      return <MiddlePill key={ev.id} ev={ev} />;
                    })}
                    {total - displayed > 0 && (
                      <div className="bg-border/70 mx-1 rounded py-1 text-center text-xs">
                        + {total - displayed}개
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {isSidebarOpen && (
        <div className="absolute right-0 h-full w-1/4 border-l bg-white py-4 pr-2 pl-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <h2 className="text-lg font-semibold">일정</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as SidebarTab)}
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
                <div className="text-sm font-semibold">
                  {selectedDate && format(selectedDate, 'PPP', { locale: ko })}
                </div>
                <div className="text-muted-foreground text-xs">
                  일정 {selectedDateEvents.length}개
                </div>
              </div>
              <div className="max-h-[calc(100vh-250px)] space-y-3 overflow-y-auto pr-4">
                {selectedDateEvents.map((ev) => (
                  <div key={ev.id} className="group border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'size-3 rounded',
                            EVENT_TYPES[ev.type].color,
                          )}
                        />
                        <div className="text-sm font-medium">{ev.title}</div>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {ev.googleCalendarLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(ev.googleCalendarLink, '_blank');
                            }}
                          >
                            내 캘린더에 추가
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditModal(ev)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => handleDelete(ev.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-muted-foreground ml-5 text-xs">
                      {(() => {
                        const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
                        return (
                          <>
                            {EVENT_TYPES[ev.type].name} · {ev.startDate} ~{' '}
                            {ev.endDate || ev.startDate}
                            {timeLabel ? ` · ${timeLabel}` : ''}
                          </>
                        );
                      })()}
                    </div>
                    {formatTimeRange(ev.startTime, ev.endTime) && (
                      <div className="text-muted-foreground ml-5 text-xs">
                        시간 · {formatTimeRange(ev.startTime, ev.endTime)}
                      </div>
                    )}
                    {ev.description && (
                      <div className="mt-2 ml-5 text-xs whitespace-pre-wrap">
                        {ev.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="SEARCH" className="mt-4">
              <div className="relative mb-4">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어 입력"
                  className="pl-9"
                />
              </div>
              <div className="max-h-[calc(100vh-250px)] space-y-2 overflow-y-auto pr-4">
                {searchedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    role="button"
                    tabIndex={0}
                    className="hover:bg-muted/40 group cursor-pointer rounded border p-3"
                    onClick={() => {
                      setSelectedDate(fromYmdLocal(ev.startDate)!);
                      setActiveTab('DATE');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDate(fromYmdLocal(ev.startDate)!);
                        setActiveTab('DATE');
                      }
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-3 w-3 rounded',
                            EVENT_TYPES[ev.type].color,
                          )}
                        />
                        <div className="text-sm font-medium">{ev.title}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(ev);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {(() => {
                        const timeLabel = toTimeLabel(ev.startTime, ev.endTime);
                        return (
                          <>
                            {ev.startDate} {ev.endDate ? `~ ${ev.endDate}` : ''}
                            {timeLabel ? ` · ${timeLabel}` : ''}
                          </>
                        );
                      })()}
                    </div>
                    {formatTimeRange(ev.startTime, ev.endTime) && (
                      <div className="text-muted-foreground mt-1 text-[11px]">
                        {formatTimeRange(ev.startTime, ev.endTime)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
