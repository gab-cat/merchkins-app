'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

interface ChatEmptyStateProps {
  type?: 'no-selection' | 'no-messages' | 'no-rooms';
  onAction?: () => void;
  actionLabel?: string;
}

export function ChatEmptyState({ type = 'no-selection', onAction, actionLabel = 'Start Conversation' }: ChatEmptyStateProps) {
  const content = {
    'no-selection': {
      icon: MessageCircle,
      title: 'Select a conversation',
      description: 'Choose a chat from the sidebar to start messaging',
      showAction: false,
    },
    'no-messages': {
      icon: Sparkles,
      title: 'Start the conversation',
      description: 'Send a message to begin chatting',
      showAction: false,
    },
    'no-rooms': {
      icon: MessageCircle,
      title: 'No conversations yet',
      description: 'Start a chat with an organization or support team',
      showAction: true,
    },
  };

  const config = content[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-sm">
        {/* Animated icon container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mx-auto mb-6"
        >
          {/* Background glow */}
          <div className="absolute inset-0 h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-[#1d43d8]/20 to-[#adfc04]/20 blur-xl" />

          {/* Icon container */}
          <div className="relative h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center border border-[#1d43d8]/10">
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon className="h-10 w-10 text-[#1d43d8]" />
            </motion.div>
          </div>

          {/* Decorative dots */}
          <motion.div
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#adfc04]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-[#1d43d8]/50"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Text content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">{config.title}</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{config.description}</p>
        </motion.div>

        {/* Action button */}
        {config.showAction && onAction && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <Button
              onClick={onAction}
              className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-6 h-10 font-semibold shadow-lg shadow-[#1d43d8]/25 transition-all duration-200 hover:scale-105"
            >
              {actionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Keyboard shortcut hint */}
        {type === 'no-selection' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">⌘</kbd> +{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">K</kbd> to search
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default ChatEmptyState;
