import type { NextRequest } from 'next/server';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HolidayLite = { date: string; name: string };

let modPromise: Promise<typeof import('@kokr/date')> | null = null;

async function ensureDenostackHomeReady() {
  if (!process.env.HOME) process.env.HOME = '/tmp';

  const home = os.homedir() || '/tmp';
  const denoDir = path.join(home, '.denostack');

  try {
    fs.mkdirSync(denoDir, { recursive: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[holidays] mkdir failed:', err);
    }
  }
}

async function getKokr() {
  await ensureDenostackHomeReady();
  if (!modPromise) {
    modPromise = import('@kokr/date');
  }
  return modPromise;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const y = Number(searchParams.get('y') ?? new Date().getFullYear());
    const around = Math.max(
      0,
      Math.min(3, Number(searchParams.get('around') ?? 0)),
    );

    const { getHolidays, DateKind } = await getKokr();

    const years = new Set<number>([y]);
    for (let i = 1; i <= around; i += 1) {
      years.add(y - i);
      years.add(y + i);
    }

    const lists = await Promise.all([...years].map((yy) => getHolidays(yy)));

    const all: HolidayLite[] = lists
      .flat()
      .filter((d) => d.kind === DateKind.Holiday)
      .map((d) => ({ date: d.date, name: d.name }))
      .sort((a, b) => a.date.localeCompare(b.date));

    all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return Response.json(all, { status: 200 });
  } catch (err) {
    console.error('[GET /api/holidays] failed:', err);
    return Response.json(
      { error: 'failed_to_fetch_holidays' },
      { status: 500 },
    );
  }
}
