---
title: Payout System
description: Weekly payout schedules, platform fee calculations, invoice generation, and bank details management.
category: finance
icon: DollarSign
lastUpdated: 2025-12-16
---

# Payout System Guide

## Overview

The payout system automatically generates weekly invoices for organization storefronts based on their sales. Payouts are calculated weekly, with invoices generated every Wednesday and payments processed every Friday.

---

## Quick Reference

| Aspect                 | Details                                     |
| ---------------------- | ------------------------------------------- |
| **Payout Schedule**    | Weekly (Wednesday cut-off, Friday payment)  |
| **Cut-off Period**     | Wednesday 00:00 UTC to Tuesday 23:59:59 UTC |
| **Invoice Generation** | Every Wednesday at 00:05 UTC (automatic)    |
| **Payment Processing** | Every Friday (manual by super-admin)        |
| **Platform Fee**       | Default 15% (customizable per organization) |
| **Payment Method**     | Bank transfer (configure bank details)      |

---

## Payout Schedule

### Weekly Cycle

**Cut-off Period:**

- Starts: Wednesday 00:00 UTC
- Ends: Tuesday 23:59:59 UTC
- Duration: 7 days

**Invoice Generation:**

- When: Every Wednesday at 00:05 UTC
- Process: Automatic via cron job
- Includes: All PAID orders from previous week based on **payment date** (when payment was received), not order date

**Payment Processing:**

- When: Every Friday (manual)
- Who: Super-admin marks invoices as paid
- Notification: Email sent to organization when paid

---

## Platform Fee Calculation

### Default Fee

**Standard Platform Fee:** 15%

**Calculation:**

```
Gross Amount = Sum of all PAID orders in period
Platform Fee = Gross Amount × 0.15
Net Amount = Gross Amount - Platform Fee
```

**Example:**

- Gross sales: ₱10,000
- Platform fee (15%): ₱1,500
- Net payout: ₱8,500

### Custom Fees

Super-admins can set custom platform fees per organization:

- Useful for special partnerships
- Can be higher or lower than default
- Applied to all future payouts
- Historical invoices retain original fee

**Setting Custom Fee:**

1. Super-admin navigates to organization settings
2. Sets custom platform fee percentage
3. Fee applies to next payout cycle

---

## Invoice Generation

### Automatic Process

Every Wednesday at 00:05 UTC:

1. System calculates previous week's period (Wed-Tue)
2. Queries all active organizations
3. For each organization:
   - Aggregates all PAID orders **paid during the period** (based on payment date, not order date)
   - Includes any pending adjustments from previous payouts (refunds/cancellations)
   - Calculates gross amount
   - Applies platform fee
   - Calculates net amount (after adjustments)
   - Creates payout invoice record
   - Links orders to invoice (prevents double-counting)
4. Optionally sends email notifications

**Important:** Orders are assigned to payout periods based on **when payment was received** (`paidAt`), not when the order was placed. This ensures accurate accounting - if a customer places an order on Tuesday but pays on Wednesday, the order is included in Wednesday's payout period.

### Invoice Contents

Each invoice includes:

- **Invoice Number** - Unique identifier
- **Organization** - Store name
- **Period** - Start and end dates
- **Gross Amount** - Total sales
- **Platform Fee** - Fee percentage and amount
- **Adjustments** - Post-payout refunds/cancellations (if any) - shown as negative amount
- **Net Amount** - Final amount to be paid (after adjustments)
- **Order Count** - Number of orders included
- **Status** - PENDING, PAID, etc.
- **Generated Date** - When invoice was created

### Manual Generation

Super-admins can manually trigger invoice generation:

- Useful for testing
- Can generate for specific periods
- Follows same calculation logic

---

## Payment Processing

### Payment Workflow

1. **Invoice Generated** (Wednesday)
   - Invoice created with PENDING status
   - Email notification sent to organization
   - PDF invoice available for download

2. **Bank Transfer** (Friday)
   - Super-admin processes payment
   - Transfers net amount to organization's bank account
   - Uses bank details from organization settings

3. **Mark as Paid** (Friday)
   - Super-admin marks invoice as PAID
   - Payment confirmation email sent
   - Invoice status updated

### Payment Status

**PENDING:**

- Invoice generated, awaiting payment
- Organization can view and download invoice
- Bank details should be configured

**PAID:**

- Payment processed and confirmed
- Email confirmation sent
- Invoice marked as complete

---

## Bank Details Management

### Setting Bank Details

Organization admins can configure bank details:

1. Navigate to Organization Settings
2. Go to Payouts section
3. Enter bank information:
   - Bank name
   - Account number
   - Account holder name
   - Branch (optional)
   - SWIFT/BIC code (if international)
4. Save bank details

**Security:**

- Bank details are encrypted
- Only organization admins can view/edit
- Super-admins see masked details for verification

### Updating Bank Details

1. Go to Organization Settings → Payouts
2. Click "Edit Bank Details"
3. Update information
4. Save changes

