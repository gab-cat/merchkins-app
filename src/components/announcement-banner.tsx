'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, AlertTriangle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  category?: string;
  level?: 'INFO' | 'WARNING' | 'CRITICAL';
  publishedAt: number;
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  className?: string;
  autoRotateInterval?: number;
}

const DISMISSED_KEY = 'merchkins_dismissed_announcements';

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    // Clean old dismissals (older than 7 days)
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

export function AnnouncementBanner({ announcements, className, autoRotateInterval = 5000 }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize dismissed IDs on mount
  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  // Filter visible announcements
  const visibleAnnouncements = useMemo(() => {
    return announcements.filter((a) => !dismissedIds.has(a._id));
  }, [announcements, dismissedIds]);

  // Auto-rotate announcements
  useEffect(() => {
    if (visibleAnnouncements.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [visibleAnnouncements.length, autoRotateInterval, isPaused]);

  // Reset index if it goes out of bounds
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
    setCurrentIndex((prev) => (prev === 0 ? visibleAnnouncements.length - 1 : prev - 1));
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
          bg: 'bg-red-600',
          text: 'text-white',
          icon: AlertTriangle,
          badgeBg: 'bg-red-500/30',
          badgeText: 'text-red-100',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-950',
          icon: AlertTriangle,
          badgeBg: 'bg-amber-600/30',
          badgeText: 'text-amber-900',
        };
      default: // INFO
        return {
          bg: 'bg-[#1d43d8]',
          text: 'text-white',
          icon: Info,
          badgeBg: 'bg-white/20',
          badgeText: 'text-white',
        };
    }
  };

  const config = getLevelConfig(current.level);
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current._id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(config.bg, config.text, 'relative overflow-hidden', className)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center gap-3">
            {/* Navigation - Left */}
            {visibleAnnouncements.length > 1 && (
              <button
                onClick={goToPrev}
                className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Content */}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
              <Icon className="h-4 w-4 flex-shrink-0" />

              {current.category && (
                <span
                  className={cn(
                    'hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                    config.badgeBg,
                    config.badgeText
                  )}
                >
                  {current.category}
                </span>
              )}

              <span className="text-sm font-medium truncate">{current.title}</span>

              {current.content && <span className="hidden md:inline text-sm opacity-80 truncate max-w-md">— {current.content}</span>}
            </div>

            {/* Navigation - Right */}
            {visibleAnnouncements.length > 1 && (
              <button
                onClick={goToNext}
                className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Next announcement"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Counter */}
            {visibleAnnouncements.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 text-xs opacity-70 flex-shrink-0 ml-2">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{visibleAnnouncements.length}</span>
              </div>
            )}

            {/* Dismiss button */}
            <button
              onClick={() => handleDismiss(current._id)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar for auto-rotation */}
        {visibleAnnouncements.length > 1 && !isPaused && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-white/30"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: autoRotateInterval / 1000, ease: 'linear' }}
            key={`progress-${currentIndex}`}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
