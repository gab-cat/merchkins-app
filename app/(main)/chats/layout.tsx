'use client';

import React, { PropsWithChildren } from 'react';

export default function ChatsLayout({ children }: PropsWithChildren) {
  // ChatRoom component already handles its own ChatLayout wrapper
  // This layout just provides a simple container for consistency
  return <>{children}</>;
}
