---
title: Voucher & Coupon System
description: Creating vouchers, validation rules, voucher types, usage tracking, and redemption workflows.
category: finance
icon: DollarSign
lastUpdated: 2025-12-12
---

# Voucher & Coupon System

## Overview

The voucher system allows you to create discount codes and promotional vouchers for customers. Vouchers can be percentage-based, fixed amount, free items, or platform-wide refund vouchers.

---

## Quick Reference

| Aspect            | Details                                                    |
| ----------------- | ---------------------------------------------------------- |
| **Voucher Types** | PERCENTAGE, FIXED_AMOUNT, FREE_ITEM, FREE_SHIPPING, REFUND |
| **Code Format**   | Auto-generated or custom (with prefix)                     |
| **Usage Limits**  | Total limit and per-user limit                             |
| **Validity**      | Start and end dates                                        |
| **Scope**         | Organization-specific or platform-wide                     |
| **Single Use**    | Can enforce one-time use per customer                      |

---

## Voucher Types

### PERCENTAGE

Percentage discount off the order total.

**Example:** 10% off order

**Configuration:**

- Discount percentage (e.g., 10%)
- Maximum discount cap (optional)
- Minimum order amount (optional)

**Calculation:**

```
Discount = Order Total × (Percentage / 100)
If maxDiscountCap exists: Discount = min(Discount, maxDiscountCap)
```

---

### FIXED_AMOUNT

Fixed amount discount off the order total.

**Example:** ₱100 off order

**Configuration:**

- Fixed discount amount (e.g., ₱100)
- Minimum order amount (optional)

**Calculation:**

```
Discount = Fixed Amount
If order total < discount amount: Discount = Order Total
```

---

### FREE_ITEM

Free item with purchase.

**Example:** Buy 2, get 1 free

**Configuration:**

- Free product ID
- Purchase requirement (quantity or amount)

**Usage:**

- Applied automatically when conditions met
- Free item added to order at checkout

---

### FREE_SHIPPING

Free shipping voucher (future use).

**Configuration:**

- Applies to shipping costs
- Can have minimum order amount

---

### REFUND

Platform-wide refund vouchers (system-generated).

**Characteristics:**

- Created automatically when refund is approved
- Platform-wide (usable at any store)
- Personal assignment (assigned to specific user)
- No expiration
- Single-use only

**Note:** REFUND vouchers are created by the system, not manually by admins.

---

## Creating Vouchers

### Step 1: Navigate to Vouchers

1. Go to Admin → Vouchers
2. Click "Create New Voucher"

### Step 2: Configure Voucher

**Basic Information:**

- **Voucher Code**: Auto-generate or enter custom code
- **Code Prefix**: Optional prefix (e.g., "SUMMER")
- **Description**: Voucher description visible to customers

**Discount Configuration:**

- **Discount Type**: Select type (PERCENTAGE, FIXED_AMOUNT, FREE_ITEM)
- **Discount Value**: Percentage or amount
- **Maximum Discount Cap**: For percentage vouchers (optional)

**Usage Limits:**

- **Total Usage Limit**: Maximum times voucher can be used
- **Per-User Limit**: Maximum times one user can use it
- **Single Use**: Enforce one-time use per customer

**Validity Period:**

- **Start Date**: When voucher becomes active
- **End Date**: When voucher expires
- **No Expiration**: Leave end date empty for indefinite validity

**Restrictions:**

- **Minimum Order Amount**: Required order total to use voucher
- **Organization Scope**: Organization-specific or platform-wide
- **Product Restrictions**: Apply to specific products only (optional)
- **Category Restrictions**: Apply to specific categories only (optional)

### Step 3: Save Voucher

1. Review all settings
2. Click "Create Voucher"
3. Voucher is immediately active (if start date has passed)

---

## Voucher Validation

### Validation Rules

When a customer applies a voucher, the system checks:

1. **Voucher Exists** - Code is valid
2. **Active Status** - Voucher is enabled
3. **Validity Period** - Current date is within start/end dates
4. **Usage Limits** - Total usage and per-user limits not exceeded
5. **Organization Scope** - Voucher applies to the store (or platform-wide)
6. **Minimum Order** - Order total meets minimum requirement
7. **Product/Category Restrictions** - Order items match restrictions
8. **Personal Assignment** - For REFUND vouchers, must be assigned to user

### Validation Errors

Common validation errors:

- "Voucher code not found"
- "This voucher has expired"
- "This voucher has reached its usage limit"
- "Order total does not meet minimum requirement"
- "This voucher is not valid for this store"
- "This voucher is not assigned to you" (REFUND vouchers)

---

## Voucher Usage Tracking

### Usage Records

Each voucher usage creates a record tracking:

- Voucher code used
- Order ID
- User who used it
- Discount amount applied
- Timestamp

### Analytics

View voucher performance:

- Total usage count
- Total discount given
- Unique users who used it
- Usage over time
- Most popular vouchers

---

## Voucher Management

### Enabling/Disabling

Toggle voucher status:

1. Go to voucher details
2. Click "Enable" or "Disable"
3. Disabled vouchers cannot be used

**Use Cases:**

- Temporarily disable during maintenance
- Disable expired vouchers
- Enable seasonal vouchers

### Updating Vouchers

You can update:

- Description
- Usage limits
- Validity dates
- Restrictions
- Discount value (be careful with active vouchers)

**Note:** Changing active vouchers may affect existing orders. Consider creating new vouchers instead.

### Deleting Vouchers

