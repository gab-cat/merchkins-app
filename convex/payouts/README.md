# Payouts Module

Weekly payout system for organization storefronts in Merchkins.

## Schedule

- **Cut-off Period**: Wednesday 00:00 UTC to Tuesday 23:59:59 UTC
- **Invoice Generation**: Every Wednesday at 00:05 UTC (automatic via cron)
- **Payout Processing**: Every Friday (manual by super-admin)

## Platform Fee

- **Default**: 15% of gross sales
- **Customizable**: Super-admins can set custom fees per organization
- **Calculation**: `netAmount = grossAmount - (grossAmount × platformFeePercentage / 100)`

## Features

### For Super-Admins

- View all payout invoices across all organizations
- Mark invoices as paid (triggers email notification)
- Set custom platform fee percentage per organization
- Configure platform-wide payout settings
- Generate invoices manually for testing

### For Organization Admins

- View their organization's payout invoices
- Download PDF invoices
- Manage bank details for payouts
- Track payment status

## Schema

### payoutInvoices

Stores weekly payout records for each organization.

### payoutSettings

Platform-wide singleton configuration for payout system.

## API

### Queries

- `getPayoutInvoices` - List invoices with filtering
- `getPayoutInvoiceById` - Get single invoice details
- `getPayoutSummary` - Dashboard statistics
- `getPayoutSettings` - Platform settings

### Mutations

- `markInvoicePaid` - Mark invoice as paid (super-admin)
- `updateOrgPlatformFee` - Set org's custom fee (super-admin)
- `updatePayoutSettings` - Update platform settings (super-admin)
- `updateOrgBankDetails` - Update org's bank details (admin)

### Actions

- `generateInvoicePdf` - Generate PDF invoice
- `sendPayoutInvoiceEmail` - Send invoice ready email
- `sendPaymentConfirmationEmail` - Send payment processed email
- `triggerPayoutGenerationManual` - Manual invoice generation

## Cron Job

The cron job runs every Wednesday at 00:05 UTC and:

1. Calculates the previous week's period (Wed-Tue)
2. Queries all active organizations
3. For each org, aggregates PAID orders in the period
4. Calculates platform fee and net amount
5. Creates a payout invoice record
6. Optionally sends email notifications

## Email Templates

1. **Invoice Ready Email** - Sent when invoice is generated
2. **Payment Confirmation Email** - Sent when super-admin marks as paid
