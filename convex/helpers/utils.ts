import { DataModel } from '../_generated/dataModel';
import { GenericQueryCtx, GenericMutationCtx } from 'convex/server';
import { Id } from '../_generated/dataModel';
import { getOptionalCurrentUser } from './auth';
import { validateOrganizationExists, validateUserExists } from './validation';

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Log an action for audit purposes
 */
export async function logAction(
  ctx: MutationCtx,
  action: string,
  logType:
    | 'USER_ACTION'
    | 'SYSTEM_EVENT'
    | 'SECURITY_EVENT'
    | 'DATA_CHANGE'
    | 'ERROR_EVENT'
    | 'AUDIT_TRAIL',
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  reason: string,
  userId?: Id<'users'>,
  organizationId?: Id<'organizations'>,
  metadata?: Record<string, unknown>,
  extras?: {
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    previousValue?: unknown;
    newValue?: unknown;
    correlationId?: string;
    sessionId?: string;
  }
): Promise<void> {
  const creator = await getOptionalCurrentUser(ctx);

  let userInfo: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  } | undefined;

  let organizationInfo:
    | {
        name: string;
        slug: string;
        logo?: string;
      }
    | undefined;

  if (userId) {
    try {
      const user = await validateUserExists(ctx, userId);
      userInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
      };
    } catch {
      // If user lookup fails, proceed without embedded snapshot
      userInfo = undefined;
    }
  }

  if (organizationId) {
    try {
      const org = await validateOrganizationExists(ctx, organizationId);
      organizationInfo = {
        name: org.name,
        slug: org.slug,
        logo: org.logo,
      };
    } catch {
      organizationInfo = undefined;
    }
  }

  const now = Date.now();
  const sanitizedReason = sanitizeString(reason);
  const sanitizedAction = sanitizeString(action);
  const resourceType = extras?.resourceType
    ? sanitizeString(extras.resourceType)
    : undefined;
  const resourceId = extras?.resourceId
    ? sanitizeString(extras.resourceId)
    : undefined;
  const correlationId = extras?.correlationId
    ? sanitizeString(extras.correlationId)
    : undefined;
  const sessionId = extras?.sessionId
    ? sanitizeString(extras.sessionId)
    : undefined;

  await ctx.db.insert('logs', {
    organizationId,
    userId,
    createdById: creator?._id,
    userInfo,
    creatorInfo: creator
      ? {
          firstName: creator.firstName,
          lastName: creator.lastName,
          email: creator.email,
          imageUrl: creator.imageUrl,
        }
      : undefined,
    organizationInfo,
    createdDate: now,
    reason: sanitizedReason,
    systemText: sanitizedReason,
    userText: sanitizedReason,
    logType,
    severity,
    resourceType,
    resourceId,
    action: sanitizedAction,
    metadata: metadata || {},
    ipAddress: extras?.ipAddress || 'Unknown',
    userAgent: extras?.userAgent || 'Unknown',
    previousValue: extras?.previousValue,
    newValue: extras?.newValue,
    correlationId,
    sessionId,
    isArchived: false,
  });
}

/**
 * Generate a unique slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a slug is unique for organizations
 */
export async function isOrganizationSlugUnique(
  ctx: QueryCtx | MutationCtx,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await ctx.db
    .query("organizations")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .first();
    
  if (!existing) {
    return true;
  }
  
  // If excludeId is provided, allow the slug if it belongs to that organization
  return excludeId ? existing._id === excludeId : false;
}

/**
 * Check if a product slug is unique within an organization
 */
export async function isProductSlugUnique(
  ctx: QueryCtx | MutationCtx,
  slug: string,
  organizationId: Id<"organizations">,
  excludeId?: Id<"products">
): Promise<boolean> {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .filter((q) => q.and(
      q.eq(q.field("slug"), slug),
      q.eq(q.field("isDeleted"), false)
    ))
    .first();
    
  if (!existing) {
    return true;
  }
  
  // If excludeId is provided, allow the slug if it belongs to that product
  return excludeId ? existing._id === excludeId : false;
}

/**
 * Check if a category slug is unique within an organization
 */
export async function isCategorySlugUnique(
  ctx: QueryCtx | MutationCtx,
  slug: string,
  organizationId?: Id<"organizations">,
  excludeId?: Id<"categories">
): Promise<boolean> {
  const query = organizationId
    ? ctx.db.query("categories")
        .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
        .filter((q) => q.and(
          q.eq(q.field("slug"), slug),
          q.eq(q.field("isDeleted"), false)
        ))
    : ctx.db.query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .filter((q) => q.and(
          q.eq(q.field("organizationId"), undefined),
          q.eq(q.field("isDeleted"), false)
        ));
        
  const existing = await query.first();
    
  if (!existing) {
    return true;
  }
  
  // If excludeId is provided, allow the slug if it belongs to that category
  return excludeId ? existing._id === excludeId : false;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100); // Assuming amounts are stored in cents
}

/**
 * Calculate pagination offset
 */
export function calculatePaginationOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit);
}

/**
 * Sanitize string for database storage
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(
  date: number,
  startDate?: number,
  endDate?: number
): boolean {
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

/**
 * Calculate time difference in human readable format
 */
export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  if (diff < month) return `${Math.floor(diff / week)}w ago`;
  if (diff < year) return `${Math.floor(diff / month)}mo ago`;
  return `${Math.floor(diff / year)}y ago`;
}

/**
 * Generate a unique filename for uploads
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
}
