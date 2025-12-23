'use client';

import { MessageSquare } from 'lucide-react';

export function ChatButton() {
  const handleOpenChat = () => {
    if (window.$chatwoot) {
      window.$chatwoot.toggle('open');
    } else {
      // Fallback: open email if Chatwoot is not available
      window.location.href = 'mailto:business@merchkins.com';
    }
  };

  return (
    <button
      onClick={handleOpenChat}
      className="inline-flex items-center gap-2 bg-[#1d43d8] hover:bg-[#1a3bc2] text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
    >
      <MessageSquare className="h-5 w-5" />
      Chat with Us
    </button>
  );
}
