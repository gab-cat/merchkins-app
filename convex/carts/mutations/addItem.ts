import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  validateCartExists,
  validateProductExists,
  validatePositiveNumber,
  logAction,
} from "../../helpers";
import { isOrganizationMember } from "../../helpers/organizations";
import { createOrGetCartHandler } from "./createOrGetCart";
import { internal } from "../../_generated/api";

export const addItemArgs = {
  cartId: v.optional(v.id("carts")),
  productId: v.id("products"),
  variantId: v.optional(v.string()),
  quantity: v.number(),
  selected: v.optional(v.boolean()),
  note: v.optional(v.string()),
};

export const addItemHandler = async (
  ctx: MutationCtx,
  args: {
    cartId?: Id<"carts">;
    productId: Id<"products">;
    variantId?: string;
    quantity: number;
    selected?: boolean;
    note?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  validatePositiveNumber(args.quantity, "Quantity");

  // Resolve or create cart
  let cart = null;
  if (args.cartId) {
    cart = await validateCartExists(ctx, args.cartId);
    if (cart.userId !== currentUser._id) {
      throw new Error("Cannot modify another user's cart");
    }
  } else {
    // Try to use user's cart or create a new one
    const newCartId = await createOrGetCartHandler(ctx, { userId: currentUser._id });
    cart = await validateCartExists(ctx, newCartId);
  }

  const product = await validateProductExists(ctx, args.productId);
  if (!product.isActive) {
    throw new Error("Product is not available");
  }

  // Enforce organization visibility for purchasing
  if (product.organizationId) {
    const org = await ctx.db.get(product.organizationId);
    if (org && !org.isDeleted && org.organizationType !== "PUBLIC") {
      const isPrivileged = currentUser.isAdmin || currentUser.isStaff;
      if (!isPrivileged) {
        const member = await isOrganizationMember(
          ctx,
          currentUser._id,
          product.organizationId,
        );
        if (!member) {
          if (org.organizationType === "PRIVATE") {
            throw new Error(
              "Membership required to purchase from this private organization.",
            );
          }
          // SECRET
          throw new Error(
            "This organization is invite-only. You must join via invite to purchase.",
          );
        }
      }
    }
  }

  // Determine price/inventory and variant info
  let price = product.minPrice ?? product.maxPrice ?? product.supposedPrice ?? 0;
  const originalPrice = undefined as number | undefined;
  let variantName = undefined as string | undefined;
  let variantInventory = product.inventory;

  if (args.variantId) {
    const variant = product.variants.find((v) => v.variantId === args.variantId);
    if (!variant) {
      throw new Error("Variant not found");
    }
    if (!variant.isActive) {
      throw new Error("Variant is not available");
    }
    price = variant.price;
    variantName = variant.variantName;
    variantInventory = variant.inventory;
  }

  if (variantInventory <= 0) {
    throw new Error("Item is out of stock");
  }

  const quantityToAdd = Math.min(args.quantity, variantInventory);

  const now = Date.now();
  const selected = args.selected ?? true;
  const note = args.note;

  // Check if item already exists
  // Prefer matching by variantId when provided, fall back to variantName for backward compatibility
  const existingIndex = cart.embeddedItems.findIndex((i) => {
    if (i.productInfo.productId !== product._id) return false;
    const sameVariantId = (i.variantId ?? null) === (args.variantId ?? null);
    const sameVariantName = (i.productInfo.variantName ?? null) === (variantName ?? null);
    return sameVariantId || (!i.variantId && sameVariantName);
  });

  const newItems = [...cart.embeddedItems];
  if (existingIndex >= 0) {
    const existing = newItems[existingIndex];
    const newQuantity = Math.min(existing.quantity + quantityToAdd, variantInventory);
    newItems[existingIndex] = {
      ...existing,
      variantId: args.variantId ?? existing.variantId,
      quantity: newQuantity,
      selected: selected ?? existing.selected,
      note: note ?? existing.note,
      addedAt: now,
    };
  } else {
    newItems.push({
      variantId: args.variantId,
      productInfo: {
        productId: product._id,
        organizationId: product.organizationId,
        organizationName: product.organizationInfo?.name,
        title: product.title,
        slug: product.slug,
        imageUrl: product.imageUrl,
        variantName,
        price,
        originalPrice,
        inventory: variantInventory,
      },
      quantity: quantityToAdd,
      selected,
      note,
      addedAt: now,
    });
  }

  // Recompute cart totals
  let totalItems = 0;
  let selectedItems = 0;
  let totalValue = 0;
  let selectedValue = 0;

  for (const item of newItems) {
    totalItems += item.quantity;
    totalValue += item.productInfo.price * item.quantity;
    if (item.selected) {
      selectedItems += item.quantity;
      selectedValue += item.productInfo.price * item.quantity;
    }
  }

  await ctx.db.patch(cart._id, {
    embeddedItems: newItems,
    totalItems,
    selectedItems,
    totalValue,
    selectedValue,
    lastActivity: now,
    updatedAt: now,
  });

  // Update product variant inCartCount metric via internal mutation
  if (args.variantId) {
    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId: product._id,
      variantUpdates: [
        { variantId: args.variantId, incrementInCart: quantityToAdd },
      ],
    });
  }

  await logAction(
    ctx,
    "add_cart_item",
    "DATA_CHANGE",
    "LOW",
    `Added item to cart: ${product.title}${variantName ? ` (${variantName})` : ""}`,
    currentUser._id,
    undefined,
    { cartId: cart._id, productId: product._id, variantId: args.variantId, quantity: quantityToAdd }
  );

  return cart._id;
};


