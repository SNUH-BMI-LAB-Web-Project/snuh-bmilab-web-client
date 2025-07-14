'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserApi } from '@/generated-api/apis/UserApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getApiConfig } from '@/lib/config';

const userApi = new UserApi(getApiConfig());

interface ChangePasswordModalProps {
  triggerButton?: React.ReactNode; // 외부에서 버튼 넘기고 싶을 때
}

export function ChangePasswordModal({
  triggerButton,
}: ChangePasswordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        '비밀번호는 8자 이상의 영문자 및 숫자 조합으로 작성해주세요.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await userApi.updatePassword({
        updateUserPasswordRequest: {
          currentPassword,
          newPassword,
        },
      });

      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      setIsOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <span>비밀번호 변경</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="현재 비밀번호를 입력하세요."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">
              새 비밀번호
              <span className="text-destructive text-xs">
                * 8자 이상의 영문자 및 숫자 조합
              </span>
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="새 비밀번호를 입력하세요."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">
              새 비밀번호 확인
              <span className="text-destructive text-xs">
                * 8자 이상의 영문자 및 숫자 조합
              </span>
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="새 비밀번호를 한 번 더 입력하세요."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
