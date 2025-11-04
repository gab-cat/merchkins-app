import React from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { ChatRoom } from '@/src/features/chats/components/chat-room';

export default function Page({ params }: { params: Promise<{ orgSlug: string; id: string }> }) {
  async function Inner() {
    const { id } = await params;
    return <ChatRoom roomId={id as Id<'chatRooms'>} hideSidebar />;
  }
  return <Inner />;
}
