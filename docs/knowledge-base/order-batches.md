---
title: Order Batches Management
description: Creating and managing order batches, automatic assignment, bulk status updates, and batch organization workflows.
category: operations
icon: Package
lastUpdated: 2025-12-16
---

# Order Batches Management Guide

## Overview

Order batches allow you to group and organize orders by date ranges, making it easier to manage fulfillment workflows, track progress, and perform bulk operations. Orders can be automatically assigned to batches based on their order date, or manually assigned as needed. Batches support multiple orders and orders can belong to multiple batches simultaneously.

---

## Quick Reference

| Aspect                  | Details                                          |
| ----------------------- | ------------------------------------------------ |
| **Batch Assignment**    | Automatic (by date) + Manual assignment          |
| **Multiple Batches**    | Orders can belong to multiple batches            |
| **Bulk Updates**        | Update status/payment for filtered batch orders  |
| **Date Range**          | Start date and end date define batch coverage    |
| **Auto-Assignment**     | On batch creation and order creation             |
| **Soft Delete**         | Batches can be archived; orders retain reference |
| **Customer Visibility** | Batch labels visible to customers                |
| **Organization Scope**  | Batches are organization-specific                |

---

## Table of Contents

1. [Understanding Batches](#understanding-batches)
2. [Creating Batches](#creating-batches)
3. [Batch Assignment](#batch-assignment)
4. [Managing Batches](#managing-batches)
5. [Bulk Operations](#bulk-operations)
6. [Rules & Terms](#rules--terms)
7. [Common Scenarios](#common-scenarios)
8. [Best Practices](#best-practices)

---

## Understanding Batches

### What are Order Batches?

Order batches are organizational tools that group orders together based on date ranges. They help you:

- **Organize by Time Period**: Group orders by week, month, or custom date ranges
- **Track Progress**: See statistics for all orders in a batch at a glance
- **Bulk Operations**: Update multiple orders' status or payment status simultaneously
- **Workflow Management**: Plan fulfillment schedules for specific time periods
- **Reporting**: Generate reports for specific batch periods

### Key Concepts

**Batch Name**: A descriptive label for the batch (e.g., "December Week 1", "Holiday Rush 2025")

**Date Range**: Start and end dates that define which orders are automatically assigned

**Active Status**: Active batches automatically receive new orders; inactive batches do not

**Multiple Assignment**: Orders can belong to multiple batches simultaneously (e.g., "December Week 1" and "Holiday Promo")

**Soft Delete**: Archived batches are hidden but orders retain their batch labels for historical reference

---

## Creating Batches

### Step 1: Navigate to Batches

1. Go to **Admin → Batches**
2. Click **"Create Batch"** button

### Step 2: Enter Batch Information

**Required Fields:**

- **Batch Name** - Descriptive name (e.g., "December Week 1", "Q4 2025")
- **Start Date** - Beginning of date range (orders on/after this date)
- **End Date** - End of date range (orders on/before this date)

**Optional Fields:**

- **Description** - Additional notes about the batch
- **Active Status** - Toggle to enable/disable automatic assignment

### Step 3: Configure Date Range

**Date Range Rules:**

- Start date must be before end date
- Dates are inclusive (orders on start/end dates are included)
- Overlapping date ranges are allowed
- Orders can match multiple batches

**Example:**

- Start: December 1, 2025
- End: December 7, 2025
- Automatically includes all orders placed between these dates

### Step 4: Save Batch

1. Review batch details
2. Click **"Create Batch"**
3. System automatically assigns matching orders to the batch

**What Happens:**

- Batch is created
- All existing orders within the date range are automatically assigned
- Batch appears in the batches list with order statistics

---

## Batch Assignment

### Automatic Assignment

Orders are automatically assigned to batches in two scenarios:

#### 1. On Batch Creation

When you create a new batch:

- System searches for all orders in the organization
- Finds orders where `orderDate` falls within the batch's date range
- Automatically adds the batch to those orders' `batchIds` array
- Updates `batchInfo` with batch name for quick display

**Example:**

- Create batch "December Week 1" (Dec 1-7, 2025)
- System finds 25 orders placed between Dec 1-7
- All 25 orders are automatically assigned to the batch

#### 2. On Order Creation

When a new order is placed:

- System searches for all active batches in the organization
- Finds batches where the order's `orderDate` falls within the batch date range
- Automatically assigns the order to all matching batches

**Example:**

- Order placed on December 5, 2025
- Active batches: "December Week 1" (Dec 1-7) and "Holiday Promo" (Dec 1-31)
- Order is automatically assigned to both batches

### Manual Assignment

You can manually assign orders to batches from multiple locations:

#### From Order Detail Page (Recommended)

1. Go to **Admin → Orders → [Order ID]**
2. Find the **"Batch Assignment"** card in the right sidebar
3. Click **"Add to Batch"** button
4. Select a batch from the dropdown
5. Order is immediately assigned to the batch

**Benefits:**

- Fastest method for single orders
- See current batch assignments at a glance
- Remove batches with one click
- All changes are logged in order activity

#### From Orders List Page

1. Go to **Admin → Orders**
2. Click the **⋮** menu on an order
3. Select **"Assign to Batch"**
4. Choose the batch from the dropdown
5. Click **"Assign Orders"**

#### From Batch Detail Page

1. Go to **Admin → Batches → [Batch Name]**
2. Use the search/filter to find orders
3. Select orders using checkboxes
4. Use bulk actions to assign multiple orders

### Removing Orders from Batches

To remove an order from a batch:

#### From Order Detail Page (Recommended)

1. Go to **Admin → Orders → [Order ID]**
2. Find the **"Batch Assignment"** card
3. Click the **X** button next to the batch you want to remove
4. Order is immediately removed from the batch

#### From Batch Detail Page

1. Go to **Admin → Batches → [Batch Name]**
2. Find the order in the list
3. Use batch management tools to remove

**Note:** Removing an order from a batch does not delete the order; it only removes the batch association.

### Activity Logging

All batch assignment changes are logged in the order's activity log:

- **Added to batch**: Logged when an order is assigned to a batch
- **Removed from batch**: Logged when an order is removed from a batch
- **Actor tracking**: The user who made the change is recorded
- **Admin visibility**: Batch logs are visible to admins only (not customers)

---

## Managing Batches

### Viewing Batches

**Batches List Page:**

- Shows all batches for your organization
- Displays batch name, date range, order count, and status
- Quick stats: total orders, pending, processing, ready, delivered
- Filter by active/inactive status

**Batch Detail Page:**

- Full batch information
- Complete list of orders in the batch
- Filter orders by status and payment status
- Bulk action tools
- Order statistics dashboard

### Editing Batches

**What Can Be Changed:**

- Batch name
- Description
- Start date
- End date
- Active status

**What Happens When You Edit:**

- Batch information is updated
- If date range changes, orders are re-evaluated
- If name changes, `batchInfo` in orders is updated
- Existing order assignments remain unless date range excludes them

**Limitations:**

- Cannot edit archived (deleted) batches
- Date range must remain valid (start < end)

### Archiving Batches

**Soft Delete Process:**

1. Go to **Admin → Batches**
2. Click **⋮** menu on a batch
3. Select **"Archive"**
4. Confirm archiving

**What Happens:**

- Batch is marked as `isDeleted: true`
- Batch is hidden from active batches list
- Orders retain their batch labels (for historical reference)
- Batch shows as "(archived)" in customer views
- Batch can be viewed in detail page but cannot be edited

**Why Soft Delete:**

- Preserves historical data
- Maintains order-batch relationships
- Allows reporting on archived batches
- Prevents accidental data loss

---

## Bulk Operations

### Bulk Status Updates

Update multiple orders' status simultaneously:

**Step 1: Select Orders**

1. Go to **Admin → Batches → [Batch Name]**
2. Use filters to narrow down orders (by status, payment status)
3. Select orders using checkboxes
4. Or select all filtered orders

**Step 2: Choose Update**

1. Click **"Update Status"** or **"Update Payment"**
2. Select new status from dropdown
3. Add optional note explaining the update
4. Click **"Update Orders"**

**Step 3: Review Results**

- System updates all selected orders
- Only orders matching current filters are updated
- Order logs are created for each update
- Success message shows number of orders updated

### Filtered Bulk Updates

**How Filtering Works:**

- Apply filters (status, payment status) before selecting orders
- Bulk update only affects orders matching ALL filters
- Example: Filter by "PENDING" status and "PAID" payment → only pending paid orders are updated

**Use Cases:**

- Update all pending paid orders to "PROCESSING"
- Mark all ready orders as "DELIVERED"
- Change payment status for specific order statuses

### Status Transition Rules

Bulk updates follow the same rules as individual order updates:

**Allowed Transitions:**

| Current Status | Can Change To         |
| -------------- | --------------------- |
| PENDING        | PROCESSING, CANCELLED |
| PROCESSING     | READY, CANCELLED      |
| READY          | DELIVERED, CANCELLED  |
| DELIVERED      | None (terminal state) |
| CANCELLED      | None (terminal state) |

**Payment Status Rules:**

- Cannot change from `REFUNDED` to `PAID`
- Can update `PENDING` → `PAID` or `DOWNPAYMENT`
- Can update `DOWNPAYMENT` → `PAID`

**Terminal State Protection:**

- Orders in `DELIVERED` or `CANCELLED` status cannot be updated via bulk operations (unless super-admin)
- Invalid transitions are skipped (order remains unchanged)

---

## Rules & Terms

### Batch Creation Rules

1. **Organization Scope**: Batches are organization-specific; each organization has its own batches
2. **Date Range Validation**: Start date must be before end date
3. **Permission Required**: `MANAGE_ORDERS` permission required to create/edit batches
4. **Name Uniqueness**: Batch names are not required to be unique (you can have multiple batches with the same name)
5. **Active Status**: Only active batches receive automatic assignments from new orders

### Assignment Rules

1. **Automatic Assignment**: Only applies to orders with `orderDate` within batch date range
2. **Organization Matching**: Orders are only assigned to batches from the same organization
3. **Multiple Batches**: Orders can belong to multiple batches simultaneously
4. **No Duplicates**: System prevents duplicate batch assignments (same batch won't be added twice)
5. **Date-Based Matching**: Uses order's `orderDate` field, not `createdAt` or `estimatedDelivery`

### Update Rules

1. **Bulk Update Scope**: Only updates orders that match ALL applied filters
2. **Status Transitions**: Must follow valid status transition rules
3. **Terminal States**: Orders in `DELIVERED` or `CANCELLED` cannot be bulk updated (unless super-admin)
4. **Order Logs**: Each bulk update creates order logs for audit trail
5. **Filter Application**: Filters are applied before selection; selected orders must match filters
6. **Batch Assignment Logs**: Adding/removing orders from batches creates activity logs on each order

### Archive Rules

1. **Soft Delete Only**: Batches are archived, not permanently deleted
2. **Order Preservation**: Orders retain batch labels after batch is archived
3. **Historical Reference**: Archived batches remain visible in order history
4. **No New Assignments**: Archived batches do not receive new automatic assignments
5. **Read-Only**: Archived batches cannot be edited or reactivated

### Customer Visibility Rules

1. **Batch Labels**: Customers can see batch names/labels on their orders
2. **Archived Indicator**: Archived batches show "(archived)" suffix to customers
3. **Multiple Labels**: If order belongs to multiple batches, all batch labels are shown
4. **No Batch Details**: Customers see batch names only; no access to batch management features

---

## Common Scenarios

### Scenario 1: Weekly Batch Creation

**Goal**: Create batches for each week of December

**Steps:**

1. Create batch "December Week 1" (Dec 1-7, 2025)
2. Create batch "December Week 2" (Dec 8-14, 2025)
3. Create batch "December Week 3" (Dec 15-21, 2025)
4. Create batch "December Week 4" (Dec 22-28, 2025)

**Result:**

- Each batch automatically receives orders from its respective week
- Orders placed on Dec 1-7 go to Week 1 batch
- Orders placed on Dec 8-14 go to Week 2 batch
- And so on...

**Use Case**: Weekly fulfillment planning, weekly reporting, weekly payout organization

---

### Scenario 2: Overlapping Batches

**Goal**: Create a weekly batch and a monthly batch that overlap

**Steps:**

1. Create batch "December Week 1" (Dec 1-7, 2025)
2. Create batch "December 2025" (Dec 1-31, 2025)

**Result:**

- Orders placed Dec 1-7 belong to BOTH batches
- Orders placed Dec 8-31 belong only to "December 2025" batch
- Both batch labels appear on orders from Dec 1-7

**Use Case**:

- Weekly operational management (Week 1 batch)
- Monthly reporting and analytics (December 2025 batch)
- Orders can be viewed in both contexts

---

### Scenario 3: Bulk Status Update

**Goal**: Mark all pending paid orders in "December Week 1" batch as "PROCESSING"

**Steps:**

1. Go to **Admin → Batches → December Week 1**
2. Apply filters:
   - Status: PENDING
   - Payment: PAID
3. Select all filtered orders (or specific orders)
4. Click **"Update Status"**
5. Select "PROCESSING"
6. Add note: "Starting fulfillment for week 1 orders"
7. Click **"Update Orders"**

**Result:**

- All pending paid orders in the batch are updated to PROCESSING
- Order logs are created for each update
- Batch statistics update to reflect new status distribution

**Use Case**: Starting fulfillment for a specific time period, batch processing workflows

---

### Scenario 4: Manual Assignment

**Goal**: Add a late order to an existing batch

**Steps:**

1. Order was placed on Dec 8, 2025 (outside "December Week 1" range)
2. Go to **Admin → Orders**
3. Find the order
4. Click **⋮** menu → **"Assign to Batch"**
5. Select "December Week 1"
6. Click **"Assign Orders"**

**Result:**

- Order is added to "December Week 1" batch
- Order now appears in batch detail page
- Order shows both batch labels (if it belongs to other batches)

**Use Case**: Including late orders, correcting assignment errors, grouping related orders

---

### Scenario 5: Batch Archive After Completion

**Goal**: Archive "December Week 1" batch after all orders are delivered

**Steps:**

1. Go to **Admin → Batches → December Week 1**
2. Verify all orders are DELIVERED
3. Go back to batches list
4. Click **⋮** menu → **"Archive"**
5. Confirm archiving

**Result:**

- Batch is archived (soft deleted)
- Batch no longer appears in active batches list
- Orders retain "December Week 1" label with "(archived)" indicator
- Historical data is preserved

**Use Case**: Cleaning up completed batches, maintaining active batch list, preserving history

---

### Scenario 6: Date Range Update

**Goal**: Extend "December Week 1" batch to include Dec 8-9 orders

**Steps:**

1. Go to **Admin → Batches → December Week 1**
2. Click **"Edit Batch"**
3. Change end date from Dec 7 to Dec 9
4. Save changes

**Result:**

- Batch date range is updated
- Orders from Dec 8-9 are automatically added to the batch
- Existing orders remain assigned
- Batch info in orders is updated with new date range

**Use Case**: Adjusting batch coverage, including additional days, correcting date errors

---

### Scenario 7: Multiple Batch Filtering

**Goal**: View orders that belong to both "December Week 1" and "Holiday Promo" batches

**Current Limitation:**

- Batch filter on orders page shows orders from ONE batch at a time
- To find orders in multiple batches, use batch detail pages

**Workaround:**

1. Go to **Admin → Batches → December Week 1**
2. Note order numbers
3. Go to **Admin → Batches → Holiday Promo**
4. Compare order lists to find overlaps

**Future Enhancement**: Multi-batch filtering may be added in future updates

---

### Scenario 8: Bulk Payment Status Update

**Goal**: Mark all orders in "December Week 1" batch as PAID

**Steps:**

1. Go to **Admin → Batches → December Week 1**
2. Apply filter: Payment Status = PENDING
3. Select all filtered orders
4. Click **"Update Payment"**
5. Select "PAID"
6. Add note: "Payment received for week 1 orders"
7. Click **"Update Orders"**

**Result:**

- All pending orders in batch are marked as PAID
- Payment status updated across all selected orders
- Order logs record the payment update

**Use Case**: Batch payment processing, reconciling payments for time period

---

## Best Practices

### Batch Naming Conventions

**Recommended Formats:**

- **Weekly**: "December Week 1", "Week of Dec 1", "W1 Dec 2025"
- **Monthly**: "December 2025", "Dec 2025", "Q4 2025"
- **Event-Based**: "Holiday Rush 2025", "Black Friday 2025", "New Year Promo"
- **Custom**: "Pre-Christmas Batch", "Post-Holiday Returns"

**Tips:**

- Use consistent naming across batches
- Include dates or time periods in names
- Make names descriptive and searchable
- Avoid special characters that might cause issues

### Date Range Planning

**Weekly Batches:**

- Use consistent week boundaries (Monday-Sunday or Sunday-Saturday)
- Consider your fulfillment schedule when setting ranges
- Leave small gaps between batches to avoid confusion

**Monthly Batches:**

- Use full calendar months (1st to last day)
- Create monthly batches for reporting purposes
- Can overlap with weekly batches for different use cases

**Event Batches:**

- Create batches for promotional periods
- Set dates to match campaign duration
- Archive after campaign ends

### Batch Organization

**Active vs Inactive:**

- Keep only current/relevant batches active
- Archive completed batches to reduce clutter
- Use inactive batches for planning future periods

**Batch Size:**

- Aim for manageable batch sizes (50-200 orders)
- Split very large batches into smaller ones if needed
- Consider fulfillment capacity when creating batches

### Bulk Operations

**Before Bulk Updates:**

- Always apply filters first to target specific orders
- Review selected orders before updating
- Add descriptive notes explaining the bulk update
- Test on a small subset first if unsure

**Status Updates:**

- Follow logical workflow progression
- Don't skip statuses (PENDING → DELIVERED)
- Update payment status separately from order status
- Document reasons for bulk updates

### Customer Communication

**Batch Labels:**

- Use customer-friendly batch names
- Avoid internal codes or abbreviations
- Consider how batch names appear to customers
- Archived batches show "(archived)" automatically

**Visibility:**

- Batch labels help customers understand order grouping
- Useful for explaining delivery timelines
- Can reference batch names in customer communications

---

## Troubleshooting

### Orders Not Auto-Assigned

**Possible Causes:**

1. **Batch Not Active**: Check if batch `isActive` is true
2. **Date Range Mismatch**: Verify order date falls within batch range
3. **Organization Mismatch**: Ensure order and batch belong to same organization
4. **Order Date**: Check that order has correct `orderDate` value

**Solution:**

- Manually assign orders if automatic assignment fails
- Verify batch date range includes order date
- Check batch active status

### Bulk Update Not Working

**Possible Causes:**

1. **Invalid Status Transition**: Trying to update to invalid next status
2. **Terminal State**: Orders are in DELIVERED or CANCELLED status
3. **Filter Mismatch**: Selected orders don't match filters
4. **Permission Issue**: Insufficient permissions for bulk operations

**Solution:**

- Check status transition rules
- Verify orders are not in terminal states
- Ensure filters match selected orders
- Confirm you have `MANAGE_ORDERS` permission

### Batch Not Showing Orders

**Possible Causes:**

1. **No Orders in Range**: No orders exist for the date range
2. **Organization Filter**: Orders belong to different organization
3. **Deleted Orders**: Orders are soft-deleted
4. **Date Range Error**: Batch date range doesn't match order dates

**Solution:**

- Verify date range includes order dates
- Check organization assignment
- Review order status (deleted orders are excluded)
- Manually assign orders if needed

---

## Related Documentation

- [Order Management](./order-management.md) - Understanding order statuses and workflows
- [Product Management](./product-management.md) - Managing products and inventory
- [Permissions & Roles](./permissions-roles.md) - Required permissions for batch management

---

## Summary

Order batches provide a powerful way to organize and manage orders by time periods. Key takeaways:

- **Automatic Assignment**: Orders are automatically assigned based on date ranges
- **Multiple Batches**: Orders can belong to multiple batches simultaneously
- **Bulk Operations**: Update multiple orders efficiently with filters
- **Soft Delete**: Archive batches while preserving historical data
- **Customer Visibility**: Batch labels help customers understand order grouping

Use batches to streamline your fulfillment workflows, improve organization, and provide better customer communication.
