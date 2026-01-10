'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BlurFade } from '@/src/components/ui/animations/effects';

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-6">
      <BlurFade delay={0.1} duration={0.4} blurAmount={8} yOffset={10}>
        <div className="max-w-md w-full">
          {/* Main card */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-modern">
            {/* Icon section */}
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-xl bg-[#1d43d8]/10">
                <AlertTriangle className="h-6 w-6 text-[#1d43d8]" />
              </div>
            </div>

            {/* Error message */}
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-xl font-bold font-heading text-slate-900">Something went wrong</h2>
              <p className="text-slate-500 text-sm font-body leading-relaxed">
                We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault. Let&apos;s get you back on track.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={resetError}
                className="w-full bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white rounded-full px-6 h-10 font-semibold shadow-lg shadow-[#1d43d8]/25"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="rounded-full px-4 h-10 font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>

                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="rounded-full px-4 h-10 font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </div>
            </div>

            {/* Error details - collapsible */}
            {error?.message && (
              <div className="mt-6">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs font-medium text-slate-600 font-body">Error Details</span>
                  {showErrorDetails ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {showErrorDetails && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-mono break-all font-body">{error.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
