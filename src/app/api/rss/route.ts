import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://www.ntis.go.kr/rndgate/eg/un/ra/mng/unRndRss.do',
      { cache: 'no-store' },
    );

    const text = await res.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    return new NextResponse('Failed to fetch RSS', { status: 500 });
  }
}
