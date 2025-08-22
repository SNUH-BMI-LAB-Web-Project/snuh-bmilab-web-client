'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export default function PasswordResetModal({
  open,
  onOpenChange,
  onConfirm,
}: PasswordResetModalProps) {
  const handleReset = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('비밀번호 재발급 실패', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>비밀번호 재발급</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>기존 비밀번호는 즉시 무효화되며,</strong> 새 비밀번호가 해당
            이메일로 전송됩니다.
            <br />이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            비밀번호 재발급
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
