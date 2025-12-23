'use client';

import { api } from '@/convex/_generated/api';
import { ChatwootProvider } from './chatwoot-provider';
import { useQuery } from 'convex-helpers/react/cache';

interface OrgChatwootProps {
  orgSlug: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';

export function OrgChatwoot({ orgSlug }: OrgChatwootProps) {
  // Don't instantiate Chatwoot in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  // Don't render if org doesn't exist or hasn't configured Chatwoot tokens
  if (!organization?._id || !organization.chatwootWebsiteToken) {
    return null;
  }

  return (
    <ChatwootProvider
      websiteToken={organization.chatwootWebsiteToken}
      baseUrl={BASE_URL}
      organizationId={organization._id}
      primaryColor={organization.themeSettings?.primaryColor}
    />
  );
}