**Note:** Changes apply to future payouts only. Current pending invoices use existing details.

---

## Invoice Management

### Viewing Invoices

**For Organization Admins:**

1. Navigate to Admin → Payouts
2. View list of invoices
3. Filter by status, date range
4. Click invoice to view details
5. Download PDF invoice

**For Super-Admins:**

1. Navigate to Super Admin → Payouts
2. View all invoices across organizations
3. Filter by organization, status, date
4. Mark invoices as paid
5. View payout analytics

### Invoice Details

Each invoice shows:

- Invoice number and date
- Organization information
- Payout period (start/end dates)
- Gross sales amount
- Platform fee breakdown
- Adjustments (if any) - post-payout refunds/cancellations displayed as negative amounts
- Net payout amount (final amount after adjustments)
- Order count and list
- Payment status
- Bank details (masked for security)

**Adjustments Display:** When an invoice includes adjustments from previous payouts, they appear in the Financial Summary section of both the PDF invoice and web preview. Adjustments are shown as negative amounts and reduce the final net payout amount.

### Downloading PDF

1. Open invoice details
2. Click "Download PDF"
3. PDF includes all invoice information
4. Suitable for accounting records

---

## Viewing Adjustments

### Adjustments Tab

The Payouts page includes an **Adjustments** tab that provides a comprehensive view of all payout adjustments for your organization.

**Accessing Adjustments:**

1. Navigate to Admin → Payouts
2. Select your organization
3. Click on the **Adjustments** tab

### Adjustment Information

The Adjustments tab displays:

- **Pending Adjustments** - Adjustments waiting to be applied to the next invoice
- **Applied Adjustments** - Adjustments that have been included in an invoice
- **Summary Metrics** - Count and total amount of pending/applied adjustments

### Adjustment Details

Each adjustment shows:

- **Order Number** - The order that was refunded/cancelled
- **Customer Name** - Customer associated with the order
- **Type** - REFUND or CANCELLATION
- **Amount** - Negative amount (e.g., -₱1,000.00)
- **Reason** - Explanation for the adjustment
- **Status** - PENDING (waiting to be applied) or APPLIED (included in invoice)
- **Original Invoice** - Invoice number where the order was originally included
- **Applied Invoice** - Invoice number where the adjustment was applied (if status is APPLIED)
- **Date** - When the adjustment was created

### Understanding Adjustment Status

**PENDING:**

- Adjustment created but not yet applied
- Will be included in the next invoice generation
- Shows in Financial Summary of next invoice

**APPLIED:**

- Adjustment has been included in an invoice
- Shows which invoice it was applied to
- Final net payout already reflects this adjustment

---

## Payout Analytics

### Key Metrics

Track payout performance:

- **Total Payouts** - Sum of all payouts
- **Average Payout** - Average payout per cycle
- **Platform Fees Collected** - Total fees
- **Order Count** - Total orders included
- **Pending Invoices** - Unpaid invoices count

### Reports

Generate reports for:

- Monthly payout summaries
- Platform fee analysis
- Organization payout history
- Payment status tracking

---

## Common Scenarios

### Scenario 1: Weekly Payout Cycle

**Week 1 (Wed-Tue):**

- Orders placed and paid
- Sales accumulate

**Wednesday (Week 2):**

- Invoice automatically generated
- Includes all PAID orders from Week 1
- Email sent to organization

**Friday (Week 2):**

- Super-admin processes payment
- Marks invoice as PAID
- Confirmation email sent

---

### Scenario 2: Custom Platform Fee

**Setup:**

1. Super-admin sets custom fee: 12% (instead of 15%)
2. Organization's next invoice uses 12% fee
3. Net payout increases accordingly

**Calculation:**

- Gross: ₱10,000
- Fee (12%): ₱1,200
- Net: ₱8,800 (vs ₱8,500 at 15%)

---

### Scenario 3: Missing Bank Details

**Issue:**

- Invoice generated but no bank details
- Payment cannot be processed

**Solution:**

1. Organization admin adds bank details
2. Super-admin processes payment manually
3. Future invoices use bank details

---

### Scenario 4: Refunded Orders

**Before Invoice Generation:**

- Refunded orders are excluded from payouts
- Only PAID orders are included
- REFUNDED payment status = excluded

**After Invoice Generation (Post-Payout Refunds):**

- If an order is refunded **after** being included in a payout invoice, an adjustment is created
- The refunded amount is deducted from the **next** payout period
- This ensures accurate accounting and prevents overpayment

**Example - Refund Before Invoice:**

- Week sales: ₱10,000
- Refunded orders: ₱1,000
- Gross for payout: ₱9,000
- Platform fee: ₱1,350
- Net payout: ₱7,650

**Example - Refund After Invoice:**

- Week 1: Invoice generated with ₱10,000 gross, ₱8,500 net payout
- Week 2: Order refunded (₱1,000)
- Week 2 Invoice: Adjustment created (-₱1,000)
- Week 2 Gross: ₱5,000
- Week 2 Net: ₱4,250 - ₱1,000 adjustment = ₱3,250

