import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';

// Restore deleted category
export const restoreCategoryArgs = {
  categoryId: v.id('categories'),
};

export const restoreCategoryHandler = async (
  ctx: MutationCtx,
  args: {
    categoryId: Id<'categories'>;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);

  // Get existing category
  const existingCategory = await ctx.db.get(args.categoryId);
  if (!existingCategory) {
    throw new Error('Category not found');
  }

  if (!existingCategory.isDeleted) {
    throw new Error('Category is not deleted');
  }

  // Check permissions
  if (existingCategory.organizationId) {
    await requireOrganizationPermission(ctx, existingCategory.organizationId, 'MANAGE_CATEGORIES', 'create');
  } else {
    // For global categories, only system admins can restore
    if (!currentUser.isAdmin) {
      throw new Error('Only system administrators can restore global categories');
    }
  }

  // Check if slug is still unique
  const slugQuery = existingCategory.organizationId
    ? ctx.db
        .query('categories')
        .withIndex('by_organization', (q) => q.eq('organizationId', existingCategory.organizationId))
        .filter((q) => q.and(q.eq(q.field('slug'), existingCategory.slug), q.eq(q.field('isDeleted'), false)))
    : ctx.db
        .query('categories')
        .withIndex('by_slug', (q) => q.eq('slug', existingCategory.slug))
        .filter((q) => q.and(q.eq(q.field('organizationId'), undefined), q.eq(q.field('isDeleted'), false)));

  const conflictingCategory = await slugQuery.first();
  if (conflictingCategory) {
    throw new Error('Cannot restore: category slug already exists. Please update the slug first.');
  }

  // Check if parent category still exists and is active
  if (existingCategory.parentCategoryId) {
    const parentCategory = await ctx.db.get(existingCategory.parentCategoryId);
    if (!parentCategory || parentCategory.isDeleted) {
      throw new Error('Cannot restore: parent category no longer exists. Please update the parent category first.');
    }
  }

  // Restore category
  await ctx.db.patch(args.categoryId, {
    isDeleted: false,
    updatedAt: Date.now(),
  });

  await logAction(
    ctx,
    'restore_category',
    'DATA_CHANGE',
    'MEDIUM',
    `Restored category: ${existingCategory.name}`,
    currentUser._id,
    existingCategory.organizationId,
    {
      categoryId: args.categoryId,
      categoryName: existingCategory.name,
      categorySlug: existingCategory.slug,
    }
  );

  return { success: true };
};
