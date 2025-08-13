# Convex Helper Functions

This directory contains comprehensive helper functions for authentication, authorization, permission checking, validation, and utility operations across the Convex backend.

## Overview

The helper functions are organized into several categories:

- **Authentication (`auth.ts`)** - User authentication and session management
- **Permissions (`permissions.ts`)** - Fine-grained permission checking
- **Organizations (`organizations.ts`)** - Organization-specific access control
- **Validation (`validation.ts`)** - Input validation and data integrity
- **Utils (`utils.ts`)** - Common utility functions and logging

## Authentication Helpers

### Core Authentication Functions

```typescript
import { requireAuthentication, getCurrentAuthenticatedUser } from '../helpers';

// Require user to be authenticated
const user = await requireAuthentication(ctx);

// Get current user if authenticated, null if not
const user = await getOptionalCurrentUser(ctx);
```

### Role-Based Authentication

```typescript
import { requireAdmin, requireStaffOrAdmin, requireMerchantOrStaffOrAdmin } from '../helpers';

// Require admin privileges
const admin = await requireAdmin(ctx);

// Require staff or admin privileges
const staffUser = await requireStaffOrAdmin(ctx);

// Require merchant, staff, or admin privileges
const privilegedUser = await requireMerchantOrStaffOrAdmin(ctx);
```

### Self-Access Control

```typescript
import { requireSelfOrAdmin } from '../helpers';

// Allow users to access their own data or admins to access any data
const user = await requireSelfOrAdmin(ctx, targetUserId);
```

### Onboarding & Setup Checks

```typescript
import { requireOnboardedUser, requireSetupComplete } from '../helpers';

// Require user to have completed onboarding
const onboardedUser = await requireOnboardedUser(ctx);

// Require user to have completed setup
const setupUser = await requireSetupComplete(ctx);
```

## Permission Helpers

### Basic Permission Checking

```typescript
import { requirePermission, hasPermission } from '../helpers';

// Require specific permission
const user = await requirePermission(ctx, 'USER_MANAGEMENT', 'create');

// Check if user has permission (returns boolean)
const user = await requireAuthentication(ctx);
const canDelete = await hasPermission(user, 'USER_MANAGEMENT', 'delete');
```

### Multiple Permission Checking

```typescript
import { requireAnyPermission, requireAllPermissions } from '../helpers';

// Require any of the specified permissions
const user = await requireAnyPermission(ctx, [
  { code: 'USER_MANAGEMENT', action: 'read' },
  { code: 'ADMIN_ACCESS', action: 'read' }
]);

// Require all specified permissions
const user = await requireAllPermissions(ctx, [
  { code: 'USER_MANAGEMENT', action: 'create' },
  { code: 'USER_MANAGEMENT', action: 'update' }
]);
```

## Organization Helpers

### Organization Membership

```typescript
import { 
  requireOrganizationMember, 
  requireOrganizationAdmin, 
  requireOrganizationAdminOrStaff 
} from '../helpers';

// Require organization membership
const { user, membership } = await requireOrganizationMember(ctx, organizationId);

// Require organization admin privileges
const { user, membership } = await requireOrganizationAdmin(ctx, organizationId);

// Require organization admin or staff privileges
const { user, membership } = await requireOrganizationAdminOrStaff(ctx, organizationId);
```

### Organization Permission Checking

```typescript
import { requireOrganizationPermission, hasOrganizationPermission } from '../helpers';

// Require specific organization permission
const { user, membership } = await requireOrganizationPermission(
  ctx, 
  organizationId, 
  'PRODUCT_MANAGEMENT', 
  'create'
);

// Check organization permission (returns boolean)
const canEdit = await hasOrganizationPermission(
  membership, 
  'PRODUCT_MANAGEMENT', 
  'update'
);
```

### Organization Ownership

```typescript
import { requireOrganizationOwner } from '../helpers';

// Require organization owner privileges (creator/first admin)
const { user, membership, organization } = await requireOrganizationOwner(ctx, organizationId);
```

## Validation Helpers

### Entity Validation

```typescript
import { 
  validateUserExists, 
  validateOrganizationExists, 
  validateProductExists 
} from '../helpers';

// Validate entities exist and are active
const user = await validateUserExists(ctx, userId);
const organization = await validateOrganizationExists(ctx, organizationId);
const product = await validateProductExists(ctx, productId);
```

### Input Validation

