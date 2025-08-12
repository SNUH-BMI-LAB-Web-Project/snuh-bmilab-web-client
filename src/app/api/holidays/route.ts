import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

process.env.HOME ||= '/tmp';

interface MemoryStorage {
  length: number;
  key(i: number): string | null;
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
  clear(): void;
}

const memStore = new Map<string, string>();
const g = globalThis as { localStorage?: MemoryStorage };
g.localStorage ??= {
  get length() {
    return memStore.size;
  },
  key: (i) => Array.from(memStore.keys())[i] ?? null,
  getItem: (k) => memStore.get(k) ?? null,
  setItem: (k, v) => {
    memStore.set(k, v);
  },
  removeItem: (k) => {
    memStore.delete(k);
  },
  clear: () => {
    memStore.clear();
  },
};

type HolidayLite = { date: string; name: string };

function parseIntStrict(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const { getHolidays, DateKind } = await import('@kokr/date');

    const url = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const y = parseIntStrict(url.searchParams.get('y'), currentYear);
    const around = Math.min(
      Math.max(parseIntStrict(url.searchParams.get('around'), 0), 0),
      2,
    );

    const years = new Set<number>([y]);
    for (let i = 1; i <= around; i += 1) {
      years.add(y - i);
      years.add(y + i);
    }

    const chunks = await Promise.all(
      [...years].map(async (yy) => {
        const list = await getHolidays(yy);
        return list
          .filter((d) => d.kind === DateKind.Holiday)
          .map<HolidayLite>((d) => ({ date: d.date, name: d.name }));
      }),
    );

    const all = chunks.flat().sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(all, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('[api/holidays] failed:', err);
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
