'use client';

import React, { PropsWithChildren, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { MessageSquare, Search, Menu, X, Users, Phone, Video, Info, ChevronLeft } from 'lucide-react';

interface ChatLayoutProps {
  title: string;
  subtitle?: string;
  sidebar?: React.ReactNode;
  onSearch?: (value: string) => void;
  hideRightHeader?: boolean;
  avatarUrl?: string;
  isOnline?: boolean;
}

export function ChatLayout({
  title,
  subtitle,
  sidebar,
  onSearch,
  hideRightHeader,
  avatarUrl,
  isOnline,
  children,
}: PropsWithChildren<ChatLayoutProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <BlurFade delay={0.05}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1d43d8]/10">
              <MessageSquare className="h-5 w-5 text-[#1d43d8]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">Messages</h1>
              <p className="text-slate-500 text-sm">Connect and communicate</p>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Main Chat Container */}
      <BlurFade delay={0.1}>
        <div
          className={cn(
            'relative rounded-2xl border border-slate-200 bg-white overflow-hidden',
            'h-[calc(100vh-12rem)]',
            sidebar ? 'grid grid-cols-1 md:grid-cols-[340px_1fr]' : ''
          )}
        >
          {/* Mobile sidebar toggle */}
          {sidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 z-20 md:hidden h-9 w-9 rounded-full bg-white shadow-md border border-slate-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <AnimatePresence mode="wait">
                {sidebarOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}

          {/* Sidebar */}
          {sidebar && (
            <aside
              className={cn(
                'absolute inset-y-0 left-0 z-10 w-full md:w-[340px] md:static',
                'flex flex-col bg-white border-r border-slate-100',
                'transition-transform duration-300 ease-out',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              )}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-100 space-y-3 bg-linear-to-b from-slate-50/80 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">Chats</h2>
                  </div>
                </div>

                {onSearch && (
                  <div className="relative">
                    <Search
                      className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200',
                        searchFocused ? 'text-[#1d43d8]' : 'text-slate-400'
                      )}
                    />
                    <Input
                      placeholder="Search conversations..."
                      onChange={(e) => onSearch(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className={cn(
                        'pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm',
                        'focus:bg-white focus:border-[#1d43d8]/30 focus:ring-[#1d43d8]/10',
                        'transition-all duration-200'
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-2">{sidebar}</div>
            </aside>
          )}

          {/* Main Chat Area */}
          <section className="flex flex-col min-h-0 bg-slate-50/50">
            {/* Chat Header */}
            {!hideRightHeader && title && (
              <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-full" onClick={() => setSidebarOpen(true)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#1d43d8]/10 to-brand-neon/10 flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={title} className="h-full w-full object-cover" width={40} height={40} />
                      ) : (
                        <Users className="h-5 w-5 text-[#1d43d8]" />
                      )}
                    </div>
                    {isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />}
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
                    {subtitle ? (
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{subtitle}</p>
                    ) : (
                      isOnline !== undefined && (
                        <p className={cn('text-xs', isOnline ? 'text-emerald-600' : 'text-slate-400')}>{isOnline ? 'Online' : 'Offline'}</p>
                      )
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </section>

          {/* Mobile overlay */}
          <AnimatePresence>
            {sidebar && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-5 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </BlurFade>
    </div>
  );
}

export default ChatLayout;
