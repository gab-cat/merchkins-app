/**
 * Payouts Module
 *
 * Weekly payout system for organization storefronts.
 *
 * Schedule:
 * - Cut-off: Wednesday 00:00 UTC to Tuesday 23:59:59 UTC
 * - Invoice Generation: Every Wednesday at 00:05 UTC (cron)
 * - Payout Processing: Every Friday (manual by super-admin)
 *
 * Platform Fee:
 * - Default: 15% (configurable per organization)
 * - Can be customized per organization by super-admin
 *
 * Features:
 * - Automatic weekly invoice generation for all organizations
 * - PDF invoice generation with full breakdown
 * - Email notifications (invoice ready, payment processed)
 * - Manual payment processing by super-admin
 * - Bank details management per organization
 * - Platform-wide settings configuration
 */

export * as queries from './queries/index';
export * as mutations from './mutations/index';
export * as actions from './actions/index';
