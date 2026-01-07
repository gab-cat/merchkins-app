'use client';

import { useVersionCheck } from '@/src/hooks/use-version-check';
import { useVersionCheckStore } from '@/src/stores/version-check';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';

export const UpdateNotification = () => {
  const { showNotification, currentVersion } = useVersionCheck();
  const { dismissCurrentUpdate, setShowNotification } = useVersionCheckStore();

  const handleRefresh = () => {
    if (currentVersion) {
      try {
        localStorage.setItem('merchkins-app-version', JSON.stringify(currentVersion));
      } catch (error) {
        console.error('Failed to update version in localStorage:', error);
      }
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    dismissCurrentUpdate();
    setShowNotification(false);
  };

  if (!showNotification || !currentVersion) return null;

  return (
    <AnimatePresence mode="wait">
      <AlertDialog open={showNotification} onOpenChange={(open) => !open && handleDismiss()}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl border border-slate-100 bg-white p-0 shadow-xl gap-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            <div className="p-5">
              <AlertDialogHeader className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#1d43d8]/10 shrink-0">
                    <Sparkles className="h-4 w-4 text-[#1d43d8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <AlertDialogTitle className="text-base font-bold text-slate-900 font-heading">Update Available</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-slate-500 mt-0.5">
                      v{currentVersion.version} •{' '}
                      {new Date(currentVersion.buildDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </AlertDialogDescription>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">A new version is ready with improvements and fixes.</p>
              </AlertDialogHeader>

              <AlertDialogFooter className="flex-row gap-2.5 sm:gap-2.5">
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="flex-1 h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full text-sm font-medium"
                >
                  Later
                </Button>
                <Button
                  onClick={handleRefresh}
                  className="flex-1 h-10 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white rounded-full text-sm font-semibold shadow-md shadow-[#1d43d8]/20"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Refresh
                </Button>
              </AlertDialogFooter>
            </div>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};
