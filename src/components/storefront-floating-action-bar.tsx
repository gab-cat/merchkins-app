'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MessageSquare, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { useOrgLink } from '@/src/hooks/use-org-link';

interface FloatingActionBarProps {
  orgSlug: string;
}

export function FloatingActionBar({ orgSlug }: FloatingActionBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { userId } = useAuth();
  const { buildOrgLink } = useOrgLink(orgSlug);

  // Get cart count
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, userId ? { clerkId: userId } : 'skip');
  const cartResult = useQuery(api.carts.queries.index.getCartByUser, currentUser?._id ? { userId: currentUser._id } : 'skip');
  const cartCount = cartResult?.totalItems ?? 0;

  // Show bar after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show after scrolling 300px
      setIsVisible(scrollY > 300 && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  // Reset dismissed state after navigating away
  useEffect(() => {
    return () => setIsDismissed(false);
  }, []);

  const actions = [
    {
      icon: Search,
      label: 'Search',
      href: buildOrgLink('/search'),
      color: 'text-slate-600',
    },
    {
      icon: MessageSquare,
      label: 'Chat',
      href: buildOrgLink('/chats'),
      color: 'text-[#1d43d8]',
    },
    {
      icon: ShoppingBag,
      label: 'Cart',
      href: `/cart`,
      color: 'text-emerald-600',
      badge: cartCount > 0 ? cartCount : undefined,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 z-50 md:hidden"
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/95 backdrop-blur-lg border border-slate-200 shadow-xl shadow-slate-900/10">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    'relative flex items-center justify-center h-11 w-11 rounded-full',
                    'transition-all duration-200',
                    'hover:bg-slate-100 active:scale-95',
                    action.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {action.badge && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-[#1d43d8] text-white text-[10px] font-bold">
                      {action.badge > 9 ? '9+' : action.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="flex items-center justify-center h-11 w-11 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
