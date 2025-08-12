import { NextResponse } from 'next/server';
import { getHolidays, DateKind, type DateInfo } from '@kokr/date';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const y = Number(searchParams.get('y')) || new Date().getFullYear();
  const around = Number(searchParams.get('around') ?? 1);

  const years = Array.from(
    { length: around * 2 + 1 },
    (_, i) => y - around + i,
  );
  const lists = await Promise.all(years.map((yy) => getHolidays(yy)));
  const merged = lists.flat();

  const onlyHolidays = merged
    .filter((d) => d.kind === DateKind.Holiday)
    .map((d) => ({ date: d.date, name: d.name })) satisfies Array<
    Pick<DateInfo, 'date' | 'name'>
  >;

  return NextResponse.json(onlyHolidays, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
