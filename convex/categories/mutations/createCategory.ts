import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import {
  requireAuthentication,
  logAction,
  validateNotEmpty,
  validateStringLength,
  sanitizeString,
  generateSlug,
  validateOrganizationExists,
  requireOrganizationPermission,
} from '../../helpers';

// Create new category
export const createCategoryArgs = {
  organizationId: v.optional(v.id('organizations')),
  name: v.string(),
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
};

export const createCategoryHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<'organizations'>;
    name: string;
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
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);

  // Validate inputs
  validateNotEmpty(args.name, 'Category name');
  validateStringLength(args.name, 'Category name', 2, 100);

  if (args.description) {
    validateStringLength(args.description, 'Category description', 0, 500);
  }

  if (args.seoTitle) {
    validateStringLength(args.seoTitle, 'SEO title', 0, 60);
  }

  if (args.seoDescription) {
    validateStringLength(args.seoDescription, 'SEO description', 0, 160);
  }

  // Sanitize inputs
  const categoryData = {
    name: sanitizeString(args.name),
    description: args.description ? sanitizeString(args.description) : undefined,
    slug: args.slug ? sanitizeString(args.slug.toLowerCase()) : generateSlug(args.name),
    imageUrl: args.imageUrl,
    iconUrl: args.iconUrl,
    color: args.color,
    seoTitle: args.seoTitle ? sanitizeString(args.seoTitle) : undefined,
    seoDescription: args.seoDescription ? sanitizeString(args.seoDescription) : undefined,
    tags: args.tags || [],
    isFeatured: args.isFeatured || false,
    displayOrder: args.displayOrder || 0,
  };

  let organizationInfo = undefined;
  let parentCategoryInfo = undefined;
  let level = 0;

  // Validate organization if provided
  if (args.organizationId) {
    const organization = await validateOrganizationExists(ctx, args.organizationId);

    // Check if user has permission to create categories in this organization
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_CATEGORIES', 'create');

    organizationInfo = {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    };

    // Check if slug is unique within organization
    const existingCategory = await ctx.db
      .query('categories')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .filter((q) => q.and(q.eq(q.field('slug'), categoryData.slug), q.eq(q.field('isDeleted'), false)))
      .first();

    if (existingCategory) {
      throw new Error('Category slug already exists in this organization');
    }
  } else {
    // For global categories, only system admins can create
    if (!currentUser.isAdmin) {
      throw new Error('Only system administrators can create global categories');
    }

    // Check if global slug is unique
    const existingCategory = await ctx.db
      .query('categories')
      .withIndex('by_slug', (q) => q.eq('slug', categoryData.slug))
      .filter((q) => q.and(q.eq(q.field('organizationId'), undefined), q.eq(q.field('isDeleted'), false)))
      .first();

    if (existingCategory) {
      throw new Error('Category slug already exists globally');
    }
  }

  // Validate parent category if provided
  if (args.parentCategoryId) {
    const parentCategory = await ctx.db.get(args.parentCategoryId);

    if (!parentCategory || parentCategory.isDeleted) {
      throw new Error('Parent category not found or inactive');
    }

    // Ensure parent category belongs to same organization (or both are global)
    if (parentCategory.organizationId !== args.organizationId) {
      throw new Error('Parent category must belong to the same organization');
    }

    // Prevent deep nesting (max 3 levels: 0, 1, 2)
    if (parentCategory.level >= 2) {
      throw new Error('Categories can only be nested 3 levels deep');
    }

    level = parentCategory.level + 1;
    parentCategoryInfo = {
      name: parentCategory.name,
    };
  }

  // Create category
  const categoryId = await ctx.db.insert('categories', {
    isDeleted: false,
    organizationId: args.organizationId,
    organizationInfo,
    name: categoryData.name,
    description: categoryData.description,
    parentCategoryId: args.parentCategoryId,
    parentCategoryName: parentCategoryInfo?.name,
    level,
    slug: categoryData.slug,
    imageUrl: categoryData.imageUrl,
    iconUrl: categoryData.iconUrl,
    color: categoryData.color,
    productCount: 0,
    activeProductCount: 0,
    totalOrderCount: 0,
    totalRevenue: 0,
    isActive: true,
    isFeatured: categoryData.isFeatured,
    displayOrder: categoryData.displayOrder,
    seoTitle: categoryData.seoTitle,
    seoDescription: categoryData.seoDescription,
    tags: categoryData.tags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(ctx, 'create_category', 'DATA_CHANGE', 'MEDIUM', `Created category: ${categoryData.name}`, currentUser._id, args.organizationId, {
    categoryId,
    categorySlug: categoryData.slug,
    parentCategoryId: args.parentCategoryId,
    level,
  });

  return categoryId;
};
