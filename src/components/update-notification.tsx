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
import { RefreshCw, Clock, ArrowRight } from 'lucide-react';

export const UpdateNotification = () => {
  const { showNotification, currentVersion } = useVersionCheck();
  const { dismissCurrentUpdate, setShowNotification } = useVersionCheckStore();

  const handleRefresh = () => {
    // Update localStorage with the new version before reloading
    // This ensures that after refresh, localStorage matches the current version
    // and the notification won't appear again
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
      <motion.div
        key="update-notification"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
      >
        <AlertDialog open={showNotification} onOpenChange={setShowNotification}>
          <AlertDialogContent
            className="overflow-hidden bg-white border-0 shadow-2xl"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="relative">
              {/* Accent bar - creates visual anchor */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/80 to-primary/60" />

              {/* Asymmetric design element */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-linear-to-br from-primary/20 to-primary/10 rounded-full -rotate-12 opacity-5" />
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-linear-to-tr from-primary/15 to-primary/10 rounded-full rotate-18 opacity-5" />

              {/* Subtle grid pattern background */}
              <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgb(var(--primary)) 1px, transparent 1px),
                    linear-gradient(to bottom, rgb(var(--primary)) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-8">
                <AlertDialogHeader className="space-y-6 mb-8">
                  {/* Icon section - minimalist */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="relative">
                      {/* Animated background ring */}
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute -inset-2 bg-primary rounded-full blur-md"
                      />

                      {/* Icon container */}
                      <div className="relative w-12 h-12 bg-primary rounded-sm flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <RefreshCw className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </motion.div>
                      </div>
                    </div>

                    {/* Version badge - positioned asymmetrically */}
                    <motion.div
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.25 }}
                      className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full"
                    >
                      <span className="text-[11px] font-semibold text-primary tracking-wide uppercase">v{currentVersion.version}</span>
                    </motion.div>
                  </motion.div>

                  {/* Title - bold, distinctive */}
                  <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                    <AlertDialogTitle className="text-3xl font-bold text-zinc-900 tracking-tight font-dm-sans leading-tight">
                      New Version Ready
                    </AlertDialogTitle>
                  </motion.div>

                  {/* Description - clean typography */}
                  <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.25 }}>
                    <AlertDialogDescription className="text-base text-zinc-600 leading-relaxed font-light">
                      A fresh update with improvements and enhancements is waiting.
                    </AlertDialogDescription>
                    <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>
                        {new Date(currentVersion.buildDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </motion.div>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col sm:flex-row gap-3">
                  {/* Dismiss button - subtle */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="w-full sm:w-1/2"
                  >
                    <Button
                      variant="secondary"
                      onClick={handleDismiss}
                      className="w-full h-12 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all duration-200 font-medium"
                    >
                      Later
                    </Button>
                  </motion.div>

                  {/* Primary action - bold, distinctive */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="w-full sm:w-1/2"
                  >
                    <Button
                      onClick={handleRefresh}
                      className="w-full h-12 bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] rounded-full transition-all duration-200 font-semibold text-base shadow-lg shadow-primary/20 relative overflow-hidden group"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" strokeWidth={2} />
                        <span>Refresh Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2} />
                      </span>

                      {/* Subtle shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </Button>
                  </motion.div>
                </AlertDialogFooter>
              </div>
            </motion.div>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
};
