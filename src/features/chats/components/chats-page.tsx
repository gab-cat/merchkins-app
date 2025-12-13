'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Doc } from '@/convex/_generated/dataModel';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { cn } from '@/lib/utils';
import { MessageSquare, Search, Plus, Users, ChevronRight, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { showToast, promiseToast } from '@/lib/toast';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function ChatsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgSlug = useMemo(() => {
    const qp = searchParams?.get('org') || undefined;
    if (qp && qp.trim().length > 0) return qp;
    if (!pathname) return undefined;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname, searchParams]);

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebouncedSearch(search, 300);

  const rooms = useQuery(
    api.chats.queries.index.getChatRooms,
    organization?._id
      ? {
          organizationId: organization._id,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        }
      : debouncedSearch.trim()
        ? { search: debouncedSearch.trim() }
        : {}
  );
  const createChatRoom = useMutation(api.chats.mutations.index.createChatRoom);

  const loading = organization === undefined || rooms === undefined;

  async function handleCreateChat() {
    if (!organization) return;

    try {
      const roomId = await promiseToast(
        createChatRoom({
          type: 'group',
          organizationId: organization._id,
          name: `Support — ${organization.name}`,
        }),
        {
          loading: 'Creating chat room...',
          success: 'Chat room created!',
          error: 'Failed to create chat room',
        }
      );

      router.push(`/chats/${roomId}`);
    } catch {
      showToast({
        type: 'error',
        title: 'Unable to start chat',
        description: 'You may need to join the organization first.',
      });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <BlurFade delay={0.05}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1d43d8]/10">
                <MessageCircle className="h-5 w-5 text-[#1d43d8]" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">Messages</h1>
                <p className="text-slate-500 text-sm">Connect with organizations and support teams</p>
              </div>
            </div>
            {rooms && rooms.length > 0 && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {rooms.length} chat{rooms.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </BlurFade>

        {/* Search & Actions */}
        <BlurFade delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
                  searchFocused ? 'text-[#1d43d8]' : 'text-slate-400'
                )}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search conversations..."
                className={cn(
                  'pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl text-sm',
                  'focus:bg-white focus:border-[#1d43d8]/30 focus:ring-[#1d43d8]/10',
                  'transition-all duration-200'
                )}
              />
            </div>
            {organization && (
              <Button
                onClick={handleCreateChat}
                className="h-11 px-4 bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-xl font-medium shadow-md shadow-[#1d43d8]/25 transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            )}
          </div>
        </BlurFade>

        {/* Chat List */}
        <BlurFade delay={0.15}>
          <div data-testid="chats-list">
            {/* Loading state */}
            {loading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded-full bg-slate-100" />
                      <div className="h-3 w-48 rounded-full bg-slate-100" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && (!rooms || rooms.length === 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                  <div className="relative h-24 w-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1d43d8]/20 to-[#adfc04]/20 blur-xl" />
                    <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center border border-[#1d43d8]/10">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                        <MessageCircle className="h-10 w-10 text-[#1d43d8]" />
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#adfc04]"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  <h2 className="text-lg font-bold mb-2 font-heading text-slate-900">No conversations yet</h2>
                  <p className="text-slate-500 text-sm mb-6">Start a chat with an organization or support team</p>

                  {organization && (
                    <Button
                      onClick={handleCreateChat}
                      className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-6 h-10 font-semibold shadow-lg shadow-[#1d43d8]/25 transition-all hover:scale-105"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Your First Chat
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Chat rooms list */}
            {!loading && rooms && rooms.length > 0 && (
              <AnimatePresence mode="wait">
                <div className="space-y-2">
                  {rooms.map((r: Doc<'chatRooms'>, index: number) => {
                    const displayName = r.name || 'Direct Chat';
                    const initials = displayName
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    const participants = (r.embeddedParticipants || [])
                      .map((p: any) => p.email?.split('@')[0])
                      .slice(0, 2)
                      .join(', ');
                    const isGroup = r.type === 'group' || (r.embeddedParticipants?.length || 0) > 2;

                    return (
                      <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                        <Link href={`/chats/${r._id}`} className="block group">
                          <div
                            className={cn(
                              'flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white',
                              'hover:border-slate-200 hover:shadow-md transition-all duration-200'
                            )}
                          >
                            {/* Avatar */}
                            <div className="relative">
                              <div
                                className={cn(
                                  'h-12 w-12 rounded-full flex items-center justify-center',
                                  'bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10'
                                )}
                              >
                                {isGroup ? (
                                  <Users className="h-5 w-5 text-[#1d43d8]" />
                                ) : (
                                  <span className="text-sm font-semibold text-[#1d43d8]">{initials}</span>
                                )}
                              </div>
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-sm text-slate-900 group-hover:text-[#1d43d8] transition-colors truncate">
                                  {displayName}
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                              <p className="text-xs text-slate-500 truncate">{r.lastMessagePreview || participants || 'No messages yet'}</p>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-col items-end gap-1.5">
                              {r.lastMessageAt && (
                                <span className="text-[10px] font-medium text-slate-400">{formatRelativeTime(r.lastMessageAt)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Search empty state */}
                  {rooms.length === 0 && debouncedSearch.trim() && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                      <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">
                        No conversations match "<span className="font-medium text-slate-700">{debouncedSearch}</span>"
                      </p>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            )}
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
