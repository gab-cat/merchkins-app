'use client';

import { ChatwootProvider } from './chatwoot-provider';

const BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';
// Admin-specific Chatwoot widget for sellers and admin queries
const ADMIN_WEBSITE_TOKEN = 'M6oBewdRtApX3EX67jrtTKqE';

export function AdminChatwoot() {
  // Don't instantiate Chatwoot in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <ChatwootProvider
      websiteToken={ADMIN_WEBSITE_TOKEN}
      baseUrl={BASE_URL}
      primaryColor="#1d43d8"
      inbox="admin"
      launcherTitle="Get help from Client Care"
    />
  );
}
