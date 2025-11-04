'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    const content = value.trim();
    if (!content || busy || disabled) return;
    setBusy(true);
    try {
      await onSend(content);
      setValue('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 p-3">
      <Input
        placeholder="Type a message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
      />
      <Button onClick={handleSend} disabled={busy || disabled || !value.trim()}>
        Send
      </Button>
    </div>
  );
}

export default ChatInput;
