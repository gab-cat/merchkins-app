import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Optimized tickets with embedded user info and updates
export const tickets = defineTable({
  organizationId: v.optional(v.id('organizations')),
  title: v.string(),
  description: v.string(),
  status: v.union(v.literal('OPEN'), v.literal('IN_PROGRESS'), v.literal('RESOLVED'), v.literal('CLOSED')),
  priority: v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH')),
  createdById: v.id('users'),
  assignedToId: v.optional(v.id('users')),

  // Embedded creator info
  creatorInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Embedded assignee info
  assigneeInfo: v.optional(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
  ),

  // Embedded recent updates (last 5 updates)
  recentUpdates: v.array(
    v.object({
      updateId: v.id('ticketUpdates'),
      update: v.string(),
      content: v.string(),
      createdById: v.id('users'),
      creatorName: v.string(),
      createdAt: v.number(),
    })
  ),

  updates: v.optional(
    v.array(
      v.object({
        updateId: v.id('ticketUpdates'),
        update: v.string(),
        content: v.string(),
        createdById: v.id('users'),
        creatorName: v.string(),
        createdAt: v.number(),
      })
    )
  ),

  // Ticket metrics
  updateCount: v.number(),
  responseTime: v.optional(v.number()), // Time to first response
  resolutionTime: v.optional(v.number()), // Time to resolution

  // Ticket categorization
  category: v.optional(v.union(v.literal('BUG'), v.literal('FEATURE_REQUEST'), v.literal('SUPPORT'), v.literal('QUESTION'), v.literal('OTHER'))),

  tags: v.array(v.string()),

  // SLA tracking
  dueDate: v.optional(v.number()),
  escalated: v.boolean(),
  escalatedAt: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_creator', ['createdById'])
  .index('by_assignee', ['assignedToId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_category', ['category'])
  .index('by_escalated', ['escalated'])
  .index('by_due_date', ['dueDate'])
  .index('by_status_priority', ['status', 'priority'])
  .index('by_assignee_status', ['assignedToId', 'status'])
  .index('by_organization_and_status', ['organizationId', 'status'])
  .index('by_creator_and_status', ['createdById', 'status']);

// Enhanced ticket updates with embedded user info
export const ticketUpdates = defineTable({
  ticketId: v.id('tickets'),
  update: v.union(v.literal('OPEN'), v.literal('IN_PROGRESS'), v.literal('RESOLVED'), v.literal('CLOSED')),
  createdById: v.id('users'),

  // Embedded creator info
  creatorInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Embedded ticket info for context
  ticketInfo: v.object({
    title: v.string(),
    priority: v.string(),
    category: v.optional(v.string()),
  }),

  content: v.string(),

  // Update metadata
  updateType: v.union(
    v.literal('STATUS_CHANGE'),
    v.literal('COMMENT'),
    v.literal('ASSIGNMENT'),
    v.literal('PRIORITY_CHANGE'),
    v.literal('ESCALATION')
  ),

  // Change tracking
  previousValue: v.optional(v.string()),
  newValue: v.optional(v.string()),

  // File attachments
  attachments: v.optional(
    v.array(
      v.object({
        filename: v.string(),
        url: v.string(),
        size: v.number(),
        mimeType: v.string(),
      })
    )
  ),

  // Internal notes (staff only)
  isInternal: v.boolean(),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_ticket', ['ticketId'])
  .index('by_creator', ['createdById'])
  .index('by_update_type', ['updateType'])
  .index('by_internal', ['isInternal'])
  .index('by_ticket_type', ['ticketId', 'updateType']);

// Per-user ticket read tracking
export const ticketReads = defineTable({
  ticketId: v.id('tickets'),
  userId: v.id('users'),
  lastReadAt: v.number(),
})
  .index('by_ticket_and_user', ['ticketId', 'userId'])
  .index('by_user', ['userId'])
  .index('by_ticket', ['ticketId']);
