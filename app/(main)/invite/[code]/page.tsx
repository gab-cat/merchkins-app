import React from 'react';
import { AcceptInvitePage } from '@/src/features/organizations/components/accept-invite';

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  async function Inner() {
    const { code } = await params;
    return <AcceptInvitePage code={code} />;
  }
  return <Inner />;
}
