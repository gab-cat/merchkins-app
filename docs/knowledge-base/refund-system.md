---
title: Refund System & Scenarios
description: Complete guide to refund workflows, voucher issuance, and payout attribution for refunded orders.
category: finance
icon: DollarSign
lastUpdated: 2025-12-12
---

# Refund System Scenarios & Payout Flows

## Overview

This document outlines all scenarios, flows, and payout attribution for the refund and cancellation system implemented in Merchkins. The system allows customers to cancel unpaid orders immediately or request refunds for paid orders (within 24 hours), with all refunds issued as platform-wide vouchers.

---

## Quick Reference

| Aspect                | Details                                      |
| --------------------- | -------------------------------------------- |
| **Refund Window**     | 24 hours from payment                        |
| **Refund Type**       | Platform-wide voucher only (no cash refunds) |
| **Approval Required** | Yes, admin approval needed                   |
| **Voucher Validity**  | Indefinite (no expiration)                   |
| **Voucher Scope**     | Platform-wide (usable at any store)          |
| **Payout Impact**     | Seller receives ₱0 for refunded orders       |

---

## Table of Contents

1. [Normal Order Flow](#scenario-1-normal-order-flow-no-refund)
2. [Unpaid Order Cancellation](#scenario-2-unpaid-order-cancellation)
3. [Paid Order Refund - Approved](#scenario-3-paid-order-refund-request---approved)
4. [Paid Order Refund - Rejected](#scenario-4-paid-order-refund-request---rejected)
5. [REFUND Voucher Usage - Full Coverage](#scenario-5-refund-voucher-usage---full-coverage)
6. [REFUND Voucher Usage - Partial Coverage](#scenario-6-refund-voucher-usage---partial-coverage-mixed-payment)
7. [REFUND Voucher Usage - Exceeds Value](#scenario-7-refund-voucher-usage---exceeds-voucher-value)
8. [Voucher Used at Original Store](#scenario-8-refund-voucher-used-at-original-store)
9. [Voucher Used at Different Store](#scenario-9-refund-voucher-used-at-different-store)
10. [Full Voucher Coverage - Zero Cost Order](#scenario-10-full-voucher-coverage---zero-cost-order)
11. [Edge Cases](#edge-cases)
12. [Payout Formulas](#payout-calculation-summary)
13. [Revenue Attribution Matrix](#revenue-attribution-matrix)

---

## Scenario 1: Normal Order Flow (No Refund)

### Flow

1. Customer places order at Store A (₱1,000)
2. Customer pays via Xendit (₱1,000)
3. Order status: `PAID`
4. Store A fulfills order
5. Order status: `DELIVERED`

### Payout Attribution

- **Store A receives**: ₱850 (₱1,000 - 15% platform fee)
- **Platform receives**: ₱150 (15% platform fee)
- **Customer**: Paid ₱1,000, received goods

### Timeline

- Payment: Immediate
- Payout: Weekly payout cycle
- Seller receives: ₱850

---

## Scenario 2: Unpaid Order Cancellation

### Flow

1. Customer places order at Store A (₱1,000)
2. Order status: `PENDING`, Payment status: `PENDING`
3. Customer clicks "Cancel Order"
4. Order cancelled immediately
5. Inventory restored

### Payout Attribution

- **Store A receives**: ₱0 (no payment received)
- **Platform receives**: ₱0
- **Customer**: No charge, order cancelled

### Notes

- No refund needed (order was never paid)
- Inventory automatically restored
- No financial transaction occurred
- Order can be cancelled at any time before payment

---

## Scenario 3: Paid Order Refund Request - APPROVED

### Flow

1. Customer places order at Store A (₱1,000)
2. Customer pays via Xendit (₱1,000)
3. Order status: `PAID`
4. Within 24 hours, customer requests refund with reason
5. Admin approves refund request
6. REFUND voucher created: `REFUND-XXXXXX` (₱1,000)
7. Order payment status: `REFUNDED`
8. Voucher sent to customer via email

### Payout Attribution

- **Store A receives**: ₱0 (order refunded, no payout)
- **Platform receives**: ₱0 (no revenue from this order)
- **Platform cost**: ₱1,000 (voucher liability)
- **Customer**: Receives ₱1,000 REFUND voucher

### Voucher Details

- **Code**: `REFUND-XXXXXX`
- **Value**: ₱1,000
- **Type**: REFUND
- **Expiration**: None (valid indefinitely)
- **Scope**: Platform-wide (usable at any store)
- **Assignment**: Personal (assigned to customer's account)
- **Usage limit**: Single-use

### Timeline

- Refund request: Within 24 hours of payment
- Admin review: Manual approval required
- Voucher issuance: Immediate upon approval
- Email notification: Sent to customer with voucher code

---

## Scenario 4: Paid Order Refund Request - REJECTED

### Flow

1. Customer places order at Store A (₱1,000)
2. Customer pays via Xendit (₱1,000)
3. Order status: `PAID`
4. Within 24 hours, customer requests refund
5. Admin rejects refund request with reason
6. Order remains `PAID`

### Payout Attribution

- **Store A receives**: ₱850 (normal payout, minus platform fee)
- **Platform receives**: ₱150 (platform fee)
- **Customer**: Paid ₱1,000, no refund, order continues

### Timeline

- Refund request: Within 24 hours of payment
- Admin review: Manual rejection with required message
- Order status: Remains `PAID`
- Payout: Normal weekly payout cycle

---

## Scenario 5: REFUND Voucher Usage - Full Coverage

### Flow

1. Customer has REFUND voucher: `REFUND-XXXXXX` (₱1,000)
2. Customer places new order at Store B (₱800)
3. Customer applies REFUND voucher at checkout
4. Order total: ₱800
5. Voucher covers: ₱800
6. Remaining: ₱0
7. Order created with voucher applied
8. Order status: `PAID` (via voucher)

### Payout Attribution

- **Store B receives**: ₱680 (₱800 - 15% platform fee = ₱680)
- **Platform receives**: ₱120 (15% platform fee)
- **Platform cost**: ₱800 (voucher redemption cost)
- **Net platform impact**: -₱680 (platform pays Store B)
- **Customer**: Used ₱800 voucher, paid ₱0 cash

### Accounting Entry

- `voucherRedemptionCosts` record created:
  - Voucher: `REFUND-XXXXXX`
  - Amount covered: ₱800
  - Seller: Store B
  - Platform absorbs cost

### Key Points

- Seller receives normal payout regardless of payment method
- Platform tracks voucher cost separately
- Voucher is marked as used (single-use)

---

## Scenario 6: REFUND Voucher Usage - Partial Coverage (Mixed Payment)

### Flow

1. Customer has REFUND voucher: `REFUND-XXXXXX` (₱1,000)
2. Customer places new order at Store C (₱1,500)
3. Customer applies REFUND voucher at checkout
4. Order total: ₱1,500
5. Voucher covers: ₱1,000
6. Remaining: ₱500
7. Customer pays ₱500 via Xendit
8. Order created with voucher + cash payment

### Payout Attribution

- **Store C receives**: ₱1,275 (₱1,500 - 15% platform fee = ₱1,275)
- **Platform receives**: ₱225 (15% platform fee from ₱1,500)
- **Platform cost**: ₱1,000 (voucher redemption cost)
- **Net platform impact**: -₱775 (platform pays Store C ₱1,000, receives ₱225)
- **Customer**: Used ₱1,000 voucher + paid ₱500 cash = ₱1,500 total

### Accounting Entry

- `voucherRedemptionCosts` record created:
  - Voucher: `REFUND-XXXXXX`
  - Amount covered: ₱1,000
  - Seller: Store C
  - Platform absorbs cost

### Payment Breakdown

- Voucher payment: ₱1,000
- Cash payment: ₱500
- Total order: ₱1,500

---

## Scenario 7: REFUND Voucher Usage - Exceeds Voucher Value

### Flow

1. Customer has REFUND voucher: `REFUND-XXXXXX` (₱1,000)
2. Customer places new order at Store D (₱2,000)
3. Customer applies REFUND voucher at checkout
4. Order total: ₱2,000
5. Voucher covers: ₱1,000 (maximum)
6. Remaining: ₱1,000
7. Customer pays ₱1,000 via Xendit
8. Order created with voucher + cash payment

### Payout Attribution

- **Store D receives**: ₱1,700 (₱2,000 - 15% platform fee = ₱1,700)
- **Platform receives**: ₱300 (15% platform fee from ₱2,000)
- **Platform cost**: ₱1,000 (voucher redemption cost)
- **Net platform impact**: -₱700 (platform pays Store D ₱1,000, receives ₱300)
- **Customer**: Used ₱1,000 voucher + paid ₱1,000 cash = ₱2,000 total

### Important Note

- Voucher cannot exceed order value
- Voucher covers up to its full value (₱1,000)
- Remaining amount must be paid via cash/card
- Voucher is single-use, so unused portion is lost if order is less than voucher value

---

## Scenario 8: REFUND Voucher Used at Original Store

### Flow

1. Customer orders from Store A (₱1,000) → Paid
2. Customer requests refund → Approved
3. REFUND voucher issued (₱1,000)
4. Customer places new order at Store A (₱1,200)
5. Customer applies REFUND voucher
6. Pays remaining ₱200 via Xendit

### Payout Attribution

- **Store A receives**: ₱1,020 (₱1,200 - 15% platform fee = ₱1,020)
- **Platform receives**: ₱180 (15% platform fee)
- **Platform cost**: ₱1,000 (voucher redemption)
- **Net platform impact**: -₱820
- **Store A net**: ₱1,020 (from new order) - ₱0 (from refunded order) = ₱1,020

### Analysis

- Store A effectively gets paid for the new order
- Platform absorbs the cost of the original refund
- Store A is not penalized for the refund
- Store A receives normal payout for new order

---

## Scenario 9: REFUND Voucher Used at Different Store

### Flow

1. Customer orders from Store A (₱1,000) → Paid
2. Customer requests refund → Approved
3. REFUND voucher issued (₱1,000)
4. Customer places new order at Store B (₱1,200)
5. Customer applies REFUND voucher
6. Pays remaining ₱200 via Xendit

### Payout Attribution

- **Store A receives**: ₱0 (original order refunded, no payout)
- **Store B receives**: ₱1,020 (₱1,200 - 15% platform fee = ₱1,020)
- **Platform receives**: ₱180 (15% platform fee)
- **Platform cost**: ₱1,000 (voucher redemption at Store B)
- **Net platform impact**: -₱820

### Analysis

- **Store A**: Lost ₱850 potential payout (original order refunded)
- **Store B**: Receives full payout for new order
- **Platform**: Absorbs the cost difference between stores
- **Customer**: Can shop anywhere with refund voucher

### Business Rationale

This is the intended behavior - platform-wide vouchers allow customers to shop anywhere, maintaining customer satisfaction while the platform manages the cross-store cost.

---

## Scenario 10: Full Voucher Coverage - Zero Cost Order

### Flow

1. Customer has REFUND voucher: `REFUND-XXXXXX` (₱1,000)
2. Customer places new order at Store E (₱800)
3. Customer applies REFUND voucher at checkout
4. Order total: ₱800
5. Voucher covers: ₱800 (full coverage)
6. Remaining: ₱0
7. Order created with `paymentStatus: PAID` (no payment link needed)
8. Order immediately marked as paid via voucher

### Payout Attribution

- **Store E receives**: ₱680 (₱800 - 15% platform fee = ₱680)
- **Platform receives**: ₱120 (15% platform fee)
- **Platform cost**: ₱800 (voucher redemption cost)
- **Net platform impact**: -₱680 (platform pays Store E)
- **Customer**: Used ₱800 voucher, paid ₱0 cash

### Key Points

- **No Payment Link**: Order is automatically marked as PAID when voucher fully covers cost
- **Immediate Confirmation**: Customer redirected to success page immediately (no payment step)
- **Seller Gets Full Payout**: Seller receives normal payout for the order value (platform absorbs voucher cost)
- **Platform Absorbs Cost**: Platform covers the full voucher amount for REFUND vouchers

### Accounting Entry

- `voucherRedemptionCosts` record created:
  - Voucher: `REFUND-XXXXXX`
  - Amount covered: ₱800
  - Seller: Store E
  - Platform absorbs cost

### Order Status

- **Payment Status**: `PAID` (set automatically)
- **Order Status**: `PENDING` (normal order flow)
- **Payment Method**: Voucher (no Xendit invoice created)

### Important Notes

- This applies to any voucher type (REFUND, PERCENTAGE, FIXED_AMOUNT) that fully covers the order
- For REFUND vouchers: Seller gets full payout (platform absorbs cost)
- For regular vouchers: Seller gets discounted payout (seller provides discount)
- Order log indicates "Paid in full by voucher"

---

## Edge Cases

### Case 1: Refund Request After 24 Hours

**Flow**: Customer tries to request refund >24 hours after payment

**Result**:

- Request rejected with error message
- "Refund requests must be submitted within 24 hours of payment"

**Payout**: Normal payout proceeds (no refund)

---

### Case 2: Refund Request for Delivered Order

**Flow**: Customer tries to request refund for delivered order

**Result**:

- Request rejected
- "Cannot request refund for delivered orders"

**Payout**: Normal payout proceeds

---

### Case 3: REFUND Voucher Applied to Order Less Than Voucher Value

**Flow**: Customer has ₱1,000 voucher, orders ₱500 item

**Result**:

- Voucher covers ₱500
- Remaining ₱500 voucher value is lost (single-use voucher)
- Customer should be informed that unused amount cannot be refunded

**Payout**: Seller gets full payout for ₱500 order

**Recommendation**: Consider warning customers about unused voucher amounts

---

## Payout Calculation Summary

### Standard Order Payout Formula

```
Seller Payout = Order Total × (1 - Platform Fee %)
Platform Fee = Order Total × Platform Fee %

Example: ₱1,000 order with 15% platform fee
Seller Payout = ₱1,000 × 0.85 = ₱850
Platform Fee = ₱1,000 × 0.15 = ₱150
```

### Order with REFUND Voucher Payout Formula

```
Seller Payout = Order Total × (1 - Platform Fee %)
Platform Fee = Order Total × Platform Fee %
Platform Cost = Voucher Amount Used
Net Platform Impact = Platform Fee - Platform Cost

Example: ₱1,000 order with ₱800 REFUND voucher
Seller Payout = ₱1,000 × 0.85 = ₱850
Platform Fee = ₱1,000 × 0.15 = ₱150
Platform Cost = ₱800
Net Platform Impact = ₱150 - ₱800 = -₱650
```

---

## Key Business Rules

### Refund Rules

1. **Refunds are Voucher-Only**: No cash refunds under any circumstances
2. **24-Hour Window**: Refund requests only accepted within 24 hours of payment
3. **No Partial Refunds**: Only full order refunds (no item-level refunds)
4. **Delivered Orders**: Cannot be refunded
5. **Admin Approval Required**: All refund requests require admin review
6. **Admin Message Required**: Approve/reject actions require admin message

### Voucher Rules

1. **Platform-Wide**: REFUND vouchers can be used at any store
2. **No Expiration**: Vouchers remain valid indefinitely
3. **Single-Use**: Each voucher can only be used once
4. **Personal Assignment**: Vouchers are assigned to specific user account
5. **Non-Transferable**: Cannot be used by other users
6. **Mixed Payment**: Vouchers can be combined with cash/card payments

### Payout Rules

1. **Platform Absorbs Costs**: When REFUND vouchers are used, platform covers the cost
2. **Sellers Always Get Paid**: Sellers receive normal payout even when order is paid with REFUND voucher
3. **Independent Calculations**: Payout calculations are independent of payment method
4. **Normal Payout Formula**: Seller payout = Order Total × (1 - Platform Fee %)

---

## Frequently Asked Questions

### Q: Can customers get cash refunds?

**A**: No. All refunds are issued as platform vouchers only. This is an absolute business rule.

### Q: What happens if a voucher value exceeds the order total?

**A**: The voucher covers up to its full value. The remaining order amount must be paid via cash/card. Unused voucher amount is lost (single-use voucher).

### Q: Can vouchers be transferred to other users?

**A**: No. REFUND vouchers are personally assigned and cannot be transferred.

### Q: What if a seller receives an order paid with a REFUND voucher from another store?

**A**: The seller receives normal payout. The platform absorbs the voucher cost. This is intentional - vouchers are platform-wide.

### Q: How are voucher costs tracked?

**A**: Every voucher redemption creates a record in `voucherRedemptionCosts` table, linking the voucher, order, and seller for accounting purposes.

### Q: What happens if a refund request is submitted after 24 hours?

**A**: The request is automatically rejected with an error message. The order continues normally with standard payout.

---

## Related Articles

- [Voucher System](./voucher-system.md)
- [Payout System](./payout-system.md)
- [Order Management](./order-management.md)
