# Messages Domain

This domain manages inbound messages, replies, assignment, and analytics. It supports both organization-scoped tickets and personal submissions.

## Features
- Public submissions with optional authentication enrichment
- Staff/admin replies with organization permission checks
- Conversation threads with `conversationId` and `threadDepth`
- Soft delete (archive) and restore
- Basic analytics (unread, unresolved, priority/type counts, average first response time)

## Permissions
- Organization messages: requires `MANAGE_TICKETS` permission
- Personal messages (no organization): users can read/update/delete their own; admins have full access

## Structure
- mutations
  - `createMessage`
  - `replyToMessage`
  - `updateMessage`
  - `deleteMessage`
  - `restoreMessage`
  - `updateMessageStats` (internal)
- queries
  - `getMessageById`
  - `getMessages`
  - `getConversation`
  - `getMessageAnalytics`
  - `searchMessages`


