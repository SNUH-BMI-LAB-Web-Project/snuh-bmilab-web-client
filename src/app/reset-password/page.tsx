'use client';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import PasswordResetModal from '@/components/system/users/members/password-reset-modal';
import { toast } from 'sonner';
import { UserApi } from '@/generated-api';
import { useRouter } from 'next/navigation';
import { getPublicApiConfig } from '@/lib/config';

const userApi = new UserApi(getPublicApiConfig());

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('이메일을 입력해 주세요.');
      return;
    }

    try {
      await userApi.sendFindPasswordEmail({
        findPasswordEmailRequest: { email },
      });

      toast.success('비밀번호가 재발급 되었습니다. 이메일을 확인해 주세요.');
      router.push('/login');
    } catch (error) {
      console.log(error);
    } finally {
      setShowPasswordResetDialog(false);
    }
  };

  return (
    <div className="bg-muted -mt-18 flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 찾기</CardTitle>
              <CardDescription>
                가입하신 이메일 주소를 입력해 주세요.
                <br />
                새로운 임시 비밀번호를 발송해 드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-3">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bmi-lab@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setShowPasswordResetDialog(true)}
              >
                임시 비밀번호 발급받기
              </Button>

              <PasswordResetModal
                open={showPasswordResetDialog}
                onOpenChange={setShowPasswordResetDialog}
                onConfirm={handlePasswordReset}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
