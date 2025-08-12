import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!process.env.HOME || process.env.HOME === '/') {
    process.env.HOME = '/tmp';
  }

  const { getHolidays, DateKind } = await import('@kokr/date');

  const { searchParams } = new URL(req.url);
  const y = Number(searchParams.get('y') ?? new Date().getFullYear());
  const around = Number(searchParams.get('around') ?? 0);

  const years = new Set([y]);
  for (let i = 1; i <= around; i += 1) {
    years.add(y - i);
    years.add(y + i);
  }

  const lists = await Promise.all(
    [...years].sort().map((yy) => getHolidays(yy)),
  );
  const merged = lists.flat().filter((d) => d.kind === DateKind.Holiday);

  const payload = merged.map(({ date, name }) => ({ date, name }));

  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 's-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
