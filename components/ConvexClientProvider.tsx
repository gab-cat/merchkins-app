'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useAuth } from '@clerk/nextjs';
import { useCartMergeOnSignIn } from '@/src/hooks/use-cart-merge-on-signin';
import { CartMergeConfirmationDialog } from '@/src/components/cart-merge-confirmation-dialog';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function CartMergeHandler() {
  const { showDialog, items, isMerging, onConfirm, onCancel, onOpenChange } = useCartMergeOnSignIn();

  return <CartMergeConfirmationDialog open={showDialog} onOpenChange={onOpenChange} items={items} onConfirm={onConfirm} isMerging={isMerging} />;
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <CartMergeHandler />
      {children}
    </ConvexProviderWithClerk>
  );
}
