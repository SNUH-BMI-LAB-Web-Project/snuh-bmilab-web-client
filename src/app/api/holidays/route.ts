import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* eslint-disable vars-on-top */
declare global {
  // eslint-disable-next-line no-var
  var memStore: Map<string, string> | undefined;
  type StorageLike = {
    readonly length: number;
    key: (i: number) => string | null;
    getItem: (k: string) => string | null;
    setItem: (k: string, v: string) => void;
    removeItem: (k: string) => void;
    clear: () => void;
  };
  // eslint-disable-next-line no-var
  var serverLocalStorage: StorageLike | undefined;
}

function parseIntStrict(v: string | null, fallback: number): number {
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

type HolidayLite = { date: string; name: string };

function ensureServerStorage(): void {
  if (!globalThis.memStore) {
    globalThis.memStore = new Map<string, string>();
  }
  if (!globalThis.serverLocalStorage) {
    const store = globalThis.memStore;
    globalThis.serverLocalStorage = {
      get length() {
        return store?.size ?? 0;
      },
      key: (i: number) =>
        store ? (Array.from(store.keys())[i] ?? null) : null,
      getItem: (k: string) => (store ? (store.get(k) ?? null) : null),
      setItem: (k: string, v: string) => {
        store?.set(k, v);
      },
      removeItem: (k: string) => {
        store?.delete(k);
      },
      clear: () => {
        store?.clear();
      },
    };
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'unknown';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!process.env.HOME) {
    // eslint-disable-next-line no-process-env
    process.env.HOME = '/tmp';
  }

  ensureServerStorage();

  const { getHolidays, DateKind } = await import('@kokr/date');

  try {
    const url = new URL(req.url);
    const currentYear = new Date().getFullYear();

    const y = parseIntStrict(url.searchParams.get('y'), currentYear);
    const aroundRaw = parseIntStrict(url.searchParams.get('around'), 0);
    const around = Math.min(Math.max(aroundRaw, 0), 2);

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
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/holidays] HOME=', process.env.HOME, 'error=', err);

    return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
  }
}
