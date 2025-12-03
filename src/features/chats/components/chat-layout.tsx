'use client';

import React, { PropsWithChildren, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Search, 
  Menu, 
  X, 
  Users,
  MoreVertical,
} from 'lucide-react';

interface ChatLayoutProps {
  title: string;
  subtitle?: string;
  sidebar?: React.ReactNode;
  onSearch?: (value: string) => void;
  hideRightHeader?: boolean;
}

export function ChatLayout({ 
  title, 
  subtitle, 
  sidebar, 
  onSearch, 
  hideRightHeader, 
  children 
}: PropsWithChildren<ChatLayoutProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-admin-heading tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">Communicate with your customers</p>
        </div>
      </motion.div>

      {/* Main Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'relative rounded-xl border bg-card overflow-hidden',
          'h-[calc(100vh-12rem)]',
          sidebar ? 'grid grid-cols-1 md:grid-cols-[360px_1fr]' : ''
        )}
      >
        {/* Mobile sidebar toggle */}
        {sidebar && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 left-3 z-20 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}

        {/* Sidebar */}
        {sidebar && (
          <aside className={cn(
            'absolute inset-y-0 left-0 z-10 w-full md:w-[360px] md:static',
            'flex flex-col bg-card border-r',
            'transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}>
            {/* Sidebar Header */}
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Conversations</h2>
              </div>
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search conversations..." 
                    onChange={(e) => onSearch(e.target.value)} 
                    className="pl-9 h-9 bg-muted/50" 
                  />
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <section className="flex flex-col min-h-0 bg-background/50">
          {/* Chat Header */}
          {!hideRightHeader && title && (
            <div className="p-4 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </section>

        {/* Mobile overlay */}
        {sidebar && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[5] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </motion.div>
    </div>
  );
}

export default ChatLayout;
