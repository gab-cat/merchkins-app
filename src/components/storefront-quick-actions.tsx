'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { MessageSquare, Ticket, Search, ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrgLink } from '@/src/hooks/use-org-link';

interface QuickActionsProps {
  orgSlug: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    } as const,
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

interface ActionItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
  hoverBg: string;
}

export function QuickActions({ orgSlug }: QuickActionsProps) {
  const { buildOrgLink } = useOrgLink(orgSlug);

  const actions: ActionItem[] = [
    {
      icon: MessageSquare,
      label: 'Chat with us',
      description: 'Get instant support',
      href: 'https://chat.merchkins.com',
      color: 'text-[#1d43d8]',
      bgColor: 'bg-[#1d43d8]/10',
      hoverBg: 'group-hover:bg-[#1d43d8]',
    },
    {
      icon: Ticket,
      label: 'Create a ticket',
      description: 'Submit a request',
      href: buildOrgLink('/tickets/new'),
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
      hoverBg: 'group-hover:bg-violet-600',
    },
    {
      icon: Search,
      label: 'Browse products',
      description: 'Explore our catalog',
      href: buildOrgLink('/search'),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      hoverBg: 'group-hover:bg-emerald-600',
    },
    {
      icon: ShoppingBag,
      label: 'Your orders',
      description: 'Track purchases',
      href: '/orders',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      hoverBg: 'group-hover:bg-amber-600',
    },
  ];

  return (
    <motion.section
      className="container mx-auto px-3 py-6 sm:py-8 pb-8 sm:pb-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
    >
      {/* Section header */}
      <motion.div className="flex items-center gap-3 mb-4 sm:mb-5" variants={headerVariants}>
        <div className="p-2 rounded-xl bg-slate-100">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading tracking-tight">Quick Actions</h2>
          <p className="text-xs sm:text-sm text-slate-500">Get help or explore more</p>
        </div>
      </motion.div>

      {/* Action cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.label} variants={itemVariants}>
              <Link
                href={action.href}
                className={cn(
                  'group flex flex-col h-full p-3 sm:p-4 rounded-xl',
                  'border border-slate-100 bg-white',
                  'hover:border-slate-200 hover:shadow-md',
                  'transition-all duration-200'
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3',
                    'transition-all duration-300',
                    action.bgColor,
                    action.hoverBg
                  )}
                >
                  <Icon className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5 transition-colors duration-300', action.color, 'group-hover:text-white')} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 mb-0.5 group-hover:text-[#1d43d8] transition-colors">{action.label}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{action.description}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
