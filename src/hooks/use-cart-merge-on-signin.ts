'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useGuestCartStore } from '@/src/stores/guest-cart';
import { showToast } from '@/lib/toast';

/**
 * Hook that manages cart merge confirmation dialog and merges guest cart items into server cart when user confirms
 */
export function useCartMergeOnSignIn() {
  const { isSignedIn } = useAuth();
  const guestCart = useGuestCartStore();
  const addGuestItems = useMutation(api.carts.mutations.index.addGuestItems);
  const hasMergedRef = useRef(false);
  const hasDismissedRef = useRef(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    // Show dialog when user signs in with guest cart items (only if not merged and not dismissed)
    if (isSignedIn && !hasMergedRef.current && !hasDismissedRef.current && guestCart.items.length > 0) {
      setShowDialog(true);
    }

    // Reset flags when user signs out
    if (!isSignedIn) {
      hasMergedRef.current = false;
      hasDismissedRef.current = false;
      setShowDialog(false);
    }
  }, [isSignedIn, guestCart.items.length]);

  const handleConfirm = async () => {
    if (guestCart.items.length === 0) {
      setShowDialog(false);
      return;
    }

    setIsMerging(true);
    hasMergedRef.current = true;

    try {
      // Convert guest cart items to the format expected by addGuestItems
      const itemsToMerge = guestCart.items.map((item) => ({
        productId: item.productInfo.productId,
        variantId: item.variantId,
        size: item.size,
        quantity: item.quantity,
        selected: item.selected,
        note: item.note,
      }));

      // Merge items into server cart
      await addGuestItems({ items: itemsToMerge });

      // Clear guest cart after successful merge
      guestCart.clear();
      setShowDialog(false);
      showToast({
        type: 'success',
        title: 'Cart merged',
        description: 'Your guest cart items have been added to your account.',
      });
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
      setShowDialog(false);
      hasMergedRef.current = false;
      showToast({
        type: 'error',
        title: 'Failed to merge cart',
        description: 'Please try again or continue shopping.',
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleCancel = () => {
    hasDismissedRef.current = true;
    setShowDialog(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      hasDismissedRef.current = true;
    }
    setShowDialog(open);
  };

  const handleDiscardItem = (productId: string, variantId?: string, sizeId?: string) => {
    // Check if this is the last item before removing
    const isLastItem = guestCart.items.length === 1;

    guestCart.removeItemByProduct(productId, variantId, sizeId);

    if (isLastItem) {
      hasDismissedRef.current = true;
      setShowDialog(false);
    }
  };

  const handleDiscardAll = () => {
    guestCart.clear();
    hasDismissedRef.current = true;
    setShowDialog(false);
  };

  return {
    showDialog,
    items: guestCart.items,
    isMerging,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    onOpenChange: handleOpenChange,
    onDiscardItem: handleDiscardItem,
    onDiscardAll: handleDiscardAll,
  };
}
