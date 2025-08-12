import { NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

type HolidayLite = { date: string; name: string };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const y = Number(searchParams.get('y'));
    const around = Number(searchParams.get('around') ?? '0');

    if (!Number.isInteger(y)) {
      return NextResponse.json(
        { error: '`y` must be an integer' },
        { status: 400 },
      );
    }
    if (!Number.isInteger(around) || around < 0 || around > 5) {
      return NextResponse.json(
        { error: '`around` must be 0~5' },
        { status: 400 },
      );
    }

    process.env.HOME ||= '/tmp';
    const denoRoot = path.join(os.homedir(), '.denostack');
    await fs.mkdir(denoRoot, { recursive: true });

    const { getHolidays, DateKind } = await import('@kokr/date');

    const years: number[] = Array.from(
      { length: around * 2 + 1 },
      (_, i) => y - around + i,
    );

    const lists = await Promise.all(years.map((year) => getHolidays(year)));

    const out: HolidayLite[] = lists
      .flat()
      .filter((d) => d.kind === DateKind.Holiday)
      .map((d) => ({ date: d.date, name: d.name }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(out, {
      headers: {
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/holidays] failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
