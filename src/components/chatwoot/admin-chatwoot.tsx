'use client';

import { ChatwootProvider } from './chatwoot-provider';

const BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';
// Admin-specific Chatwoot widget for sellers and admin queries
const ADMIN_WEBSITE_TOKEN = 'M6oBewdRtApX3EX67jrtTKqE';

export function AdminChatwoot() {
  return <ChatwootProvider websiteToken={ADMIN_WEBSITE_TOKEN} baseUrl={BASE_URL} primaryColor="#1d43d8" inbox="admin" />;
}
