'use client';

import { useEffect, useState } from 'react';

export default function RssLoading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return `${prev}.`;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="w-[90%] max-w-lg rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="space-y-6 text-center">
          <div className="flex justify-center space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              데이터를 불러오고 있습니다{dots}
            </h2>
            <p className="text-sm text-gray-500">
              NTIS RSS 공고 정보를 가져오는 중입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
