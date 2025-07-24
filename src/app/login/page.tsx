'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { AuthApi } from '@/generated-api/apis/AuthApi';
import { LoginRequest } from '@/generated-api/models/LoginRequest';
import { useAuthStore } from '@/store/auth-store';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { getPublicApiConfig } from '@/lib/config';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const flag = sessionStorage.getItem('emailChanged');
    if (flag === 'true') {
      toast.info('이메일이 변경되어 다시 로그인해 주세요.');
      sessionStorage.removeItem('emailChanged');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const api = new AuthApi(getPublicApiConfig());
      const loginRequest: LoginRequest = { email, password };
      const response = await api.login({ loginRequest });

      login(response);

      Cookies.set('accessToken', response.accessToken ?? '', {
        expires: 1,
        sameSite: 'strict',
      });

      toast.success('로그인 성공! 환영합니다.');
      startTransition(() => {
        setTimeout(() => {
          const token = useAuthStore.getState().accessToken;
          if (token) {
            router.push('/portal/users');
          }
        }, 1000);
      });
    } catch (error) {
      const fallbackMessage = '로그인에 실패했습니다. 다시 시도해 주세요.';
      const message =
        error && typeof error === 'object' && 'body' in error
          ? ((error as { body?: { message?: string } }).body?.message ??
            fallbackMessage)
          : fallbackMessage;

      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted -mt-18 flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle>로그인</CardTitle>
              <CardDescription>
                이메일과 비밀번호를 입력해 주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="bmi-lab@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">비밀번호</Label>
                    <Link
                      href="/reset-password"
                      className="text-muted-foreground ml-auto inline-block text-xs underline-offset-4 hover:underline"
                    >
                      비밀번호를 잊어버리셨나요?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호 입력"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:bg-trasparent absolute inset-y-0 right-0 flex items-center bg-transparent pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '로그인 중...' : '로그인'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
