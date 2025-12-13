---
name: 'Add Email Notification Preferences'
overview: 'Allow users to manage their email notification preferences from their account settings.'
created: '2024-12-13'
status: 'draft'
priority: 'medium'
estimated_effort: '4-6 hours'
tags: ['feature', 'user-settings', 'notifications', 'email']
todos:
  - id: 1
    content: Add notificationPreferences field to users schema in convex/schema.ts
    status: pending
  - id: 2
    content: Create updateNotificationPreferences mutation in convex/users/mutations/
    status: pending
  - id: 3
    content: Create getNotificationPreferences query in convex/users/queries/
    status: pending
  - id: 4
    content: Create NotificationPreferencesForm component in src/features/account/components/
    status: pending
  - id: 5
    content: Add notification preferences section to account settings page
    status: pending
  - id: 6
    content: Update email sending functions to check user preferences
    status: pending
  - id: 7
    content: Write unit tests for the new mutation and query
    status: pending
  - id: 8
    content: Test manually across different preference combinations
    status: pending
---

# Add Email Notification Preferences

## Overview

Enable users to control which email notifications they receive. This includes order updates, promotional emails, announcements, and chat messages. Users will be able to toggle each notification type independently from their account settings page.

## Goals

- Users can opt-in/out of different notification categories
- Preferences are respected when sending emails
- Easy-to-use interface in account settings
- Default to receiving all notifications for new users

## Non-Goals (Out of Scope)

- Push notification preferences (future enhancement)
- SMS notification preferences
- Per-organization notification settings
- Notification frequency controls (e.g., digest vs. immediate)

## Background / Context

Currently, all users receive all email notifications by default with no way to customize. This has led to user feedback requesting the ability to opt-out of promotional emails while still receiving order updates. This feature addresses that need while laying groundwork for future notification enhancements.

## Technical Design

### Architecture Overview

The notification preferences will be stored as an embedded object on the user document. When sending emails, the system will check the user's preferences before dispatching. The frontend will provide a simple toggle interface for each notification category.

### Data Model Changes

**File:** `convex/schema.ts`

Add to users table:

```typescript
notificationPreferences: v.optional(v.object({
  orderUpdates: v.optional(v.boolean()),      // Order status changes
  promotions: v.optional(v.boolean()),         // Marketing/promotional emails
  announcements: v.optional(v.boolean()),      // Organization announcements
  chatMessages: v.optional(v.boolean()),       // New chat message notifications
  newsletter: v.optional(v.boolean()),         // Platform newsletter
})),
```

Default behavior: If `notificationPreferences` is undefined or a specific field is undefined, treat as `true` (opted-in).

### API / Interface Changes

**New Mutation:** `convex/users/mutations/updateNotificationPreferences.ts`

```typescript
// Args
{
  preferences: {
    orderUpdates?: boolean;
    promotions?: boolean;
    announcements?: boolean;
    chatMessages?: boolean;
    newsletter?: boolean;
  }
}
```

**New Query:** `convex/users/queries/getNotificationPreferences.ts`

```typescript
// Returns
{
  orderUpdates: boolean;
  promotions: boolean;
  announcements: boolean;
  chatMessages: boolean;
  newsletter: boolean;
}
```

## Implementation Plan

### Phase 1: Backend Implementation

**Objective:** Add schema, mutation, and query for notification preferences

#### 1.1 Update User Schema

Add `notificationPreferences` field to the users table schema.

**Files to modify:**

- `convex/schema.ts` - Add notificationPreferences field
- `convex/models/users.ts` - Add TypeScript types if separate

#### 1.2 Create Update Mutation

Create mutation to update user notification preferences with validation.

**Files to create:**

- `convex/users/mutations/updateNotificationPreferences.ts`

**Key implementation details:**

- Validate user is authenticated
- Merge with existing preferences (partial updates allowed)
- Return updated preferences

#### 1.3 Create Get Query

Create query to fetch current user's notification preferences.

**Files to create:**

