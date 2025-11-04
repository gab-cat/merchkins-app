# Logs Domain

This domain provides robust audit and activity logging with powerful filtering and analytics. It follows the same structure and helper usage patterns as other domains.

## Features

- Organization-scoped and global logs
- Embedded user and organization snapshots for resiliency
- Rich categorization (type, severity, action, resource)
- Correlation and session tracking
- Soft archive/restore (immutability of core records)
- Comprehensive filtering, search, and analytics
- Permission-aware access using shared helpers

## Structure

- mutations
  - `createLog`
  - `archiveLog`
  - `restoreLog`
  - `deleteLog` (internal)
- queries
  - `getLogById`
  - `getLogs`
  - `searchLogs`
  - `getLogAnalytics`

## Permissions

- Organization logs: `VIEW_LOGS` (read), `MANAGE_LOGS` (create/archive/restore)
- Global logs (no organization): staff or admin for reads; admin/staff for create; admin only for hard delete

## Notes

- Core fields are immutable. Use archive/restore rather than editing log content.
- Leverages indexes defined in `convex/models/logs.ts` for efficient queries.
- Uses shared helpers for authentication, organization validation, permission checks, and validation.
