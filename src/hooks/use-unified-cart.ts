import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useMemo, useCallback } from 'react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useGuestCartStore, type GuestCartItem } from '@/src/stores/guest-cart';
import { showToast } from '@/lib/toast';

type ProductData = {
  _id: Id<'products'>;
  title: string;
  slug: string;
  imageUrl: string[];
  organizationId?: Id<'organizations'>;
  organizationInfo?: { name: string };
  variants?: Array<{
    variantId: string;
    variantName?: string;
    price: number;
    inventory: number;
    sizes?: Array<{
      id: string;
      label: string;
      price?: number;
      inventory?: number;
    }>;
  }>;
  minPrice?: number;
  maxPrice?: number;
  supposedPrice?: number;
  inventory: number;
  inventoryType: 'STOCK' | 'PREORDER';
};

export function useUnifiedCart() {
  const { isSignedIn } = useAuth();
  const serverCart = useQuery(api.carts.queries.index.getCartByUser, isSignedIn ? {} : 'skip');
  const addItemMutation = useMutation(api.carts.mutations.index.addItem);
  const removeItemMutation = useMutation(api.carts.mutations.index.removeItem);
  const updateItemQuantityMutation = useMutation(api.carts.mutations.index.updateItemQuantity);
  const setItemSelectedMutation = useMutation(api.carts.mutations.index.setItemSelected);
  const setItemNoteMutation = useMutation(api.carts.mutations.index.setItemNote);
  const guestCart = useGuestCartStore();

  // Determine which cart to use
  const isAuthenticated = isSignedIn ?? false;
  const items = useMemo(() => {
    if (isAuthenticated && serverCart) {
      return serverCart.embeddedItems ?? [];
    }
    return guestCart.items;
  }, [isAuthenticated, serverCart, guestCart.items]);

  const totals = useMemo(() => {
    if (isAuthenticated && serverCart) {
      return {
        totalItems: serverCart.totalItems ?? 0,
        totalValue: serverCart.totalValue ?? 0,
        selectedItems: serverCart.selectedItems ?? 0,
        selectedValue: serverCart.selectedValue ?? 0,
      };
    }
    return guestCart.getTotals();
  }, [isAuthenticated, serverCart, guestCart]);

  const addItem = async (
    args: {
      productId: Id<'products'>;
      variantId?: string;
      size?: {
        id: string;
        label: string;
        price?: number;
      };
      quantity: number;
      selected?: boolean;
      note?: string;
    },
    productData?: ProductData
  ) => {
    if (isAuthenticated) {
      // Use server cart mutation
      try {
        await addItemMutation({
          productId: args.productId,
          variantId: args.variantId,
          size: args.size,
          quantity: args.quantity,
          selected: args.selected,
          note: args.note,
        });
        showToast({ type: 'success', title: 'Added to cart' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add to cart';
        showToast({ type: 'error', title: message });
        throw error;
      }
    } else {
      // Use guest cart - require product data
      if (!productData) {
        showToast({ type: 'error', title: 'Product data required for guest checkout' });
        return;
      }

      // Check organization type - only allow PUBLIC orgs for guest checkout
      if (productData.organizationId) {
        // We need to check org type - for now, we'll allow it and validate at checkout
        // In a real implementation, you'd query the org here
      }

      // Determine price and variant info
      let price = productData.minPrice ?? productData.maxPrice ?? productData.supposedPrice ?? 0;
      let variantName: string | undefined;
      let variantInventory = productData.inventory;

      if (args.variantId && productData.variants) {
        const variant = productData.variants.find((v) => v.variantId === args.variantId);
        if (variant) {
          price = variant.price;
          variantName = variant.variantName;
          variantInventory = variant.inventory;

          // Handle size if variant has sizes
          if (args.size && variant.sizes) {
            const selectedSize = variant.sizes.find((s) => s.id === args.size!.id);
            if (selectedSize) {
              if (selectedSize.price !== undefined) {
                price = selectedSize.price;
              }
              if (selectedSize.inventory !== undefined) {
                variantInventory = selectedSize.inventory;
              }
            }
          }
        }
      }

      // Create guest cart item
      const guestItem: GuestCartItem = {
        variantId: args.variantId,
        size: args.size,
        productInfo: {
          productId: productData._id,
          organizationId: productData.organizationId,
          organizationName: productData.organizationInfo?.name,
          title: productData.title,
          slug: productData.slug,
          imageUrl: productData.imageUrl,
          variantName,
          price,
          originalPrice: undefined,
          inventory: variantInventory,
        },
        quantity: args.quantity,
        selected: args.selected ?? true,
        note: args.note,
        addedAt: Date.now(),
      };

      guestCart.addItem(guestItem);
      showToast({ type: 'success', title: 'Added to cart' });
    }
  };

  const removeItem = useCallback(
    async (productId: Id<'products'>, variantId?: string, sizeId?: string) => {
      if (isAuthenticated && serverCart?._id) {
        await removeItemMutation({
          cartId: serverCart._id,
          productId,
          variantId,
          sizeId,
        });
      } else {
        guestCart.removeItem(productId, variantId, sizeId);
      }
    },
    [isAuthenticated, serverCart, removeItemMutation, guestCart]
  );

  const updateItemQuantity = useCallback(
    async (productId: Id<'products'>, quantity: number, variantId?: string, sizeId?: string) => {
      if (isAuthenticated && serverCart?._id) {
        // Find the item to get addedAt
        const item = serverCart.embeddedItems?.find(
          (i) => i.productInfo.productId === productId && i.variantId === variantId && i.size?.id === sizeId
        );
        if (item) {
          await updateItemQuantityMutation({
            cartId: serverCart._id,
            productId,
            variantId,
            sizeId,
            addedAt: item.addedAt,
            quantity,
          });
        }
      } else {
        guestCart.updateItemQuantity(productId, quantity, variantId, sizeId);
      }
    },
    [isAuthenticated, serverCart, updateItemQuantityMutation, guestCart]
  );

  const updateItemSelection = useCallback(
    async (productId: Id<'products'>, selected: boolean, variantId?: string, sizeId?: string) => {
      if (isAuthenticated && serverCart?._id) {
        // Find the item to get addedAt
        const item = serverCart.embeddedItems?.find(
          (i) => i.productInfo.productId === productId && i.variantId === variantId && i.size?.id === sizeId
        );
        if (item) {
          await setItemSelectedMutation({
            cartId: serverCart._id,
            productId,
            variantId,
            sizeId,
            addedAt: item.addedAt,
            selected,
          });
        }
      } else {
        guestCart.updateItemSelection(productId, selected, variantId, sizeId);
      }
    },
    [isAuthenticated, serverCart, setItemSelectedMutation, guestCart]
  );

  const updateItemNote = useCallback(
    async (productId: Id<'products'>, note: string | undefined, variantId?: string, sizeId?: string) => {
      if (isAuthenticated && serverCart?._id) {
        // Find the item to get addedAt
        const item = serverCart.embeddedItems?.find(
          (i) => i.productInfo.productId === productId && i.variantId === variantId && i.size?.id === sizeId
        );
        if (item) {
          await setItemNoteMutation({
            cartId: serverCart._id,
            productId,
            variantId,
            sizeId,
            addedAt: item.addedAt,
            note: note?.trim() || undefined,
          });
        }
      } else {
        guestCart.updateItemNote(productId, note, variantId, sizeId);
      }
    },
    [isAuthenticated, serverCart, setItemNoteMutation, guestCart]
  );

  return {
    items,
    totals,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemSelection,
    updateItemNote,
    isLoading: isAuthenticated ? serverCart === undefined : false,
    isAuthenticated,
  };
}
