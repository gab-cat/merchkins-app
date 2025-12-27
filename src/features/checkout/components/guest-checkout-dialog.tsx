'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { Mail, CheckCircle2, Loader2, ArrowRight, Shield, Clock, Package } from 'lucide-react';

interface GuestCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (userId: string) => void;
}

type Step = 'email' | 'otp';

export function GuestCheckoutDialog({ open, onOpenChange, onVerified }: GuestCheckoutDialogProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [displayedOtp, setDisplayedOtp] = useState<string | undefined>();
  const [isSendingOTP, startSendingOTP] = useTransition();
  const [isVerifyingOTP, startVerifyingOTP] = useTransition();

  const sendOTP = useMutation(api.guestCheckout.index.sendOTP);
  const verifyOTP = useMutation(api.guestCheckout.index.verifyOTP);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showToast({ type: 'error', title: 'Please enter your email address' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast({ type: 'error', title: 'Please enter a valid email address' });
      return;
    }

    startSendingOTP(async () => {
      try {
        const result = await sendOTP({ email: email.trim() });

        if (!result.success) {
          showToast({ type: 'error', title: result.reason || 'Failed to send verification code' });
          return;
        }

        // If OTP is returned (IS_STAGING mode), display it
        if (result.otp) {
          setDisplayedOtp(result.otp);
        }

        setStep('otp');
        showToast({ type: 'success', title: 'Verification code sent! Check your email.' });
      } catch (error) {
        showToast({ type: 'error', title: 'Failed to send verification code' });
      }
    });
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      showToast({ type: 'error', title: 'Please enter the 6-digit verification code' });
      return;
    }

    startVerifyingOTP(async () => {
      try {
        const result = await verifyOTP({ email: email.trim(), code: otp.trim() });

        if (!result.success) {
          if (result.reason === 'max_attempts') {
            showToast({
              type: 'error',
              title: 'Too many attempts',
              description: 'Please request a new verification code.',
            });
            setStep('email');
            setOtp('');
            return;
          }
          if (result.reason === 'expired') {
            showToast({
              type: 'error',
              title: 'Code expired',
              description: 'Please request a new verification code.',
            });
            setStep('email');
            setOtp('');
            return;
          }
          showToast({
            type: 'error',
            title: 'Invalid code',
            description: result.attemptsRemaining
              ? `${result.attemptsRemaining} attempt${result.attemptsRemaining !== 1 ? 's' : ''} remaining`
              : 'Please try again',
          });
          return;
        }

        if (result.userId) {
          showToast({ type: 'success', title: 'Email verified!' });
          onVerified(result.userId);
          onOpenChange(false);
          // Reset state
          setStep('email');
          setEmail('');
          setOtp('');
          setDisplayedOtp(undefined);
        }
      } catch (error) {
        showToast({ type: 'error', title: 'Failed to verify code' });
      }
    });
  };

  const handleResendOTP = () => {
    setOtp('');
    handleSendOTP();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Continue as Guest</DialogTitle>
          <DialogDescription>
            {step === 'email'
              ? 'Enter your email to receive a verification code and complete your checkout.'
              : 'Enter the 6-digit code sent to your email address.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <div className="space-y-6">
            {/* Benefits section */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Benefits of signing in:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Track your orders anytime</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Faster checkout next time</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Access order history and receipts</span>
                </div>
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendOTP();
                      }
                    }}
                    className="pl-10"
                    disabled={isSendingOTP}
                  />
                </div>
                <Button onClick={handleSendOTP} disabled={isSendingOTP || !email.trim()}>
                  {isSendingOTP ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                Sign in instead
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* OTP input */}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otp.length === 6) {
                    handleVerifyOTP();
                  }
                }}
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                disabled={isVerifyingOTP}
                autoFocus
              />
              {displayedOtp && (
                <div className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Testing mode - Your code:</p>
                  <p className="text-2xl font-mono font-bold text-primary tracking-widest">{displayedOtp}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button onClick={handleVerifyOTP} disabled={isVerifyingOTP || otp.length !== 6} size="lg">
                {isVerifyingOTP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify & Continue
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleResendOTP} disabled={isSendingOTP}>
                {isSendingOTP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend code'
                )}
              </Button>
              <Button variant="ghost" onClick={() => setStep('email')} className="text-sm">
                Change email
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
