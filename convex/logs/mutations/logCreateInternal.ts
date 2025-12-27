import { internalMutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { Doc } from '../../_generated/dataModel';
import { sanitizeString } from '../../helpers/utils';

/**
 * Internal mutation for logging security events from actions
 * Does not require authentication - used for system-level security logging
 */
export const createLogInternalArgs = {
  action: v.string(),
  logType: v.union(
    v.literal('USER_ACTION'),
    v.literal('SYSTEM_EVENT'),
    v.literal('SECURITY_EVENT'),
    v.literal('DATA_CHANGE'),
    v.literal('ERROR_EVENT'),
    v.literal('AUDIT_TRAIL')
  ),
  severity: v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH'), v.literal('CRITICAL')),
  reason: v.string(),
  userId: v.optional(v.id('users')),
  organizationId: v.optional(v.id('organizations')),
  metadata: v.optional(v.any()),
  systemText: v.optional(v.string()),
  userText: v.optional(v.string()),
  resourceType: v.optional(v.string()),
  resourceId: v.optional(v.string()),
};

export const createLogInternalHandler = async (
  ctx: MutationCtx,
  args: {
    action: string;
    logType: Doc<'logs'>['logType'];
    severity: Doc<'logs'>['severity'];
    reason: string;
    userId?: Id<'users'>;
    organizationId?: Id<'organizations'>;
    metadata?: Record<string, unknown>;
    systemText?: string;
    userText?: string;
    resourceType?: string;
    resourceId?: string;
  }
) => {
  let userInfo = undefined;
  let organizationInfo = undefined;

  if (args.userId) {
    const user = await ctx.db.get(args.userId);
    if (user && !user.isDeleted) {
      userInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
      };
    }
  }

  if (args.organizationId) {
    const org = await ctx.db.get(args.organizationId);
    if (org && !org.isDeleted) {
      organizationInfo = {
        name: org.name,
        slug: org.slug,
        logo: org.logo,
      };
    }
  }

  const now = Date.now();
  const reason = sanitizeString(args.reason);
  const systemText = sanitizeString(args.systemText || args.reason);
  const userText = sanitizeString(args.userText || args.reason);
  const action = sanitizeString(args.action);

  // Determine resourceType: prefer args.resourceType, fallback to metadata keys, then undefined
  const resourceType = args.resourceType
    ? sanitizeString(args.resourceType)
    : args.metadata?.resource_type
      ? sanitizeString(String(args.metadata.resource_type))
      : args.metadata?.resourceType
        ? sanitizeString(String(args.metadata.resourceType))
        : undefined;

  // Determine resourceId: prefer args.resourceId, fallback to metadata keys, then undefined
  const resourceId = args.resourceId
    ? sanitizeString(args.resourceId)
    : args.metadata?.id
      ? sanitizeString(String(args.metadata.id))
      : args.metadata?.checkoutId
        ? sanitizeString(String(args.metadata.checkoutId))
        : undefined;

  await ctx.db.insert('logs', {
    organizationId: args.organizationId,
    userId: args.userId,
    createdById: undefined, // System-generated log
    userInfo,
    creatorInfo: undefined, // System-generated log
    organizationInfo,
    createdDate: now,
    reason,
    systemText,
    userText,
    logType: args.logType,
    severity: args.severity,
    resourceType,
    resourceId,
    action,
    metadata: args.metadata || {},
    ipAddress: 'Unknown', // Actions don't have direct IP access
    userAgent: 'Unknown', // Actions don't have direct user agent access
    previousValue: undefined,
    newValue: undefined,
    correlationId: undefined,
    sessionId: undefined,
    isArchived: false,
  });
};
