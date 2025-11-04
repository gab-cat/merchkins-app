import { DataModel } from '../_generated/dataModel';
import { GenericQueryCtx, GenericMutationCtx } from 'convex/server';
import { Doc, Id } from '../_generated/dataModel';

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Validate that a user exists and is active
 */
export async function validateUserExists(ctx: QueryCtx | MutationCtx, userId: Id<'users'>): Promise<Doc<'users'>> {
  const user = await ctx.db.get(userId);

  if (!user || user.isDeleted) {
    throw new Error('User not found or inactive');
  }

  return user;
}

/**
 * Validate that an organization exists and is active
 */
export async function validateOrganizationExists(ctx: QueryCtx | MutationCtx, organizationId: Id<'organizations'>): Promise<Doc<'organizations'>> {
  const organization = await ctx.db.get(organizationId);

  if (!organization || organization.isDeleted) {
    throw new Error('Organization not found or inactive');
  }

  return organization;
}

/**
 * Validate that a product exists and is active
 */
export async function validateProductExists(ctx: QueryCtx | MutationCtx, productId: Id<'products'>): Promise<Doc<'products'>> {
  const product = await ctx.db.get(productId);

  if (!product || product.isDeleted) {
    throw new Error('Product not found or inactive');
  }

  return product;
}

/**
 * Validate that an order exists and is active
 */
export async function validateOrderExists(ctx: QueryCtx | MutationCtx, orderId: Id<'orders'>): Promise<Doc<'orders'>> {
  const order = await ctx.db.get(orderId);

  if (!order || order.isDeleted) {
    throw new Error('Order not found or inactive');
  }

  return order;
}

/**
 * Validate that a cart exists and is active
 */
export async function validateCartExists(ctx: QueryCtx | MutationCtx, cartId: Id<'carts'>): Promise<Doc<'carts'>> {
  const cart = await ctx.db.get(cartId);

  if (!cart) {
    throw new Error('Cart not found');
  }

  return cart;
}

/**
 * Validate that a category exists and is active
 */
export async function validateCategoryExists(ctx: QueryCtx | MutationCtx, categoryId: Id<'categories'>): Promise<Doc<'categories'>> {
  const category = await ctx.db.get(categoryId);

  if (!category || category.isDeleted) {
    throw new Error('Category not found or inactive');
  }

  return category;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Must be between 10-15 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Validate that a string is not empty or just whitespace
 */
export function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validate that a number is positive
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
}

/**
 * Validate that a number is non-negative
 */
export function validateNonNegativeNumber(value: number, fieldName: string): void {
  if (value < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }
}

/**
 * Validate string length
 */
export function validateStringLength(value: string, fieldName: string, minLength?: number, maxLength?: number): void {
  if (minLength && value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }

  if (maxLength && value.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
}

/**
 * Validate that an array is not empty
 */
export function validateArrayNotEmpty<T>(array: T[], fieldName: string): void {
  if (!array || array.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}
