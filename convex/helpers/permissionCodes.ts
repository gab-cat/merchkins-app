/**
 * Permission Code Constants
 *
 * Centralized definition of all permission codes used across the application.
 * These codes are stored in organizationMembers.permissions array.
 */

export const PERMISSION_CODES = {
  // Order and Fulfillment
  MANAGE_ORDERS: 'MANAGE_ORDERS',
  MANAGE_CATEGORIES: 'MANAGE_CATEGORIES',

  // Products and Inventory
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
  MANAGE_VOUCHERS: 'MANAGE_VOUCHERS',

  // Support and Communication
  MANAGE_TICKETS: 'MANAGE_TICKETS',
  MANAGE_ANNOUNCEMENTS: 'MANAGE_ANNOUNCEMENTS',
  MANAGE_LOGS: 'MANAGE_LOGS',

  // Financial
  MANAGE_PAYMENTS: 'MANAGE_PAYMENTS',
  MANAGE_PAYOUTS: 'MANAGE_PAYOUTS',
  MANAGE_REFUNDS: 'MANAGE_REFUNDS',

  // Storefront
  MANAGE_STOREFRONT: 'MANAGE_STOREFRONT',

  // Organization Management
  MANAGE_ORGANIZATION: 'MANAGE_ORGANIZATION',
  MANAGE_MEMBERS: 'MANAGE_MEMBERS',
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

/**
 * Permission action types
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Default permissions for each role
 * ADMIN: Full access to all permissions
 * STAFF: Read/Update access, limited Create/Delete
 * MEMBER: Read-only for most, self-service for own data
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
  },
  STAFF: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
  },
  MEMBER: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
  },
} as const;

/**
 * Permission metadata for UI display and categorization
 */
export const PERMISSION_METADATA: Record<
  PermissionCode,
  {
    name: string;
    description: string;
    category: string;
  }
> = {
  MANAGE_ORDERS: {
    name: 'Manage Orders',
    description: 'Create, view, update, and delete orders',
    category: 'Order Management',
  },
  MANAGE_CATEGORIES: {
    name: 'Manage Categories',
    description: 'Create, view, update, and delete product categories',
    category: 'Product Management',
  },
  MANAGE_PRODUCTS: {
    name: 'Manage Products',
    description: 'Create, view, update, and delete products',
    category: 'Product Management',
  },
  MANAGE_VOUCHERS: {
    name: 'Manage Vouchers',
    description: 'Create, view, update, and delete vouchers and promotions',
    category: 'Product Management',
  },
  MANAGE_TICKETS: {
    name: 'Manage Tickets',
    description: 'View and respond to support tickets',
    category: 'Support',
  },
  MANAGE_ANNOUNCEMENTS: {
    name: 'Manage Announcements',
    description: 'Create, view, update, and delete announcements',
    category: 'Communication',
  },
  MANAGE_LOGS: {
    name: 'Manage Logs',
    description: 'View and manage system logs',
    category: 'System Administration',
  },
  MANAGE_PAYMENTS: {
    name: 'Manage Payments',
    description: 'View and process payments',
    category: 'Financial',
  },
  MANAGE_PAYOUTS: {
    name: 'Manage Payouts',
    description: 'Configure payout settings and view payout invoices',
    category: 'Financial',
  },
  MANAGE_REFUNDS: {
    name: 'Manage Refunds',
    description: 'Approve or reject refund requests',
    category: 'Financial',
  },
  MANAGE_STOREFRONT: {
    name: 'Manage Storefront',
    description: 'Configure storefront settings and applications',
    category: 'Organization Management',
  },
  MANAGE_ORGANIZATION: {
    name: 'Manage Organization',
    description: 'Update organization name, slug, logo, and theme settings',
    category: 'Organization Management',
  },
  MANAGE_MEMBERS: {
    name: 'Manage Members',
    description: 'Invite members, remove members, and manage roles/permissions',
    category: 'Organization Management',
  },
};
