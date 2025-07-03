'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Home } from 'lucide-react';
import Link from 'next/link';

export default function ForbiddenPage() {
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
              <Lock className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="mb-2 text-6xl font-bold text-blue-600">403</h1>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">
              접근 금지
            </h2>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <p className="leading-relaxed text-gray-600">
              죄송합니다. 이 페이지에 접근할 권한이 없습니다.
              <br />
              필요한 권한이 있는지 확인하거나 관리자에게 문의하세요.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>

            {/* <Button */}
            {/*   variant="outline" */}
            {/*   asChild */}
            {/*   className="w-full border-blue-200 bg-transparent text-blue-600 hover:bg-blue-50" */}
            {/*   onClick={() => window.history.back()} */}
            {/* > */}
            {/*   <button type="button"> */}
            {/*     <ArrowLeft className="mr-2 h-4 w-4" /> */}
            {/*     이전 페이지로 */}
            {/*   </button> */}
            {/* </Button> */}
          </div>

          {/* Additional Info */}
          {/* <div className="mt-8 border-t border-gray-200 pt-6"> */}
          {/*   <p className="text-sm text-gray-500"> */}
          {/*     문제가 지속되면{' '} */}
          {/*     <Link */}
          {/*       href="/contact" */}
          {/*       className="text-blue-600 underline hover:text-blue-800" */}
          {/*     > */}
          {/*       고객지원팀 */}
          {/*     </Link> */}
          {/*     에 문의하세요. */}
          {/*   </p> */}
          {/* </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
