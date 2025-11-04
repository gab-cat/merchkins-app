# Announcements Domain

This domain manages system and organization announcements with scheduling, pinning, targeting, acknowledgments, and analytics.

## Features

- Create/update announcements with optional organization scope
- Scheduling (publish now or later) and expiry
- Target audiences (ALL, STAFF, CUSTOMERS, MERCHANTS, ADMINS)
- Pin/unpin, activate/deactivate (soft delete)
- User acknowledgments (idempotent) and engagement stats (views, clicks, dismiss)
- Robust permission checks leveraging organization permissions and system admin fallback

## Permissions

- Organization-scoped announcements require `MANAGE_ANNOUNCEMENTS` in that organization
- Global announcements (no organization) require system admin

## Structure

- mutations
  - `createAnnouncement`
  - `updateAnnouncement`
  - `deleteAnnouncement` (soft delete via `isActive=false`; supports hard delete by admins with `force`)
  - `restoreAnnouncement`
  - `acknowledgeAnnouncement`
  - `updateAnnouncementStats` (internal)
- queries
  - `getAnnouncementById`
  - `getAnnouncements`
  - `getPinnedAnnouncements`
  - `searchAnnouncements`
  - `getAnnouncementAnalytics`

## Visibility Rules

- Published announcements: `publishedAt <= now` and (no `scheduledAt` or `scheduledAt <= now`)
- Not expired: no `expiresAt` or `expiresAt > now`
- Active: `isActive === true`
