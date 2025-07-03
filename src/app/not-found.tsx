'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4"
      style={{ minHeight: 'calc(100vh - 70px)' }}
    >
      <Card className="mx-auto w-full max-w-md border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          {/* Lock Icon */}
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <X className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="mb-2 text-6xl font-bold text-blue-600">404</h1>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">
              Not Found
            </h2>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <p className="leading-relaxed text-gray-600">
              요청하신 페이지는 존재하지 않습니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => window.history.back()}
            >
              <button type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전 페이지로
              </button>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