---

## Payout Adjustments

### What Are Adjustments?

Adjustments are deductions from future payouts that occur when:

- An order is refunded after being included in a payout invoice
- An order is cancelled after being included in a payout invoice

### How Adjustments Work

1. **Order Included in Invoice** - Order is paid and included in Week 1's payout
2. **Refund/Cancellation** - Order is refunded or cancelled after invoice generation
3. **Adjustment Created** - System automatically creates an adjustment record
4. **Next Payout** - Adjustment is deducted from Week 2's payout

### Adjustment Details

- Adjustments are **negative amounts** that reduce the net payout
- Each adjustment is linked to the original invoice and the order
- Adjustments are automatically included in the next invoice generation
- Once applied, adjustments are marked as "APPLIED" and cannot be modified

### Example

**Week 1 Invoice:**

- Gross: ₱10,000
- Net: ₱8,500
- Includes Order #123 (₱1,000)

**Week 2:**

- Order #123 refunded
- Adjustment created: -₱1,000

**Week 2 Invoice:**

- Gross: ₱5,000
- Net before adjustment: ₱4,250
- Adjustment: -₱1,000
- **Final Net: ₱3,250**

---

## Best Practices

### For Organization Admins

1. **Configure Bank Details Early** - Set up bank details before first payout
2. **Review Invoices** - Check invoices for accuracy, including any adjustments
3. **Track Payments** - Monitor payment status and understand adjustment impact
4. **Download PDFs** - Keep invoice records for accounting
5. **Verify Amounts** - Confirm payout amounts match expectations
6. **Understand Payment Timing** - Orders are assigned to payouts based on payment date, not order date

### For Super-Admins

1. **Process Payments Promptly** - Mark invoices as paid on Fridays
2. **Verify Bank Details** - Confirm bank details before processing
3. **Track Pending Invoices** - Monitor unpaid invoices
4. **Review Custom Fees** - Audit custom fee settings regularly
5. **Send Confirmations** - Always mark as paid to trigger email

### Financial Management

1. **Reconcile Regularly** - Match invoices with bank transfers
2. **Track Platform Fees** - Monitor total fees collected
3. **Review Refunds** - Understand refund impact on payouts and adjustments
4. **Monitor Adjustments** - Track post-payout refunds and cancellations
5. **Document Changes** - Keep records of fee changes
6. **Audit Trail** - Maintain complete payment history including adjustments
7. **Verify Payment Dates** - Ensure orders are assigned to correct periods based on payment date

---

## Frequently Asked Questions

### Q: When are payouts processed?

**A:** Invoices are generated every Wednesday, and payments are processed every Friday by super-admins.

### Q: What orders are included in payouts?

**A:** Only orders with `PAID` payment status that were **paid during the payout period** (based on payment date, not order date). Refunded orders are excluded. If an order is refunded after being included in a payout, the amount is deducted from the next payout period.

### Q: Can I change the platform fee for an organization?

**A:** Yes, super-admins can set custom platform fees per organization. Changes apply to future payouts.

### Q: What happens if I don't have bank details configured?

**A:** Invoices will still be generated, but payment cannot be processed until bank details are added.

### Q: Can I download invoice PDFs?

**A:** Yes, organization admins can download PDF invoices from the Payouts page.

### Q: How are refunded orders handled?

**A:**

- **Before invoice generation:** Refunded orders are excluded from payout calculations. The organization receives ₱0 for refunded orders.
- **After invoice generation:** If an order is refunded after being included in a payout invoice, an adjustment is created that deducts the refunded amount from the next payout period. This ensures accurate accounting and prevents overpayment.

### Q: How do adjustments appear in invoices?

**A:** When an invoice includes adjustments from previous payouts, they appear in the Financial Summary section:

- Adjustments are shown as a separate line item with a negative amount (e.g., -₱1,000.00)
- The adjustment count is displayed (e.g., "Adjustments (2 refunds/cancellations)")
- The final Net Payout amount already reflects the adjustment deduction
- Adjustments appear in both the PDF invoice and web preview
- You can view all adjustments (pending and applied) in the Adjustments tab on the Payouts page

### Q: What if an invoice is incorrect?

**A:** Contact super-admin support. Invoices can be regenerated manually if needed.

### Q: What happens if an order is placed in one period but paid in another?

**A:** Orders are assigned to payout periods based on **when payment was received**, not when the order was placed. For example:

- Order placed: Tuesday 11:59 PM (Period A)
- Payment received: Wednesday 12:01 AM (Period B)
- **Result:** Order is included in Period B's payout invoice

This ensures accurate accounting - you only receive payout for money that was actually received during that period.

### Q: Can the same order be included in multiple invoices?

**A:** No. Once an order is included in an invoice, it is marked with `payoutInvoiceId` and cannot be included in another invoice. This prevents double-counting and ensures accurate payouts.

---

## Related Articles

- [Refund System](./refund-system.md)
- [Order Management](./order-management.md)
