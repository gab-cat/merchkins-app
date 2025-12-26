/**
 * Ticket Status Constants
 * Centralized constants for ticket status values to ensure consistency
 * and maintainability across the codebase.
 */

export const TICKET_STATUS = {
  OPEN: 'OPEN' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  RESOLVED: 'RESOLVED' as const,
  CLOSED: 'CLOSED' as const,
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

/**
 * Open ticket statuses - tickets that are actively being worked on
 */
export const OPEN_TICKET_STATUSES: readonly TicketStatus[] = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.IN_PROGRESS,
] as const;