```typescript
import { 
  validateNotEmpty, 
  validateEmail, 
  validatePhone, 
  validateStringLength,
  validatePositiveNumber 
} from '../helpers';

// Validate input data
validateNotEmpty(name, "Name");
validateStringLength(description, "Description", 10, 500);
validatePositiveNumber(price, "Price");

if (!validateEmail(email)) {
  throw new Error("Invalid email format");
}
```

## Utility Helpers

### Logging

```typescript
import { logAction } from '../helpers';

// Log actions for audit trail
await logAction(
  ctx,
  "create_product",
  "DATA_CHANGE",
  "MEDIUM",
  `Created product: ${productName}`,
  userId,
  organizationId,
  { productId, category: "electronics" }
);
```

### Slug Generation and Validation

```typescript
import { generateSlug, isOrganizationSlugUnique, isProductSlugUnique } from '../helpers';

// Generate and validate slugs
const slug = generateSlug("My Organization Name"); // "my-organization-name"

const isUnique = await isOrganizationSlugUnique(ctx, slug);
const isProductSlugUnique = await isProductSlugUnique(ctx, slug, organizationId);
```

### Utility Functions

```typescript
import { 
  formatCurrency, 
  generateInviteCode, 
  sanitizeString,
  getTimeAgo 
} from '../helpers';

// Utility operations
const price = formatCurrency(2999, 'USD'); // "$29.99"
const inviteCode = generateInviteCode(8); // "ABC12345"
const clean = sanitizeString("  Extra   spaces  "); // "Extra spaces"
const timeAgo = getTimeAgo(timestamp); // "2h ago"
```

## Usage Patterns

### Mutation Pattern

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { 
  requireAuthentication, 
  requirePermission, 
  validateNotEmpty,
  logAction 
} from "../helpers";

export const createSomething = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireAuthentication(ctx);
    
    // 2. Authorization (if needed)
    await requirePermission(ctx, 'RESOURCE_MANAGEMENT', 'create');
    
    // 3. Validation
    validateNotEmpty(args.name, "Name");
    
    // 4. Business logic
    const resourceId = await ctx.db.insert("resources", {
      name: args.name,
      description: args.description,
      createdBy: user._id,
      createdAt: Date.now(),
    });
    
    // 5. Logging
    await logAction(
      ctx,
      "create_resource",
      "DATA_CHANGE",
      "MEDIUM",
      `Created resource: ${args.name}`,
      user._id,
      undefined,
      { resourceId }
    );
    
    return resourceId;
  },
});
```

### Query Pattern

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireStaffOrAdmin } from "../helpers";

export const getSensitiveData = query({
  args: {
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    // Check permissions for sensitive data
    await requireStaffOrAdmin(ctx);
    
    // Return data
    return await ctx.db.get(args.resourceId);
  },
});
```

### Organization-Specific Pattern

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { 
  requireOrganizationAdmin, 
  logAction 
} from "../helpers";

export const updateOrganizationSetting = mutation({
  args: {
    organizationId: v.id("organizations"),
    setting: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    // Require organization admin
    const { user, organization } = await requireOrganizationAdmin(ctx, args.organizationId);
    
    // Update setting
    await ctx.db.patch(args.organizationId, {
      [args.setting]: args.value,
      updatedAt: Date.now(),
    });
    
    // Log action
    await logAction(
      ctx,
      "update_organization_setting",
      "DATA_CHANGE",
      "LOW",
      `Updated ${args.setting} for ${organization.name}`,
      user._id,
      args.organizationId,
      { setting: args.setting, newValue: args.value }
    );
    
    return { success: true };
  },
});
```

## Error Handling

All helper functions throw descriptive errors that can be caught and handled appropriately:

```typescript
try {
  const user = await requireAdmin(ctx);
  // Admin-only logic
} catch (error) {
  // Handle authentication/authorization errors
  throw new Error(`Access denied: ${error.message}`);
}
```

## Security Considerations

1. **Always validate inputs** before processing
2. **Check authentication first** in all mutations
3. **Apply least privilege** - only grant minimum required permissions
4. **Log sensitive actions** for audit trails
5. **Validate entity existence** before operations
6. **Use organization-scoped permissions** where applicable

## Migration Guide

To update existing functions to use these helpers:

1. Import required helpers at the top of your file
2. Replace manual authentication checks with helper functions
3. Add validation for inputs
4. Add logging for important actions
5. Use consistent error messages

### Before:
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

const user = await ctx.db.query("users")
  .withIndex("by_clerkId", q => q.eq("clerkId", identity.subject))
  .first();
if (!user) throw new Error("User not found");
```

### After:
```typescript
const user = await requireAuthentication(ctx);
```

This provides better error handling, consistency, and maintainability across your codebase.
