'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import {
  AdminUserApi,
  Configuration,
  RegisterUserRequest,
  UserApi,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

interface EmailConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: RegisterUserRequest | null;
}

export default function EmailConfirmationModal({
  open,
  onOpenChange,
  userData,
}: EmailConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const adminUserApi = new AdminUserApi(
    new Configuration({
      accessToken: async () => useAuthStore.getState().accessToken ?? '',
    }),
  );

  const userApi = new UserApi(
    new Configuration({
      accessToken: async () => useAuthStore.getState().accessToken ?? '',
    }),
  );

  const handleSendEmail = async () => {
    if (!userData) return;
    setIsLoading(true);

    try {
      // email로 해당 유저 검색 -> id를 가져오기 위함
      const searchResult = await userApi.searchUsers({
        filterBy: 'email',
        filterValue: userData.email,
      });

      const matchedUser = searchResult.users?.find(
        (user) => user.email === userData.email,
      );

      if (!matchedUser || !matchedUser.userId) {
        throw new Error('해당 이메일로 등록된 사용자를 찾을 수 없습니다.');
      }

      // 이메일 발송 API 호출
      await adminUserApi.sendAccountEmail({
        userId: matchedUser.userId,
        userAccountEmailRequest: {
          password: userData.password,
        },
      });

      // 성공 처리
      setEmailSent(true);

      setTimeout(() => {
        onOpenChange(false);
        setEmailSent(false);
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      toast.error('이메일 발송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (userData?.password) {
      try {
        await navigator.clipboard.writeText(userData.password);
        toast.success('비밀번호가 클립보드에 복사되었습니다.');
      } catch (err) {
        toast.error('비밀번호 복사에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!emailSent ? (
          // 이메일 발송 확인 단계
          <div className="space-y-6 text-center">
            <DialogHeader>
              {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"> */}
              {/*   <Mail className="h-8 w-8 text-white" /> */}
              {/* </div> */}
              <DialogTitle className="text-xl font-bold text-gray-900">
                임시 비밀번호 이메일 발송
              </DialogTitle>
            </DialogHeader>

            {/* 사용자 정보 */}
            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{userData.name}</p>
                  <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">임시 비밀번호:</span>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm">{userData.password}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPassword}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-left">
                  <p className="mb-1 text-sm font-medium text-blue-900">
                    이메일로 임시 비밀번호를 발송하시겠습니까?
                  </p>
                  <p className="text-xs text-blue-700">
                    사용자가 첫 로그인 시 비밀번호를 변경하도록 안내됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 전송 버튼 */}
            <Button
              onClick={handleSendEmail}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  이메일 발송
                </>
              )}
            </Button>
          </div>
        ) : (
          // 발송 완료 단계
          <div className="space-y-6 text-center">
            {/* <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg"> */}
            {/*   <CheckCircle className="h-8 w-8 text-white" /> */}
            {/* </div> */}

            <div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                이메일 발송 완료!
              </h3>
              <p className="text-gray-600">
                <strong>{userData.email}</strong>로<br />
                임시 비밀번호가 발송되었습니다.
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-green-900">
                    발송 완료
                  </p>
                  <p className="text-xs text-green-700">
                    사용자에게 로그인 정보가 전달되었습니다.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              이 창은 자동으로 닫힙니다...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
