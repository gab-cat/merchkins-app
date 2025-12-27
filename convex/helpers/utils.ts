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
  logType: 'USER_ACTION' | 'SYSTEM_EVENT' | 'SECURITY_EVENT' | 'DATA_CHANGE' | 'ERROR_EVENT' | 'AUDIT_TRAIL',
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

  let userInfo:
    | {
        firstName?: string;
        lastName?: string;
        email: string;
        imageUrl?: string;
      }
    | undefined;

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
  const resourceType = extras?.resourceType ? sanitizeString(extras.resourceType) : undefined;
  const resourceId = extras?.resourceId ? sanitizeString(extras.resourceId) : undefined;
  const correlationId = extras?.correlationId ? sanitizeString(extras.correlationId) : undefined;
  const sessionId = extras?.sessionId ? sanitizeString(extras.sessionId) : undefined;

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
 * Security constants for checkout sessions
 */
export const CHECKOUT_SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const INVOICE_CREATION_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_INVOICE_CREATION_ATTEMPTS = 5; // Maximum attempts per rate window

/**
 * Validate UUIDv4 format
 * UUIDv4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * where x is any hexadecimal digit and y is one of 8, 9, A, or B
 */
export function validateUUIDv4(uuid: string): boolean {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}

/**
 * Check rate limiting for invoice creation attempts
 * @param attempts Current number of attempts
 * @param lastAttempt Timestamp of last attempt (optional)
 * @param windowMs Rate limiting window in milliseconds
 * @param maxAttempts Maximum allowed attempts per window
 * @returns Object with allowed status and remaining attempts
 */
export function checkRateLimit(
  attempts: number,
  lastAttempt: number | undefined,
  windowMs: number,
  maxAttempts: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // If no previous attempt, allow
  if (!lastAttempt) {
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // If last attempt was outside the window, reset
  if (now - lastAttempt >= windowMs) {
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Check if within rate limit
  if (attempts >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxAttempts - attempts - 1 };
}

/**
 * Mask checkoutId for logging (show first 8 chars + ... + last 4 chars)
 * Prevents exposing full token in logs
 */
export function maskCheckoutId(checkoutId: string): string {
  if (checkoutId.length <= 12) {
    return '***';
  }
  return `${checkoutId.substring(0, 8)}...${checkoutId.substring(checkoutId.length - 4)}`;
}

/**
 * Check if a slug is unique for organizations
 */
export async function isOrganizationSlugUnique(ctx: QueryCtx | MutationCtx, slug: string, excludeId?: string): Promise<boolean> {
  const existing = await ctx.db
    .query('organizations')
    .withIndex('by_slug', (q) => q.eq('slug', slug))
    .filter((q) => q.eq(q.field('isDeleted'), false))
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
  organizationId: Id<'organizations'>,
  excludeId?: Id<'products'>
): Promise<boolean> {
  const existing = await ctx.db
    .query('products')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .filter((q) => q.and(q.eq(q.field('slug'), slug), q.eq(q.field('isDeleted'), false)))
    .first();

  if (!existing) {
    return true;
  }

  // If excludeId is provided, allow the slug if it belongs to that product
  return excludeId ? existing._id === excludeId : false;
}

/**
 * Check if a product code is globally unique (codes are not scoped to organizations)
 */
export async function isProductCodeUnique(ctx: QueryCtx | MutationCtx, code: string, excludeId?: Id<'products'>): Promise<boolean> {
  const existing = await ctx.db
    .query('products')
    .withIndex('by_code', (q) => q.eq('code', code))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (!existing) {
    return true;
  }

  // If excludeId is provided, allow the code if it belongs to that product
  return excludeId ? existing._id === excludeId : false;
}

/**
 * Check if a category slug is unique within an organization
 */
export async function isCategorySlugUnique(
  ctx: QueryCtx | MutationCtx,
  slug: string,
  organizationId?: Id<'organizations'>,
  excludeId?: Id<'categories'>
): Promise<boolean> {
  const query = organizationId
    ? ctx.db
        .query('categories')
        .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
        .filter((q) => q.and(q.eq(q.field('slug'), slug), q.eq(q.field('isDeleted'), false)))
    : ctx.db
        .query('categories')
        .withIndex('by_slug', (q) => q.eq('slug', slug))
        .filter((q) => q.and(q.eq(q.field('organizationId'), undefined), q.eq(q.field('isDeleted'), false)));

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
export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
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
export function isDateInRange(date: number, startDate?: number, endDate?: number): boolean {
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
 * Build public URL from R2 file key
 * Returns deterministic public URL using r2.merchkins.com domain
 */
export function buildPublicUrl(key: string): string | null {
  if (!key) return null;

  // If it's already a full URL, return as-is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  // Use hardcoded public domain, fallback to environment variable
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://r2.merchkins.com';
  if (baseUrl) {
    return `${baseUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
  }

  // Return null if no public URL base is configured
  // Caller should use r2.getUrl() for signed URLs instead
  return null;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge((result[key] as Record<string, unknown>) || {}, source[key] as Record<string, unknown>) as T[Extract<keyof T, string>];
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Monetary refund delay period for seller-initiated cancellations
 * Refund vouchers become eligible for monetary refund after this period
 */
export const MONETARY_REFUND_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

/**
 * Validate if a seller-initiated voucher is eligible for monetary refund
 * Returns an object with eligibility status and days remaining if not eligible
 */
export function validateMonetaryRefundEligibility(
  cancellationInitiator: 'CUSTOMER' | 'SELLER' | undefined,
  monetaryRefundEligibleAt: number | undefined,
  usedCount: number,
  createdAt: number
): {
  isEligible: boolean;
  daysRemaining?: number;
  error?: string;
} {
  // Only seller-initiated vouchers are eligible
  if (cancellationInitiator !== 'SELLER') {
    return {
      isEligible: false,
      error: 'Only vouchers from seller-initiated cancellations are eligible for monetary refunds',
    };
  }

  // Voucher must be unused
  if (usedCount > 0) {
    return {
      isEligible: false,
      error: 'Cannot request monetary refund for a voucher that has already been used',
    };
  }

  // Calculate eligibility timestamp if not set
  const eligibleAt = monetaryRefundEligibleAt ?? createdAt + MONETARY_REFUND_DELAY_MS;
  const now = Date.now();

  if (now < eligibleAt) {
    const daysRemaining = Math.ceil((eligibleAt - now) / (24 * 60 * 60 * 1000));
    return {
      isEligible: false,
      daysRemaining,
      error: `Monetary refund will be available in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
    };
  }

  return {
    isEligible: true,
  };
}

/**
 * Calculate monetary refund eligible timestamp for seller-initiated vouchers
 */
export function calculateMonetaryRefundEligibleAt(cancellationInitiator: 'CUSTOMER' | 'SELLER' | undefined, createdAt: number): number | undefined {
  if (cancellationInitiator === 'SELLER') {
    return createdAt + MONETARY_REFUND_DELAY_MS;
  }
  return undefined;
}
