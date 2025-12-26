---
title: Processing Orders
description: Everything you need to know about managing orders, from payments to delivery.
category: operations
icon: Package
lastUpdated: 2025-12-17
---

# Processing Orders

## Quick Overview: The Order Lifecycle

Every order goes through a few simple stages. Here is the typical flow:

1.  **Pending:** Customer placed an order but you haven't started working on it yet.
2.  **Processing:** You are currently packing or preparing the items.
3.  **Ready:** The package is packed and waiting for the courier.
4.  **Delivered:** The customer has received the package.

---

## Payment Status vs. Order Status

It's common to confuse these two, but they are separate things:

- **Order Status:** Tells you where the _package_ is (e.g., Pending, Processing, Delivered).
- **Payment Status:** Tells you where the _money_ is (e.g., Paid, Pending, Refunded).

**Tip:** You should usually wait until the Payment Status is **PAID** before you start processing an order, unless you offer Cash on Delivery.

---

## Determining When to Cancel an Order

### 1. Unpaid Orders

If a customer changes their mind before paying, they can cancel the order themselves instantly. The system will automatically restock your inventory.

### 2. Paid Orders

If a customer has already paid, they cannot cancel instantly. Instead, they must request a refund within **24 hours**. You will receive a notification to approve or reject this request. See [Handling Refunds](./refund-system.md) for more details.

---

## How to Update an Order

1.  Go to **Admin > Orders**.
2.  Click on the order you want to update.
3.  Click the **Update Status** button.
4.  Select the new status (e.g., change from "Processing" to "Ready").
5.  Click **Save**.

This customer will automatically receive an email or notification about the status change.

---

## Common Questions

### Can I edit an order after it is delivered?

No. Once an order is marked as **Delivered**, it is considered complete and cannot be changed. This prevents accidental edits to your sales history.

### What happens if I cancel an order?

When you cancel an order (e.g., if you ran out of stock), the system will automatically add the items back to your inventory count so other customers can buy them.

### Why can't I see the "Refund" button?

Refunds are only available for **PAID** orders within the 24-hour window. If you need to issue a manual refund or credit later, you might need to use the Voucher system to give them store credit.