- `convex/users/queries/getNotificationPreferences.ts`

**Key implementation details:**

- Return defaults for undefined preferences
- Handle case where user has no preferences set

### Phase 2: Frontend Implementation

**Objective:** Create UI for managing notification preferences

#### 2.1 Create Preferences Form Component

Build a form with toggle switches for each notification category.

**Files to create:**

- `src/features/account/components/notification-preferences-form.tsx`

**Key implementation details:**

- Use Switch components from shadcn/ui
- Optimistic updates with useMutation
- Loading and error states
- Success toast on save

#### 2.2 Integrate with Account Settings

Add the notification preferences section to the account settings page.

**Files to modify:**

- `app/(main)/account/page.tsx` or relevant settings page

### Phase 3: Email Integration

**Objective:** Update email sending to respect preferences

#### 3.1 Update Email Functions

Modify email sending functions to check user preferences before sending.

**Files to modify:**

- `lib/mailgun.ts` or equivalent email utility
- Any functions that send user emails

**Key implementation details:**

- Create helper function `shouldSendEmail(userId, notificationType)`
- Skip sending if user has opted out
- Log skipped emails for debugging

## Files to Create / Modify

### New Files

| File Path                                                           | Purpose                          |
| ------------------------------------------------------------------- | -------------------------------- |
| `convex/users/mutations/updateNotificationPreferences.ts`           | Mutation to save preferences     |
| `convex/users/queries/getNotificationPreferences.ts`                | Query to get current preferences |
| `src/features/account/components/notification-preferences-form.tsx` | UI form component                |

### Modified Files

| File Path                     | Changes                                    |
| ----------------------------- | ------------------------------------------ |
| `convex/schema.ts`            | Add notificationPreferences field to users |
| `app/(main)/account/page.tsx` | Add notification section                   |
| `lib/mailgun.ts`              | Add preference checking before send        |

## Dependencies

- shadcn/ui Switch component (already installed)
- React Hook Form (already installed)
- Convex mutation/query patterns (existing)

## Edge Cases & Error Handling

| Scenario                     | Handling Strategy                          |
| ---------------------------- | ------------------------------------------ |
| User has no preferences set  | Return all defaults as `true`              |
| Partial preference update    | Merge with existing, preserve unset values |
| Email fails preference check | Log and return early, don't throw          |
| Unauthenticated user         | Return auth error from mutation/query      |

## Testing Strategy

### Unit Tests

- Test mutation validates input correctly
- Test query returns defaults for missing preferences
- Test preference merge logic

### Integration Tests

- Test end-to-end preference update flow
- Test email respects preferences

### Manual Testing

- [ ] Update each preference individually and verify persistence
- [ ] Update multiple preferences at once
- [ ] Verify emails are not sent when opted out
- [ ] Verify emails are sent when opted in
- [ ] Test new user default behavior

## Risks & Mitigations

| Risk                               | Impact | Mitigation                       |
| ---------------------------------- | ------ | -------------------------------- |
| Existing emails ignore preferences | Medium | Update all email sending code    |
| Performance impact on email sends  | Low    | Cache user preferences if needed |
| Data migration needed              | Low    | Use optional field with defaults |

## Open Questions

- [ ] Should there be a "unsubscribe all" option?
- [ ] Should we add email preference to unsubscribe links?

## References

- Existing user schema: `convex/schema.ts`
- Account settings page: `app/(main)/account/`
- Email utility: `lib/mailgun.ts`

## To-Dos

- [ ] Add notificationPreferences field to users schema
- [ ] Create updateNotificationPreferences mutation
- [ ] Create getNotificationPreferences query
- [ ] Create NotificationPreferencesForm component
- [ ] Add notification section to account settings page
- [ ] Update email functions to check preferences
- [ ] Write unit tests
- [ ] Manual testing across all scenarios

---

## Revision History

| Date       | Author         | Changes              |
| ---------- | -------------- | -------------------- |
| 2024-12-13 | Planning Agent | Initial plan created |
