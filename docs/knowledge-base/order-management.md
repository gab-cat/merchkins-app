---
title: Order Management
description: Understanding order statuses, fulfillment workflows, cancellation policies, and order processing.
category: operations
icon: Package
lastUpdated: 2025-12-12
---

# Order Management Guide

## Overview

This guide covers the complete order lifecycle from creation to delivery, including status transitions, payment handling, cancellation policies, and fulfillment workflows.

---

## Quick Reference

| Aspect               | Details                                  |
| -------------------- | ---------------------------------------- |
| **Order Statuses**   | PENDING → PROCESSING → READY → DELIVERED |
| **Payment Statuses** | PENDING → DOWNPAYMENT → PAID → REFUNDED  |
| **Cancellation**     | Allowed before DELIVERED status          |
| **Status History**   | Last 5 status changes tracked            |
| **Inventory**        | Automatically reserved on order creation |

---

## Order Statuses

### Status Flow

Orders progress through the following statuses:

1. **PENDING** - Order created, awaiting processing
2. **PROCESSING** - Order is being prepared
3. **READY** - Order is ready for delivery/pickup
4. **DELIVERED** - Order has been delivered to customer
5. **CANCELLED** - Order has been cancelled

### Status Transitions

| Current Status | Allowed Next Statuses |
| -------------- | --------------------- |
| PENDING        | PROCESSING, CANCELLED |
| PROCESSING     | READY, CANCELLED      |
| READY          | DELIVERED, CANCELLED  |
| DELIVERED      | None (terminal state) |
| CANCELLED      | None (terminal state) |

**Important Notes:**

- Once an order reaches `DELIVERED` or `CANCELLED`, it cannot be changed unless you're a super-admin
- Status changes are logged in the order's status history (last 5 changes)
- Each status change records who made the change and when

---

## Payment Statuses

### Payment Flow

Orders have separate payment status tracking:

1. **PENDING** - Payment not yet received
2. **DOWNPAYMENT** - Partial payment received
3. **PAID** - Full payment received
4. **REFUNDED** - Payment refunded (via voucher)

### Payment Status Rules

- Payment status cannot revert from `REFUNDED` to `PAID`
- Orders with `PAID` status are included in weekly payout calculations
- Refunded orders (`REFUNDED`) are excluded from payouts

---

## Order Processing Workflow

### Step 1: Order Creation

When a customer places an order:

1. Order is created with status `PENDING`
2. Payment status is set to `PENDING`
3. Inventory is automatically reserved (for STOCK products)
4. Order number is generated
5. Customer receives confirmation

**Key Points:**

- Inventory is reserved immediately upon order creation
- Orders can be cancelled before payment without penalty
- Order items are snapshotted for historical reference

### Step 2: Payment Processing

When customer pays:

1. Payment status changes to `PAID` (or `DOWNPAYMENT` for partial)
2. Xendit invoice is created/updated
3. Order becomes eligible for fulfillment
4. Order is included in weekly payout calculation

**Payment Methods:**

- Xendit payment gateway (credit card, e-wallet, etc.)
- Vouchers (can be combined with cash payment)
- Mixed payment (voucher + cash)

### Step 3: Order Fulfillment

Admin updates order status:

1. **PROCESSING** - Order is being prepared
   - Update status when you start working on the order
   - Can add notes about preparation progress

2. **READY** - Order is ready for delivery
   - Update when order is packaged and ready
   - Set estimated delivery date if applicable

3. **DELIVERED** - Order completed
   - Final status indicating successful delivery
   - Order is now in terminal state

### Step 4: Order Completion

Once delivered:

- Order status cannot be changed (unless super-admin)
- Order is included in payout calculation
- Customer can leave reviews
- Order history is preserved

---

## Order Cancellation

### Cancellation Rules

**Unpaid Orders:**

- Can be cancelled immediately by customer
- No refund needed (no payment received)
- Inventory automatically restored
- No financial impact

**Paid Orders:**

- Customer can request refund within 24 hours
- Admin must approve/reject refund request
- If approved, REFUND voucher is issued
- See [Refund System](./refund-system.md) for details

**Admin Cancellation:**

- Admins can cancel orders at any status except `DELIVERED`
- Cancellation reason should be provided
- Inventory is restored automatically
- If order was paid, refund process must be handled separately

### Cancellation Process

1. Navigate to order details page
2. Click "Cancel Order" button
3. Provide cancellation reason
4. Confirm cancellation
5. Order status changes to `CANCELLED`
6. Inventory is restored (if applicable)

---

## Order Updates

### Updating Order Status

**Manual Status Update:**

1. Go to order details page
2. Click "Update Status" button
3. Select new status from dropdown
4. Add optional notes
5. Save changes

**Status Change Tracking:**

- Each status change is logged
- Log includes: who changed it, when, and reason
- Last 5 status changes are visible in order history

### Updating Order Information

You can update:

