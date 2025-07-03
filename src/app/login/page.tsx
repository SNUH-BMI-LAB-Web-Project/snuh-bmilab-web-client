'use client';

import { useState } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const api = new AuthApi();
      const loginRequest: LoginRequest = { email, password };
      const response = await api.login({ loginRequest });
      login(response);

      toast.success('로그인 성공! 환영합니다.');
      router.push('/portal/users');
    } catch (error) {
      let message = '로그인에 실패했습니다. 다시 시도해 주세요.';

      if (error && typeof error === 'object' && 'body' in error) {
        const { body } = error as { body: { message?: string } };

        if (body.message?.includes('사용자를 찾을 수 없습니다')) {
          message = '등록되지 않은 사용자입니다. 관리자에게 문의하세요.';
        } else if (body.message?.includes('비밀번호가 일치하지 않습니다')) {
          message = '비밀번호가 일치하지 않습니다. 다시 시도해 주세요.';
        }
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mt-18 flex h-screen w-full items-center justify-center">
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
                    <a
                      href="#"
                      className="text-muted-foreground ml-auto inline-block text-xs underline-offset-4 hover:underline"
                    >
                      비밀번호를 잊어버리셨나요?
                    </a>
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
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
