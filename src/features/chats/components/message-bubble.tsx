'use client';

import React from 'react';
import type { Doc } from '@/convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: Doc<'chatMessages'>;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const initials =
    `${message.senderInfo.firstName?.[0] || ''}${message.senderInfo.lastName?.[0] || ''}`.trim() || message.senderInfo.email[0]?.toUpperCase() || '?';

  return (
    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <Avatar className="size-7">
          {message.senderInfo.imageUrl && <AvatarImage src={message.senderInfo.imageUrl} alt={message.senderInfo.email} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}
      >
        {message.replyToInfo && (
          <div className="mb-1 rounded border border-border/50 bg-background/50 p-2 text-xs text-muted-foreground">
            <div className="line-clamp-2">{message.replyToInfo.content}</div>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={`mt-1 text-[10px] opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
      {isMe && (
        <Avatar className="size-7">
          {message.senderInfo.imageUrl && <AvatarImage src={message.senderInfo.imageUrl} alt={message.senderInfo.email} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default MessageBubble;
