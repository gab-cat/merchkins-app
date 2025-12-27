import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Id } from '@/convex/_generated/dataModel';

export type GuestCartItem = {
  variantId?: string;
  size?: {
    id: string;
    label: string;
    price?: number;
  };
  productInfo: {
    productId: Id<'products'>;
    organizationId?: Id<'organizations'>;
    organizationName?: string;
    title: string;
    slug: string;
    imageUrl: string[];
    variantName?: string;
    price: number;
    originalPrice?: number;
    inventory: number;
  };
  quantity: number;
  selected: boolean;
  note?: string;
  addedAt: number;
};

interface GuestCartState {
  items: GuestCartItem[];
  addItem: (item: GuestCartItem) => void;
  removeItem: (index: number) => void;
  removeItemByProduct: (productId: string, variantId?: string, sizeId?: string) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateQuantityByProduct: (productId: string, variantId: string | undefined, sizeId: string | undefined, quantity: number) => void;
  updateItemQuantity: (productId: Id<'products'>, quantity: number, variantId?: string, sizeId?: string) => void;
  updateSelected: (index: number, selected: boolean) => void;
  updateSelectedByProduct: (productId: string, variantId: string | undefined, sizeId: string | undefined, selected: boolean) => void;
  updateItemSelection: (productId: Id<'products'>, selected: boolean, variantId?: string, sizeId?: string) => void;
  updateNote: (index: number, note: string | undefined) => void;
  updateItemNote: (productId: Id<'products'>, note: string | undefined, variantId?: string, sizeId?: string) => void;
  updateItemVariant: (
    productId: Id<'products'>,
    oldVariantId: string | undefined,
    newVariantId: string | undefined,
    oldSize: { id: string; label: string; price?: number } | undefined,
    newSize: { id: string; label: string; price?: number } | undefined,
    newPrice?: number,
    newVariantName?: string
  ) => void;
  clear: () => void;
  getTotals: () => {
    totalItems: number;
    selectedItems: number;
    totalValue: number;
    selectedValue: number;
  };
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
        }));
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      removeItemByProduct: (productId, variantId, sizeId) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (String(item.productInfo.productId) !== productId) return true;
            if (variantId && item.variantId !== variantId) return true;
            if (sizeId && item.size?.id !== sizeId) return true;
            return false;
          }),
        }));
      },

      updateQuantity: (index, quantity) => {
        if (quantity <= 0) {
          get().removeItem(index);
          return;
        }
        set((state) => ({
          items: state.items.map((item, i) => (i === index ? { ...item, quantity } : item)),
        }));
      },

      updateQuantityByProduct: (productId, variantId, sizeId, quantity) => {
        if (quantity <= 0) {
          get().removeItemByProduct(productId, variantId, sizeId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (String(item.productInfo.productId) !== productId) return item;
            if (variantId && item.variantId !== variantId) return item;
            if (sizeId && item.size?.id !== sizeId) return item;
            return { ...item, quantity };
          }),
        }));
      },

      updateItemQuantity: (productId, quantity, variantId, sizeId) => {
        get().updateQuantityByProduct(String(productId), variantId, sizeId, quantity);
      },

      updateSelected: (index, selected) => {
        set((state) => ({
          items: state.items.map((item, i) => (i === index ? { ...item, selected } : item)),
        }));
      },

      updateSelectedByProduct: (productId, variantId, sizeId, selected) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (String(item.productInfo.productId) !== productId) return item;
            if (variantId && item.variantId !== variantId) return item;
            if (sizeId && item.size?.id !== sizeId) return item;
            return { ...item, selected };
          }),
        }));
      },

      updateItemSelection: (productId, selected, variantId, sizeId) => {
        get().updateSelectedByProduct(String(productId), variantId, sizeId, selected);
      },

      updateNote: (index, note) => {
        set((state) => ({
          items: state.items.map((item, i) => (i === index ? { ...item, note } : item)),
        }));
      },

      updateItemNote: (productId, note, variantId, sizeId) => {
        set((state) => {
          const itemIndex = state.items.findIndex((item) => {
            if (String(item.productInfo.productId) !== String(productId)) return false;
            if (variantId && item.variantId !== variantId) return false;
            if (sizeId && item.size?.id !== sizeId) return false;
            return true;
          });
          if (itemIndex === -1) return state;
          return {
            items: state.items.map((item, i) => (i === itemIndex ? { ...item, note } : item)),
          };
        });
      },

      updateItemVariant: (productId, oldVariantId, newVariantId, oldSize, newSize, newPrice, newVariantName) => {
        set((state) => {
          const itemIndex = state.items.findIndex((item) => {
            if (String(item.productInfo.productId) !== String(productId)) return false;
            if ((item.variantId ?? null) !== (oldVariantId ?? null)) return false;
            const itemSizeId = item.size?.id ?? null;
            const oldSizeId = oldSize?.id ?? null;
            return itemSizeId === oldSizeId;
          });
          if (itemIndex === -1) return state;
          const item = state.items[itemIndex];
          return {
            items: state.items.map((item, i) => {
              if (i !== itemIndex) return item;
              return {
                ...item,
                variantId: newVariantId,
                size: newSize,
                productInfo: {
                  ...item.productInfo,
                  variantName: newVariantName ?? item.productInfo.variantName,
                  price: newPrice ?? item.productInfo.price,
                },
              };
            }),
          };
        });
      },

      clear: () => {
        set({ items: [] });
      },

      getTotals: () => {
        const items = get().items;
        let totalItems = 0;
        let selectedItems = 0;
        let totalValue = 0;
        let selectedValue = 0;

        for (const item of items) {
          totalItems += item.quantity;
          totalValue += item.productInfo.price * item.quantity;
          if (item.selected) {
            selectedItems += item.quantity;
            selectedValue += item.productInfo.price * item.quantity;
          }
        }

        return {
          totalItems,
          selectedItems,
          totalValue,
          selectedValue,
        };
      },
    }),
    {
      name: 'guest-cart-storage',
    }
  )
);
