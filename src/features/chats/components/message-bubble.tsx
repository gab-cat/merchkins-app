'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Doc } from '@/convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Reply, Smile, Pin, Copy, Trash2, Check, CheckCheck, FileText } from 'lucide-react';

interface MessageBubbleProps {
  message: Doc<'chatMessages'>;
  isMe: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string, currentlyPinned: boolean) => void;
  onDelete?: (messageId: string) => void;
  showAvatar?: boolean;
}

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function MessageBubble({ message, isMe, onReply, onReact, onPin, onDelete, showAvatar = true }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);

  const initials =
    `${message.senderInfo.firstName?.[0] || ''}${message.senderInfo.lastName?.[0] || ''}`.trim() || message.senderInfo.email[0]?.toUpperCase() || '?';

  const displayName = message.senderInfo.firstName
    ? `${message.senderInfo.firstName} ${message.senderInfo.lastName || ''}`.trim()
    : message.senderInfo.email.split('@')[0];

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const reactions = (message as any).reactions || [];
  const isPinned = (message as any).isPinned;
  const isEdited = (message as any).isEdited;
  const readBy = (message as any).readBy || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('group flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      {/* Avatar */}
      {showAvatar && !isMe && (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          {message.senderInfo.imageUrl && <AvatarImage src={message.senderInfo.imageUrl} alt={displayName} />}
          <AvatarFallback className="text-[10px] font-semibold bg-slate-100 text-slate-600">{initials}</AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for alignment when no avatar */}
      {showAvatar && !isMe ? null : <div className="w-8 shrink-0" />}

      {/* Message content */}
      <div className={cn('flex flex-col max-w-[75%]', isMe && 'items-end')}>
        {/* Sender name for group chats */}
        {!isMe && <span className="text-[10px] font-medium text-slate-500 mb-0.5 ml-2">{displayName}</span>}

        {/* Pinned indicator */}
        {isPinned && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600 mb-1">
            <Pin className="h-3 w-3" />
            <span>Pinned</span>
          </div>
        )}

        {/* Reply preview */}
        {message.replyToInfo && (
          <div
            className={cn(
              'mb-1 ml-2 mr-2 px-2 py-1.5 rounded-lg border-l-2 text-xs',
              isMe ? 'bg-[#1d43d8]/5 border-[#1d43d8]/30 text-slate-600' : 'bg-slate-100 border-slate-300 text-slate-600'
            )}
          >
            <p className="font-medium text-[10px] text-slate-500 mb-0.5">Reply to {message.replyToInfo.senderName || 'message'}</p>
            <p className="line-clamp-1">{message.replyToInfo.content}</p>
          </div>
        )}

        {/* Bubble container */}
        <div className="relative">
          {/* Action buttons */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                className={cn(
                  'absolute -top-8 flex items-center gap-0.5 p-1 rounded-lg bg-white shadow-lg border border-slate-200 z-10',
                  isMe ? 'right-0' : 'left-0'
                )}
              >
                {/* Reaction button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-slate-100"
                    onClick={() => setShowReactions(!showReactions)}
                  >
                    <Smile className="h-3.5 w-3.5 text-slate-500" />
                  </Button>

                  {/* Quick reactions popup */}
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className={cn(
                          'absolute -top-10 flex items-center gap-0.5 p-1 rounded-full bg-white shadow-lg border border-slate-200',
                          isMe ? 'right-0' : 'left-0'
                        )}
                      >
                        {quickReactions.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              onReact?.(String(message._id), emoji);
                              setShowReactions(false);
                            }}
                            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all hover:scale-110"
                          >
                            <span className="text-base">{emoji}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-slate-100" onClick={() => onReply?.(String(message._id))}>
                  <Reply className="h-3.5 w-3.5 text-slate-500" />
                </Button>

                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-slate-100" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-slate-100"
                  onClick={() => onPin?.(String(message._id), isPinned)}
                >
                  <Pin className={cn('h-3.5 w-3.5', isPinned ? 'text-amber-500' : 'text-slate-500')} />
                </Button>

                {isMe && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-red-50" onClick={() => onDelete?.(String(message._id))}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message bubble */}
          <div
            className={cn(
              'px-3.5 py-2 text-sm rounded-2xl',
              isMe ? 'bg-[#1d43d8] text-white rounded-br-md' : 'bg-slate-100 text-slate-900 rounded-bl-md',
              hasAttachments && 'pb-1'
            )}
          >
            {/* Attachments */}
            {hasAttachments && (
              <div className="mb-2 space-y-1.5">
                {message.attachments!.map((attachment, idx) => (
                  <div key={idx} className={cn('rounded-lg overflow-hidden', isMe ? 'bg-white/10' : 'bg-white')}>
                    {attachment.mimeType?.startsWith('image/') ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.name || 'Image'}
                        className="max-w-full max-h-48 rounded-lg object-cover"
                        width={300}
                        height={200}
                        unoptimized
                      />
                    ) : (
                      <Link
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-xs',
                          isMe ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate max-w-32">{attachment.name || 'File'}</span>
                        <span className="text-[10px] opacity-60">{attachment.size ? `${Math.round(attachment.size / 1024)}KB` : ''}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Message text */}
            {message.content && <div className="whitespace-pre-wrap wrap-break-word leading-relaxed">{message.content}</div>}

            {/* Message meta */}
            <div className={cn('flex items-center justify-end gap-1.5 mt-1 text-[10px]', isMe ? 'text-white/60' : 'text-slate-400')}>
              {isEdited && <span>(edited)</span>}
              <span>{formatMessageTime(message.createdAt)}</span>

              {/* Read receipts */}
              {isMe && (
                <span className="ml-0.5">
                  {readBy.length > 0 ? <CheckCheck className="h-3 w-3 text-brand-neon" /> : <Check className="h-3 w-3" />}
                </span>
              )}
            </div>
          </div>

          {/* Reactions display */}
          {reactions.length > 0 && (
            <div className={cn('flex flex-wrap gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
              {reactions.map((reaction: { emoji: string; count: number }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => onReact?.(String(message._id), reaction.emoji)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs hover:bg-slate-200 transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 1 && <span className="text-slate-500 text-[10px]">{reaction.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Avatar for own messages */}
      {showAvatar && isMe && (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          {message.senderInfo.imageUrl && <AvatarImage src={message.senderInfo.imageUrl} alt={displayName} />}
          <AvatarFallback className="text-[10px] font-semibold bg-[#1d43d8]/10 text-[#1d43d8]">{initials}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

export default MessageBubble;
