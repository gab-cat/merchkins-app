import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAuthentication, 
  logAction, 
  validateProductExists,
  requireOrganizationPermission
} from "../../helpers";

// Bulk update product inventory
export const bulkUpdateInventoryArgs = {
  updates: v.array(v.object({
    productId: v.id("products"),
    variantId: v.optional(v.string()),
    newInventory: v.number(),
  })),
};

export const bulkUpdateInventoryHandler = async (
  ctx: MutationCtx,
  args: {
    updates: Array<{
      productId: Id<"products">;
      variantId?: string;
      newInventory: number;
    }>;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  if (args.updates.length === 0) {
    throw new Error("No updates provided");
  }
  
  if (args.updates.length > 100) {
    throw new Error("Too many updates. Maximum 100 updates per batch.");
  }
  
  const results = [];
  const errors = [];
  
  for (const update of args.updates) {
    try {
      // Validate product exists
      const product = await validateProductExists(ctx, update.productId);
      
      // Check permissions
      if (product.organizationId) {
        await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "update");
      } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
        throw new Error("Permission denied");
      }
      
      if (update.newInventory < 0) {
        throw new Error("Inventory cannot be negative");
      }
      
      if (update.variantId) {
        // Update specific variant inventory
        const variantIndex = product.variants.findIndex(v => v.variantId === update.variantId);
        
        if (variantIndex === -1) {
          throw new Error("Variant not found");
        }
        
        const updatedVariants = [...product.variants];
        const oldInventory = updatedVariants[variantIndex].inventory;
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          inventory: update.newInventory,
          updatedAt: Date.now(),
        };
        
        const inventoryDiff = update.newInventory - oldInventory;
        
        await ctx.db.patch(update.productId, {
          variants: updatedVariants,
          inventory: Math.max(0, product.inventory + inventoryDiff),
          updatedAt: Date.now(),
        });
        
      } else {
        // Update total product inventory
        await ctx.db.patch(update.productId, {
          inventory: update.newInventory,
          updatedAt: Date.now(),
        });
      }
      
      results.push({
        productId: update.productId,
        variantId: update.variantId,
        success: true,
      });
      
    } catch (error) {
      errors.push({
        productId: update.productId,
        variantId: update.variantId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  
  // Log the bulk action
  await logAction(
    ctx,
    "bulk_update_inventory",
    "DATA_CHANGE",
    "MEDIUM",
    `Bulk updated inventory for ${results.length} items`,
    currentUser._id,
    undefined,
    { 
      successCount: results.length,
      errorCount: errors.length,
      totalUpdates: args.updates.length
    }
  );
  
  return {
    results,
    errors,
    summary: {
      total: args.updates.length,
      successful: results.length,
      failed: errors.length,
    }
  };
};

// Bulk update product prices
export const bulkUpdatePricesArgs = {
  updates: v.array(v.object({
    productId: v.id("products"),
    variantId: v.string(),
    newPrice: v.number(),
  })),
};

export const bulkUpdatePricesHandler = async (
  ctx: MutationCtx,
  args: {
    updates: Array<{
      productId: Id<"products">;
      variantId: string;
      newPrice: number;
    }>;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  if (args.updates.length === 0) {
    throw new Error("No updates provided");
  }
  
  if (args.updates.length > 100) {
    throw new Error("Too many updates. Maximum 100 updates per batch.");
  }
  
  const results = [];
  const errors = [];
  
  for (const update of args.updates) {
    try {
      // Validate product exists
      const product = await validateProductExists(ctx, update.productId);
      
      // Check permissions
      if (product.organizationId) {
        await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "update");
      } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
        throw new Error("Permission denied");
      }
      
      if (update.newPrice <= 0) {
        throw new Error("Price must be positive");
      }
      
      // Update specific variant price
      const variantIndex = product.variants.findIndex(v => v.variantId === update.variantId);
      
      if (variantIndex === -1) {
        throw new Error("Variant not found");
      }
      
      const updatedVariants = [...product.variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        price: update.newPrice,
        updatedAt: Date.now(),
      };
      
      // Recalculate min/max prices
      const variantPrices = updatedVariants.map(v => v.price);
      
      await ctx.db.patch(update.productId, {
        variants: updatedVariants,
        minPrice: Math.min(...variantPrices),
        maxPrice: Math.max(...variantPrices),
        updatedAt: Date.now(),
      });
      
      results.push({
        productId: update.productId,
        variantId: update.variantId,
        success: true,
      });
      
    } catch (error) {
      errors.push({
        productId: update.productId,
        variantId: update.variantId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  
  // Log the bulk action
  await logAction(
    ctx,
    "bulk_update_prices",
    "DATA_CHANGE",
    "MEDIUM",
    `Bulk updated prices for ${results.length} variants`,
    currentUser._id,
    undefined,
    { 
      successCount: results.length,
      errorCount: errors.length,
      totalUpdates: args.updates.length
    }
  );
  
  return {
    results,
    errors,
    summary: {
      total: args.updates.length,
      successful: results.length,
      failed: errors.length,
    }
  };
};
