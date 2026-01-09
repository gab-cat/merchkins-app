# Permission System

This document describes the permission management system used across the application.

## Overview

The permission system provides fine-grained access control at two levels:

1. **User-level permissions** - Global permissions stored in `users.permissions`
2. **Organization-level permissions** - Scoped permissions stored in `organizationMembers.permissions`

## Permission Codes

All permission codes are defined in `convex/helpers/permissionCodes.ts`:

| Code                   | Category                | Description                                         |
| ---------------------- | ----------------------- | --------------------------------------------------- |
| `MANAGE_ORDERS`        | Order Management        | Create, view, update, and delete orders             |
| `MANAGE_CATEGORIES`    | Product Management      | Create, view, update, and delete product categories |
| `MANAGE_PRODUCTS`      | Product Management      | Create, view, update, and delete products           |
| `MANAGE_VOUCHERS`      | Product Management      | Create, view, update, and delete vouchers           |
| `MANAGE_TICKETS`       | Support                 | View and respond to support tickets                 |
| `MANAGE_ANNOUNCEMENTS` | Communication           | Create, view, update, and delete announcements      |
| `MANAGE_LOGS`          | System Administration   | View and manage system logs                         |
| `MANAGE_PAYMENTS`      | Financial               | View and process payments                           |
| `MANAGE_PAYOUTS`       | Financial               | Configure payout settings and invoices              |
| `MANAGE_REFUNDS`       | Financial               | Approve or reject refund requests                   |
| `MANAGE_STOREFRONT`    | Organization Management | Configure storefront settings                       |

## Permission Actions

Each permission supports four actions:

- `create` - Create new resources
- `read` - View resources
- `update` - Modify existing resources
- `delete` - Remove resources

## Role Hierarchy

1. **System Admin** (`user.isAdmin = true`) - Full access to all operations
2. **Organization Admin** (`role = 'ADMIN'`) - Full access within their organization
3. **Staff** (`role = 'STAFF'`) - Access based on assigned permissions
4. **Member** (`role = 'MEMBER'`) - Limited access, typically read-only

## Usage

### Checking Organization Permission

```typescript
import { requireOrganizationPermission, PERMISSION_CODES } from '../helpers';

// In a mutation handler:
await requireOrganizationPermission(ctx, organizationId, PERMISSION_CODES.MANAGE_VOUCHERS, 'create');
```

### Checking if User Has Permission

```typescript
import { hasOrganizationPermission, getOrganizationMembership, PERMISSION_CODES } from '../helpers';

const membership = await getOrganizationMembership(ctx, userId, organizationId);
if (membership) {
  const canUpdate = await hasOrganizationPermission(membership, PERMISSION_CODES.MANAGE_TICKETS, 'update');
}
```

## Permission Assignment

Permissions are stored in the `organizationMembers.permissions` array:

```typescript
permissions: [
  {
    permissionCode: 'MANAGE_ORDERS',
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
  },
  // ... more permissions
];
```

## Domain-Permission Mapping

| Domain                     | Permission Code        |
| -------------------------- | ---------------------- |
| `orders/*`                 | `MANAGE_ORDERS`        |
| `orderBatches/*`           | `MANAGE_ORDERS`        |
| `categories/*`             | `MANAGE_CATEGORIES`    |
| `products/*`               | `MANAGE_PRODUCTS`      |
| `vouchers/*`               | `MANAGE_VOUCHERS`      |
| `tickets/*`                | `MANAGE_TICKETS`       |
| `announcements/*`          | `MANAGE_ANNOUNCEMENTS` |
| `logs/*`                   | `MANAGE_LOGS`          |
| `payments/*`               | `MANAGE_PAYMENTS`      |
| `payouts/*`                | `MANAGE_PAYOUTS`       |
| `refundRequests/*`         | `MANAGE_REFUNDS`       |
| `storefrontApplications/*` | `MANAGE_STOREFRONT`    |
| `messages/*`               | `MANAGE_TICKETS`       |
| `surveys/*`                | `MANAGE_ORDERS`        |
