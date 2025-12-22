'use client';

import { ChatwootProvider } from './chatwoot-provider';

const BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';
const WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'UakrRi1963wGUyMxXa8YmGLA';

export function PlatformChatwoot() {
  if (!WEBSITE_TOKEN) {
    return null;
  }

  return <ChatwootProvider websiteToken={WEBSITE_TOKEN} baseUrl={BASE_URL} primaryColor="#1d43d8" />;
}

