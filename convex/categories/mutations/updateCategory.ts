import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import {
  requireAuthentication,
  logAction,
  validateNotEmpty,
  validateStringLength,
  sanitizeString,
  requireOrganizationPermission,
} from '../../helpers';

// Update category
export const updateCategoryArgs = {
  categoryId: v.id('categories'),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  parentCategoryId: v.optional(v.id('categories')),
  slug: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  iconUrl: v.optional(v.string()),
  color: v.optional(v.string()),
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  isFeatured: v.optional(v.boolean()),
  displayOrder: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
};

export const updateCategoryHandler = async (
  ctx: MutationCtx,
  args: {
    categoryId: Id<'categories'>;
    name?: string;
    description?: string;
    parentCategoryId?: Id<'categories'>;
    slug?: string;
    imageUrl?: string;
    iconUrl?: string;
    color?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    isFeatured?: boolean;
    displayOrder?: number;
    isActive?: boolean;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);

  // Get existing category
  const existingCategory = await ctx.db.get(args.categoryId);
  if (!existingCategory || existingCategory.isDeleted) {
    throw new Error('Category not found or inactive');
  }

  // Check permissions
  if (existingCategory.organizationId) {
    await requireOrganizationPermission(ctx, existingCategory.organizationId, 'MANAGE_CATEGORIES', 'update');
  } else {
    // For global categories, only system admins can update
    if (!currentUser.isAdmin) {
      throw new Error('Only system administrators can update global categories');
    }
  }

  // Prepare update data
  const updateData: Partial<typeof existingCategory> = {
    updatedAt: Date.now(),
  };

  // Validate and update fields if provided
  if (args.name !== undefined) {
    validateNotEmpty(args.name, 'Category name');
    validateStringLength(args.name, 'Category name', 2, 100);
    updateData.name = sanitizeString(args.name);
  }

  if (args.description !== undefined) {
    if (args.description) {
      validateStringLength(args.description, 'Category description', 0, 500);
      updateData.description = sanitizeString(args.description);
    } else {
      updateData.description = undefined;
    }
  }

  if (args.slug !== undefined) {
    validateNotEmpty(args.slug, 'Category slug');
    const newSlug = sanitizeString(args.slug.toLowerCase());

    // Check if new slug is unique
    if (newSlug !== existingCategory.slug) {
      const slugQuery = existingCategory.organizationId
        ? ctx.db
            .query('categories')
            .withIndex('by_organization', (q) => q.eq('organizationId', existingCategory.organizationId))
            .filter((q) => q.and(q.eq(q.field('slug'), newSlug), q.eq(q.field('isDeleted'), false), q.neq(q.field('_id'), args.categoryId)))
        : ctx.db
            .query('categories')
            .withIndex('by_slug', (q) => q.eq('slug', newSlug))
            .filter((q) =>
              q.and(q.eq(q.field('organizationId'), undefined), q.eq(q.field('isDeleted'), false), q.neq(q.field('_id'), args.categoryId))
            );

      const conflictingCategory = await slugQuery.first();
      if (conflictingCategory) {
        throw new Error('Category slug already exists');
      }
    }

    updateData.slug = newSlug;
  }

  if (args.seoTitle !== undefined) {
    if (args.seoTitle) {
      validateStringLength(args.seoTitle, 'SEO title', 0, 60);
      updateData.seoTitle = sanitizeString(args.seoTitle);
    } else {
      updateData.seoTitle = undefined;
    }
  }

  if (args.seoDescription !== undefined) {
    if (args.seoDescription) {
      validateStringLength(args.seoDescription, 'SEO description', 0, 160);
      updateData.seoDescription = sanitizeString(args.seoDescription);
    } else {
      updateData.seoDescription = undefined;
    }
  }

  // Handle parent category change
  if (args.parentCategoryId !== undefined) {
    let newLevel = 0;
    let parentCategoryName = undefined;

    if (args.parentCategoryId) {
      const parentCategory = await ctx.db.get(args.parentCategoryId);

      if (!parentCategory || parentCategory.isDeleted) {
        throw new Error('Parent category not found or inactive');
      }

      // Ensure parent category belongs to same organization
      if (parentCategory.organizationId !== existingCategory.organizationId) {
        throw new Error('Parent category must belong to the same organization');
      }

      // Prevent circular references
      if (parentCategory._id === args.categoryId) {
        throw new Error('Category cannot be its own parent');
      }

      // Check if this would create a circular reference by checking if the current category
      // is an ancestor of the proposed parent
      let checkCategory = parentCategory;
      while (checkCategory.parentCategoryId) {
        if (checkCategory.parentCategoryId === args.categoryId) {
          throw new Error('This would create a circular reference');
        }
        const nextCategory = await ctx.db.get(checkCategory.parentCategoryId);
        if (!nextCategory) break;
        checkCategory = nextCategory;
      }

      // Prevent deep nesting (max 3 levels: 0, 1, 2)
      if (parentCategory.level >= 2) {
        throw new Error('Categories can only be nested 3 levels deep');
      }

      newLevel = parentCategory.level + 1;
      parentCategoryName = parentCategory.name;
    }

    updateData.parentCategoryId = args.parentCategoryId;
    updateData.parentCategoryName = parentCategoryName;
    updateData.level = newLevel;
  }

  // Update simple fields
  if (args.imageUrl !== undefined) updateData.imageUrl = args.imageUrl;
  if (args.iconUrl !== undefined) updateData.iconUrl = args.iconUrl;
  if (args.color !== undefined) updateData.color = args.color;
  if (args.tags !== undefined) updateData.tags = args.tags;
  if (args.isFeatured !== undefined) updateData.isFeatured = args.isFeatured;
  if (args.displayOrder !== undefined) updateData.displayOrder = args.displayOrder;
  if (args.isActive !== undefined) updateData.isActive = args.isActive;

  // Update category
  await ctx.db.patch(args.categoryId, updateData);

  // If level changed, we need to update all descendants recursively
  if (updateData.level !== undefined && updateData.level !== existingCategory.level) {
    await updateDescendantLevels(ctx, args.categoryId, updateData.level);
  }

  // Log the action
  await logAction(
    ctx,
    'update_category',
    'DATA_CHANGE',
    'MEDIUM',
    `Updated category: ${updateData.name || existingCategory.name}`,
    currentUser._id,
    existingCategory.organizationId,
    {
      categoryId: args.categoryId,
      changes: Object.keys(updateData).filter((key) => key !== 'updatedAt'),
    }
  );

  return args.categoryId;
};

// Helper function to update descendant levels recursively
async function updateDescendantLevels(ctx: MutationCtx, parentCategoryId: Id<'categories'>, parentLevel: number): Promise<void> {
  const children = await ctx.db
    .query('categories')
    .withIndex('by_parent', (q) => q.eq('parentCategoryId', parentCategoryId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  for (const child of children) {
    const newLevel = parentLevel + 1;
    await ctx.db.patch(child._id, {
      level: newLevel,
      updatedAt: Date.now(),
    });

    // Recursively update grandchildren
    await updateDescendantLevels(ctx, child._id, newLevel);
  }
}
