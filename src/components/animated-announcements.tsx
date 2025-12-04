'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, AlertTriangle, Info, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  category?: string;
  level?: 'INFO' | 'WARNING' | 'CRITICAL';
  publishedAt: number;
}

interface AnimatedAnnouncementsProps {
  announcements: Announcement[];
  className?: string;
}

const DISMISSED_KEY = 'merchkins_dismissed_announcements';

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    const now = Date.now();
    const valid = Object.entries(parsed)
      .filter(([, ts]) => now - (ts as number) < 7 * 24 * 60 * 60 * 1000)
      .map(([id]) => id);
    return new Set(valid);
  } catch {
    return new Set();
  }
}

function dismissAnnouncement(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[id] = Date.now();
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function AnimatedAnnouncements({ announcements, className }: AnimatedAnnouncementsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  const visibleAnnouncements = useMemo(() => {
    return announcements.filter((a) => !dismissedIds.has(a._id));
  }, [announcements, dismissedIds]);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (visibleAnnouncements.length <= 1 || isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [visibleAnnouncements.length, isPaused]);

  useEffect(() => {
    if (currentIndex >= visibleAnnouncements.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visibleAnnouncements.length]);

  const handleDismiss = useCallback((id: string) => {
    dismissAnnouncement(id);
    setDismissedIds((prev) => new Set([...prev, id]));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === 0 ? visibleAnnouncements.length - 1 : prev - 1
    );
  }, [visibleAnnouncements.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
  }, [visibleAnnouncements.length]);

  if (visibleAnnouncements.length === 0) return null;

  const current = visibleAnnouncements[currentIndex];
  if (!current) return null;

  const getLevelConfig = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          containerBg: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          badgeBg: 'bg-red-100 text-red-700',
          titleColor: 'text-red-900',
          contentColor: 'text-red-700',
          icon: AlertTriangle,
        };
      case 'WARNING':
        return {
          containerBg: 'bg-amber-50 border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          badgeBg: 'bg-amber-100 text-amber-700',
          titleColor: 'text-amber-900',
          contentColor: 'text-amber-700',
          icon: AlertTriangle,
        };
      default: // INFO
        return {
          containerBg: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badgeBg: 'bg-blue-100 text-blue-700',
          titleColor: 'text-blue-900',
          contentColor: 'text-blue-700',
          icon: Bell,
        };
    }
  };

  const config = getLevelConfig(current.level);
  const Icon = config.icon;

  return (
    <section className={cn('container mx-auto px-4 pt-4', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current._id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'relative rounded-xl border p-3 sm:p-4',
            config.containerBg
          )}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn('p-2 rounded-lg flex-shrink-0', config.iconBg)}>
              <Icon className={cn('h-4 w-4', config.iconColor)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {current.category && (
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    config.badgeBg
                  )}>
                    {current.category}
                  </span>
                )}
                <h3 className={cn('text-sm font-semibold', config.titleColor)}>
                  {current.title}
                </h3>
              </div>
              {current.content && (
                <p className={cn('text-sm line-clamp-2', config.contentColor)}>
                  {current.content}
                </p>
              )}
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {visibleAnnouncements.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className={cn('p-1.5 rounded-lg transition-colors', config.iconBg, 'hover:opacity-80')}
                    aria-label="Previous"
                  >
                    <ChevronLeft className={cn('h-4 w-4', config.iconColor)} />
                  </button>
                  <span className={cn('text-xs font-medium px-1.5', config.contentColor)}>
                    {currentIndex + 1}/{visibleAnnouncements.length}
                  </span>
                  <button
                    onClick={goToNext}
                    className={cn('p-1.5 rounded-lg transition-colors', config.iconBg, 'hover:opacity-80')}
                    aria-label="Next"
                  >
                    <ChevronRight className={cn('h-4 w-4', config.iconColor)} />
                  </button>
                </>
              )}
              <button
                onClick={() => handleDismiss(current._id)}
                className={cn('p-1.5 rounded-lg transition-colors ml-1', config.iconBg, 'hover:opacity-80')}
                aria-label="Dismiss"
              >
                <X className={cn('h-4 w-4', config.iconColor)} />
              </button>
            </div>
          </div>

          {/* Progress bar for auto-rotation */}
          {visibleAnnouncements.length > 1 && !isPaused && (
            <motion.div
              className={cn('absolute bottom-0 left-0 h-0.5 rounded-b-xl', config.iconBg)}
              style={{ opacity: 0.5 }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 6, ease: 'linear' }}
              key={`progress-${currentIndex}`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