- Soft delete: Voucher is marked as deleted
- Cannot be used after deletion
- Historical usage records remain

---

## Common Scenarios

### Scenario 1: Create 10% Off Voucher

**Configuration:**

- Type: PERCENTAGE
- Value: 10%
- Max Cap: ₱500 (optional)
- Min Order: ₱1,000
- Usage Limit: 100 times
- Validity: 1 month

**Result:** Customers get 10% off orders over ₱1,000, up to ₱500 discount

---

### Scenario 2: Create ₱200 Off Voucher

**Configuration:**

- Type: FIXED_AMOUNT
- Value: ₱200
- Min Order: ₱500
- Usage Limit: 50 times
- Validity: 2 weeks

**Result:** Customers get ₱200 off orders over ₱500

---

### Scenario 3: Platform-Wide Sale Voucher

**Configuration:**

- Type: PERCENTAGE
- Value: 15%
- Organization Scope: Platform-wide
- Usage Limit: 1000 times
- Validity: 1 week

**Result:** All stores can use this voucher during the sale period

---

### Scenario 4: REFUND Voucher Usage

**Flow:**

1. Customer receives REFUND voucher from refund approval
2. Customer applies voucher at checkout
3. Voucher covers order amount (or partial)
4. Remaining amount paid via cash/card
5. Voucher marked as used

**Note:** REFUND vouchers are platform-wide and personal to the customer.

---

### Scenario 5: Zero-Cost Orders (Full Voucher Coverage)

**Flow:**

1. Customer applies voucher at checkout
2. Voucher discount equals or exceeds order total
3. Order total becomes ₱0 (capped, never negative)
4. Order automatically created with `paymentStatus: PAID`
5. No payment link generated (Xendit invoice not created)
6. Customer redirected to success page immediately

**Key Points:**

- **Automatic Payment**: Orders fully covered by vouchers are automatically marked as PAID
- **No Payment Step**: Customer skips payment page entirely
- **Immediate Confirmation**: Order confirmation shown right away
- **Order Log**: System log indicates "Paid in full by voucher"

**Payout Behavior:**

- **REFUND Vouchers**: Seller receives full payout (platform absorbs voucher cost)
  - Example: ₱1,000 order with ₱1,000 REFUND voucher
  - Seller gets: ₱850 (₱1,000 - 15% platform fee)
  - Platform absorbs: ₱1,000 voucher cost
- **Regular Vouchers**: Seller receives discounted payout (seller provides discount)
  - Example: ₱1,000 order with ₱1,000 FIXED_AMOUNT voucher
  - Seller gets: ₱0 (order total was ₱0 after discount)
  - Seller provided: ₱1,000 discount

**Technical Details:**

- Voucher discount is capped at order subtotal (cannot exceed)
- If `totalAmount === 0` and `voucherDiscount > 0`, order is auto-PAID
- Order log message includes voucher information and payment status
- No Xendit invoice URL is returned for zero-cost orders

**Use Cases:**

- REFUND vouchers fully covering new orders
- Promotional vouchers covering entire order
- Percentage vouchers with high discount values
- Fixed amount vouchers equal to or greater than order total

---

## Best Practices

### Voucher Creation

1. **Clear Codes** - Use memorable, easy-to-enter codes
2. **Set Limits** - Always set usage limits to control costs
3. **Validity Periods** - Set end dates for time-limited promotions
4. **Minimum Orders** - Require minimum order amounts to ensure profitability
5. **Test First** - Test vouchers before launching campaigns

### Voucher Management

1. **Monitor Usage** - Track voucher performance regularly
2. **Disable Expired** - Disable vouchers after expiration
3. **Review Analytics** - Analyze which vouchers are most effective
4. **Update Limits** - Adjust usage limits based on demand
5. **Document Purpose** - Keep notes on why vouchers were created

### Cost Control

1. **Set Caps** - Use maximum discount caps for percentage vouchers
2. **Limit Scope** - Restrict to specific products/categories when possible
3. **Monitor Redemptions** - Watch for unusual usage patterns
4. **Time Limits** - Use short validity periods for high-value vouchers
5. **Per-User Limits** - Prevent abuse with per-user limits

---

## Frequently Asked Questions

### Q: Can I create a voucher that works at all stores?

**A:** Yes, set the organization scope to "Platform-wide" when creating the voucher.

### Q: What happens if a voucher expires while a customer is checking out?

**A:** The voucher validation happens at checkout. If it expires before checkout completes, it will be rejected.

### Q: Can customers use multiple vouchers on one order?

**A:** No, only one voucher can be applied per order.

### Q: How do REFUND vouchers differ from regular vouchers?

**A:** REFUND vouchers are system-generated, platform-wide, personally assigned, have no expiration, and are single-use only. They're created when refunds are approved.

### Q: Can I change a voucher after it's been used?

**A:** Yes, but be careful. Changes may affect future usage. Consider creating a new voucher instead.

### Q: What happens if a voucher reaches its usage limit?

**A:** The voucher becomes invalid and cannot be used further. You can increase the limit if needed.

### Q: What happens when a voucher fully covers an order (zero cost)?

**A:** When a voucher discount equals or exceeds the order total, the order is automatically marked as PAID. No payment link is generated, and the customer is immediately redirected to the success page. For REFUND vouchers, sellers still receive full payout (platform absorbs the cost). For regular vouchers, sellers receive the discounted payout amount.

---

## Related Articles

- [Refund System](./refund-system.md)
- [Order Management](./order-management.md)