- **Status** - Order fulfillment status
- **Payment Status** - Payment tracking
- **Estimated Delivery** - Expected delivery date
- **Customer Notes** - Internal notes visible to customer
- **Processor** - Staff member handling the order
- **Cancellation Reason** - If order is cancelled
- **Batch Assignment** - Add/remove order from batches (see [Order Batches](./order-batches.md))

**Batch Assignment:**

Orders can be assigned to batches directly from the order detail page using the **Batch Assignment** card. All batch changes are logged in the order's activity log.

---

## Order Notes & Communication

### Customer Notes

- Visible to customers in their order details
- Use for order updates, delivery information, etc.
- Can be updated multiple times
- Customers receive notifications when notes are added

### Internal Notes

- Use order logs for internal tracking
- Not visible to customers
- Useful for team communication
- Tracked in order history

---

## Inventory Management

### Automatic Inventory Handling

**On Order Creation:**

- Inventory is automatically reserved
- Stock levels decrease immediately
- Variant-specific inventory is tracked

**On Order Cancellation:**

- Inventory is automatically restored
- Stock levels increase back
- Works for both paid and unpaid cancellations

**On Order Delivery:**

- Inventory remains deducted
- Stock levels reflect sold items

### Stock Products

- Products with `STOCK` inventory type enforce stock limits
- Orders cannot be created if insufficient stock
- Inventory is tracked per variant

### Unlimited Products

- Products with `UNLIMITED` inventory type have no stock limits
- Can accept unlimited orders
- No inventory tracking needed

---

## Order Analytics & Reporting

### Key Metrics

Track these metrics for your orders:

- **Total Orders** - Count of all orders
- **Pending Orders** - Orders awaiting processing
- **Processing Orders** - Orders being prepared
- **Ready Orders** - Orders ready for delivery
- **Delivered Orders** - Completed orders
- **Cancelled Orders** - Cancelled orders

### Order Filters

Filter orders by:

- Status (PENDING, PROCESSING, READY, DELIVERED, CANCELLED)
- Payment Status (PENDING, PAID, REFUNDED)
- Date range
- Customer
- Order number

---

## Common Scenarios

### Scenario 1: Customer Wants to Cancel Unpaid Order

**Flow:**

1. Customer clicks "Cancel Order" on unpaid order
2. Order is cancelled immediately
3. Status changes to `CANCELLED`
4. Inventory is restored
5. No refund needed

**Result:** Order cancelled, no financial impact

---

### Scenario 2: Customer Requests Refund for Paid Order

**Flow:**

1. Customer submits refund request (within 24 hours)
2. Admin reviews request in Refunds section
3. Admin approves or rejects
4. If approved: REFUND voucher issued
5. Order payment status changes to `REFUNDED`

**Result:** See [Refund System](./refund-system.md) for complete details

---

### Scenario 3: Order Needs Status Update

**Flow:**

1. Admin navigates to order details
2. Clicks "Update Status"
3. Selects new status (e.g., PROCESSING → READY)
4. Adds optional notes
5. Saves changes

**Result:** Status updated, change logged in history

---

### Scenario 4: Order Delivered but Customer Reports Issue

**Flow:**

1. Order is already `DELIVERED` (terminal state)
2. Customer contacts support
3. Admin cannot change status (unless super-admin)
4. Handle via support ticket system
5. May need to create refund request if applicable

**Result:** Issue handled through support channels

---

## Best Practices

### Order Processing

1. **Update Status Promptly** - Keep customers informed of order progress
2. **Add Notes** - Use customer notes to communicate delivery updates
3. **Track History** - Review status history to understand order journey
4. **Set Delivery Dates** - Use estimated delivery for customer expectations

### Cancellation Handling

1. **Respond Quickly** - Process cancellation requests promptly
2. **Provide Reasons** - Always include cancellation reason for records
3. **Restore Inventory** - Verify inventory is restored after cancellation
4. **Handle Refunds** - Process refund requests within 24-hour window

### Communication

1. **Use Customer Notes** - Keep customers informed via order notes
2. **Set Expectations** - Provide realistic delivery estimates
3. **Respond to Inquiries** - Use tickets/chats for customer questions
4. **Track Issues** - Log any problems in order history

---

## Frequently Asked Questions

### Q: Can I change an order status after it's been delivered?

**A:** No, `DELIVERED` is a terminal state. Only super-admins can change terminal states. If there's an issue, handle it through support tickets or refund requests.

### Q: What happens to inventory when an order is cancelled?

**A:** Inventory is automatically restored when an order is cancelled, regardless of payment status.

### Q: Can customers cancel paid orders?

**A:** Customers can request refunds for paid orders within 24 hours. The refund must be approved by an admin and results in a REFUND voucher being issued.

### Q: How do I track who processed an order?

**A:** Each status change records who made the change. You can also assign a processor to track the staff member handling the order.

### Q: What's the difference between order status and payment status?

**A:** Order status tracks fulfillment (PENDING → DELIVERED), while payment status tracks payment (PENDING → PAID → REFUNDED). They're independent.

---

## Related Articles

- [Refund System](./refund-system.md)
- [Product Management](./product-management.md)
- [Payout System](./payout-system.md)
