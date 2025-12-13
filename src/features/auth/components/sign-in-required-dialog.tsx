'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User, ShoppingCart, X } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SignInRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  continueLabel?: string;
  cancelLabel?: string;
  onContinue?: () => void;
}

export const SignInRequiredDialog: React.FC<SignInRequiredDialogProps> = ({
  open,
  onOpenChange,
  title = 'Sign in required',
  description = 'You need to be signed in to add items to your cart.',
  continueLabel = 'Sign in',
  cancelLabel = 'Cancel',
  onContinue,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      // Default behavior: navigate to sign-in with return URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('next', pathname);
      router.push(`/sign-in?${params.toString()}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-black border-none">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-xl font-semibold text-primary">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            {cancelLabel}
          </Button>
          <Button onClick={handleContinue} className="flex-1 bg-primary text-white hover:bg-primary/90">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {continueLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
