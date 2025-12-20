'use client';

import React from 'react';
import { FloatingActionBar } from './storefront-floating-action-bar';
import { OrgChatwoot } from './chatwoot/org-chatwoot';

interface StorefrontClientWrapperProps {
  orgSlug: string;
  children: React.ReactNode;
}

export function StorefrontClientWrapper({ orgSlug, children }: StorefrontClientWrapperProps) {
  return (
    <>
      {children}
      <FloatingActionBar orgSlug={orgSlug} />
      <OrgChatwoot orgSlug={orgSlug} />
    </>
  );
}
