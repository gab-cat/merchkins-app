---
title: Permissions & Roles
description: Role hierarchy, permission codes, assigning permissions, and access control management.
category: administration
icon: Shield
lastUpdated: 2025-12-12
---

# Permissions & Roles Guide

## Overview

The permissions system provides fine-grained access control for organization members. Learn how roles work, how to assign permissions, and how to manage access levels.

---

## Quick Reference

| Aspect                 | Details                        |
| ---------------------- | ------------------------------ |
| **Role Types**         | Owner, Admin, Staff, Member    |
| **Permission Actions** | create, read, update, delete   |
| **Permission Scope**   | Organization-level permissions |
| **Access Control**     | Fine-grained per feature       |
| **Hierarchy**          | Owner > Admin > Staff > Member |

---

## Role Hierarchy

### Role Levels

**Owner:**

- Organization creator
- Full access to all features
- Cannot be removed
- Can transfer ownership

**Admin:**

- Full administrative access
- Can manage members and permissions
- Can access all organization features
- Can be assigned by Owner/Admin

**Staff:**

- Limited administrative access
- Can perform assigned tasks
- Permissions assigned per feature
- Can be assigned by Admin

**Member:**

- Basic access
- Limited permissions
- Usually read-only access
- Can be assigned by Admin

---

## Permission System

### Permission Structure

Permissions are organized by:

- **Permission Code** - Feature identifier (e.g., `PRODUCT_MANAGEMENT`)
- **Action** - Operation type (`create`, `read`, `update`, `delete`)

### Common Permission Codes

**Product Management:**

- `PRODUCT_MANAGEMENT` - Manage products
- Actions: create, read, update, delete

**Order Management:**

- `ORDER_MANAGEMENT` - Manage orders
- Actions: create, read, update, delete

**User Management:**

- `USER_MANAGEMENT` - Manage users
- Actions: create, read, update, delete

**Organization Management:**

- `ORG_MANAGEMENT` - Manage organization
- Actions: create, read, update, delete

**Financial Management:**

- `PAYOUT_MANAGEMENT` - Manage payouts
- `VOUCHER_MANAGEMENT` - Manage vouchers
- `REFUND_MANAGEMENT` - Manage refunds

**Communication:**

- `ANNOUNCEMENT_MANAGEMENT` - Manage announcements
- `TICKET_MANAGEMENT` - Manage tickets
- `CHAT_MANAGEMENT` - Manage chats

### Permission Actions

**create:**

- Create new resources
- Example: Create products, orders

**read:**

- View resources
- Example: View product list, order details

**update:**

- Modify existing resources
- Example: Update product info, order status

**delete:**

- Remove resources
- Example: Delete products, cancel orders

---

## Assigning Permissions

### To Organization Members

**For Admins:**

1. Navigate to Admin → Organization Members
2. Select member
3. Click "Edit Permissions"
4. Select permission codes and actions
5. Save changes

**Permission Assignment:**

- Select permission code
- Select allowed actions
- Can assign multiple permissions
- Changes apply immediately

### Permission Examples

**Product Manager:**

- `PRODUCT_MANAGEMENT`: create, read, update
- Cannot delete products

**Order Processor:**

- `ORDER_MANAGEMENT`: read, update
- Can view and update orders
- Cannot create or delete orders

**Viewer:**

- `PRODUCT_MANAGEMENT`: read
- `ORDER_MANAGEMENT`: read
- Can view but not modify

---

## Access Control

### Permission Checking

The system checks permissions for:

- **Feature Access** - Can user access feature?
- **Action Permission** - Can user perform action?
- **Resource Access** - Can user access specific resource?

### Permission Enforcement

**Automatic Checks:**

- All mutations check permissions
- Queries may check read permissions
- UI shows/hides based on permissions

**Permission Errors:**

- "You don't have permission to perform this action"
- "Access denied"
- "Insufficient permissions"

---

## Organization Permissions

### Organization-Level Permissions

Permissions are scoped to organizations:

- Member has permissions within organization
- Permissions don't transfer between organizations
- Each organization manages its own permissions

### Permission Inheritance

**Role-Based Defaults:**

- Owner: All permissions
- Admin: Most permissions (configurable)
- Staff: Assigned permissions
- Member: Minimal permissions

**Custom Permissions:**

- Override role defaults
- Assign specific permissions
- Fine-tune access levels

---

## Managing Members

### Adding Members

1. Navigate to Organization Members
2. Click "Add Member"
3. Enter user email or invite code
4. Select role
5. Assign permissions
6. Send invitation

### Updating Permissions

1. Go to member details
2. Click "Edit Permissions"
3. Update permission assignments
4. Save changes

### Removing Members

1. Go to member details
2. Click "Remove Member"
3. Confirm removal
4. Member loses access immediately

---

## Common Scenarios

### Scenario 1: Assign Product Manager Role

**Requirements:**

- Create and edit products
- View products
- Cannot delete products

**Permission Assignment:**

- `PRODUCT_MANAGEMENT`: create, read, update
- Role: Staff

**Result:** Member can manage products but cannot delete them

---

### Scenario 2: Assign Order Processor Role

**Requirements:**

- View orders
- Update order status
- Cannot create or delete orders

**Permission Assignment:**

- `ORDER_MANAGEMENT`: read, update
- Role: Staff

**Result:** Member can process orders but cannot create/delete

---

### Scenario 3: Assign Viewer Role

**Requirements:**

- View products and orders
- No modification access

**Permission Assignment:**

- `PRODUCT_MANAGEMENT`: read
- `ORDER_MANAGEMENT`: read
- Role: Member

**Result:** Member can view but not modify anything

---

### Scenario 4: Promote Staff to Admin

**Flow:**

1. Go to member details
2. Change role from Staff to Admin
3. Admin role grants most permissions automatically
4. Save changes

**Result:** Member promoted to Admin with expanded access

---

## Best Practices

### Permission Management

1. **Principle of Least Privilege** - Grant minimum necessary permissions
2. **Role-Based Assignment** - Use roles for common permission sets
3. **Regular Audits** - Review permissions periodically
4. **Document Permissions** - Keep records of permission assignments
5. **Remove Unused Access** - Revoke permissions when no longer needed

### Security

1. **Owner Protection** - Owner cannot be removed
2. **Admin Caution** - Limit admin assignments
3. **Permission Reviews** - Audit permissions regularly
4. **Access Logs** - Monitor access patterns
5. **Remove Departing Members** - Remove access promptly

### Organization Management

1. **Clear Roles** - Define role responsibilities clearly
2. **Permission Documentation** - Document permission requirements
3. **Training** - Train members on permission system
4. **Support** - Provide support for permission issues
5. **Updates** - Keep permissions updated as needs change

---

## Frequently Asked Questions

### Q: Can I remove the organization owner?

**A:** No, the owner cannot be removed. Ownership can be transferred to another member.

### Q: What's the difference between Admin and Staff roles?

**A:** Admin has broad administrative access by default. Staff has limited access based on assigned permissions.

### Q: Can permissions be assigned per feature?

**A:** Yes, permissions are assigned per permission code (feature) and action (create, read, update, delete).

### Q: Do permissions apply across organizations?

**A:** No, permissions are organization-specific. A member's permissions in one organization don't affect another.

### Q: Can I create custom permission codes?

**A:** Permission codes are defined by the system. Contact support if you need new permission types.

### Q: What happens if I remove a member's permissions?

**A:** The member immediately loses access to those features. They can still access features they have permissions for.

---

## Related Articles

- [Organization Management](../convex/organizations/README.md)
- [Helper Functions](../convex/helpers/README.md)




