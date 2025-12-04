'use client';

import React from 'react';
import { FloatingActionBar } from './storefront-floating-action-bar';

interface StorefrontClientWrapperProps {
  orgSlug: string;
  children: React.ReactNode;
}

export function StorefrontClientWrapper({ orgSlug, children }: StorefrontClientWrapperProps) {
  return (
    <>
      {children}
      <FloatingActionBar orgSlug={orgSlug} />
    </>
  );
}
