---
title: Voucher & Coupon System
description: Guide to managing discounts, promotions, and refund vouchers for your store.
category: finance
icon: DollarSign
lastUpdated: 2025-12-17
---

# Voucher & Coupon System

## Overview

The voucher system helps you run promotions and manage customer refunds. You can create different types of vouchers like percentage discounts, fixed amount off, or even free items to boost your sales.

---

## Quick Reference

| Type             | Description                                               |
| :--------------- | :-------------------------------------------------------- |
| **Percentage**   | Gives a % discount (e.g., 10% off).                       |
| **Fixed Amount** | Gives a specific amount off (e.g., ₱100 off).             |
| **Free Item**    | Adds a free item to the order (e.g., Buy 1 Get 1).        |
| **Refund**       | A special credit given to customers for approved refunds. |

---

## Types of Vouchers

### 1. Percentage Discount

Good for site-wide sales or specific collections.

- **Example:** "Get 10% off your first order"
- **How it works:** Deducts a percentage from the order total. You can set a **maximum discount limit** (e.g., 10% off up to ₱500) to protect your margins.

### 2. Fixed Amount Discount

Good for driving conversions with a clear monetary value.

- **Example:** "₱100 off when you spend ₱1,000"
- **How it works:** Deducts a fixed currency amount from the total. If the discount is higher than the order total, the order becomes free.

### 3. Free Item

Good for clearing inventory or introducing new products.

- **Example:** "Free Sticker Pack with every T-shirt"
- **How it works:** Automatically adds a specific item to the cart when the customer meets your conditions (like buying a specific product).

### 4. Refund Voucher

- **What is it?** When you approve a refund request or cancel a paid order, the system automatically creates this voucher for the customer.
- **How it works:** The customer receives a code equal to the refund amount. They can use this code to buy anything from any store on the platform.
- **Cancellation Types:**
  - **Customer-initiated:** 
    - **Process:** Customers can request a refund within **24 hours** of making a payment. Once you approve the request, the system automatically creates a refund voucher for the customer. If you reject the request, the order continues as normal and no voucher is issued.
    - **Monetary Refund Eligibility:** Customer-initiated refund vouchers are **not eligible** for monetary refund requests through the platform system. However, consumers retain their statutory rights to monetary refunds where required by Philippine consumer protection laws (e.g., for defective, damaged, or misrepresented products).
    - **Use Case:** This provides a convenient way to handle refunds while maintaining platform engagement.
  - **Seller-initiated:** 
    - **Process:** When you cancel a paid order, the system automatically creates a refund voucher for the customer. Monetary refunds are processed immediately or as required by law, without undue delay.
    - **Monetary Refund Eligibility:** Seller-initiated vouchers become eligible for monetary refund requests after a **14-day waiting period** from voucher creation (only if completely unused).
    - **Use Case:** Provides customers with immediate credit while allowing them to request monetary refunds after the waiting period if they prefer.
- **Note for Sellers:** If a customer uses a Refund Voucher to buy from your store, **you still get paid the full amount** (minus the standard platform fee). The platform covers the cost of the voucher.

---

## How to Create a Voucher

1.  Go to **Admin > Vouchers**.
2.  Click **Create New Voucher**.
3.  Fill in the details:
    - **Code:** Create a unique code (e.g., `WELCOME2024`) or let the system generate one.
    - **Discount:** Choose the type (Percentage, Fixed Amount, etc.) and value.
    - **Limits:**
      - **Total Usage Limit:** How many times can this code be used in total? (e.g., first 100 customers).
      - **Per-User Limit:** How many times can _one person_ use it? (usually 1).
    - **Dates:** Set a Start Date and an optional End Date.
    - **Minimum Order:** Require customers to spend a certain amount to use the code.
4.  Click **Create Voucher**.

---

## Managing Your Vouchers

- **Disabling a Voucher:** You can stop a promotion anytime by finding the voucher in your list and clicking **Disable**. This prevents any new orders from using that code.
- **Tracking Usage:** Click on any voucher to see how many times it has been used and the total discount amount given.

---

## Common Questions

### What happens if a voucher covers the entire order amount?

If a discount makes the order total ₱0, the customer will not need to pay anything. The order is automatically marked as **PAID**.

### Can I limit a voucher to specific products?

Yes, when creating a voucher, you can choose to apply it only to specific products or categories.

### Can customers use multiple vouchers at once?

No, the system currently allows only one voucher code per order.

### Why did I receive an order paid with a "Refund Voucher"?

This means the customer used credit from a previous refund. Don't worry—this is treated like cash. You will receive your payout for this order just like any normal transaction.

### What happens when I cancel a paid order?

When you cancel a paid order, refunds will be processed promptly in accordance with applicable Philippine consumer protection statutes. Monetary refunds will be issued immediately or as required by law, without undue delay. The system may create a refund voucher marked as "seller-initiated," but consumers retain their statutory rights to monetary refunds where required by law. The voucher remains valid and usable until the customer requests a monetary refund (if they choose to do so).

### Can customers see their vouchers?

Yes. Customers can view all their vouchers on the Vouchers page (`/vouchers`). They can see voucher details, status, and request monetary refunds in accordance with their statutory rights under Philippine consumer protection laws (R.A. 7394 and R.A. 8792).

### How does the customer-initiated refund process work?

**For Customers:**

1. **Request Window:** You can request a refund within **24 hours** of making a payment for an order. After 24 hours, the system blocks new refund requests (though sellers may still coordinate refunds offline if they choose).

2. **Submitting a Request:** 
   - Go to your order details page
   - Select a reason for the refund (e.g., wrong size, defective item, changed mind)
   - Optionally add a message explaining your request
   - Submit the request

3. **Review Process:** The seller reviews your request and can either approve or reject it. You'll receive a notification when the seller makes a decision.

4. **If Approved:**
   - The order is automatically cancelled
   - A **Refund Voucher** is created for you equal to the amount you paid
   - The voucher can be used immediately on any store on the platform
   - The voucher never expires
   - **Important:** Customer-initiated refund vouchers cannot be converted to monetary refunds through the platform system. However, you retain your statutory rights to monetary refunds where required by Philippine consumer protection laws (e.g., for defective, damaged, or misrepresented products).

5. **If Rejected:**
   - The order continues as normal
   - No voucher is issued
   - You can contact the seller directly if you have concerns

**For Sellers:**

- You'll see refund requests in your Admin Dashboard
- Review each request and provide an approval or rejection with a message
- Approved requests automatically create refund vouchers and cancel the order
- Rejected requests allow the order to continue processing normally
