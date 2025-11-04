import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, validateOrganizationExists, sanitizeString, logAction } from '../../helpers';

export const createAnnouncementArgs = {
  organizationId: v.optional(v.id('organizations')),
  title: v.string(),
  content: v.string(),
  contentType: v.union(v.literal('TEXT'), v.literal('MARKDOWN'), v.literal('HTML')),
  // Optional category and visibility controls
  category: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal('PUBLIC'), v.literal('INTERNAL'))),
  type: v.union(v.literal('NORMAL'), v.literal('SYSTEM')),
  level: v.union(v.literal('INFO'), v.literal('WARNING'), v.literal('CRITICAL')),
  targetAudience: v.union(v.literal('ALL'), v.literal('STAFF'), v.literal('CUSTOMERS'), v.literal('MERCHANTS'), v.literal('ADMINS')),
  isPinned: v.optional(v.boolean()),
  requiresAcknowledgment: v.optional(v.boolean()),
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
  publishedAt: v.optional(v.number()),
  scheduledAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
};

export const createAnnouncementHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<'organizations'>;
    title: string;
    content: string;
    contentType: 'TEXT' | 'MARKDOWN' | 'HTML';
    type: 'NORMAL' | 'SYSTEM';
    level: 'INFO' | 'WARNING' | 'CRITICAL';
    targetAudience: 'ALL' | 'STAFF' | 'CUSTOMERS' | 'MERCHANTS' | 'ADMINS';
    category?: string;
    visibility?: 'PUBLIC' | 'INTERNAL';
    isPinned?: boolean;
    requiresAcknowledgment?: boolean;
    attachments?: Array<{ filename: string; url: string; size: number; mimeType: string }>;
    publishedAt?: number;
    scheduledAt?: number;
    expiresAt?: number;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  let membershipRole: 'ADMIN' | 'STAFF' | 'MEMBER' | undefined = undefined;
  if (args.organizationId) {
    await validateOrganizationExists(ctx, args.organizationId);
    // Allow ADMIN or STAFF with permission to create org announcements
    const { membership } = await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_ANNOUNCEMENTS', 'create');
    membershipRole = membership.role as any;
  } else if (!currentUser.isAdmin) {
    throw new Error('Only system administrators can create global announcements');
  }

  const now = Date.now();
  const title = sanitizeString(args.title);
  const content = sanitizeString(args.content);
  if (!title) throw new Error('Title cannot be empty');
  if (!content) throw new Error('Content cannot be empty');
  const category = args.category ? sanitizeString(args.category) : undefined;

  // Validate schedule consistency
  if (args.expiresAt && args.publishedAt && args.expiresAt <= args.publishedAt) {
    throw new Error('expiresAt must be greater than publishedAt');
  }
  if (args.expiresAt && args.scheduledAt && args.expiresAt <= args.scheduledAt) {
    throw new Error('expiresAt must be greater than scheduledAt');
  }

  // Visibility defaults and constraints
  // - Global announcements (no organizationId) are always PUBLIC
  // - Org announcements default to INTERNAL; can be set PUBLIC by admin/staff
  const visibility: 'PUBLIC' | 'INTERNAL' = args.organizationId ? (args.visibility ?? 'INTERNAL') : 'PUBLIC';

  // Staff cannot publish PUBLIC org announcements
  if (args.organizationId && visibility === 'PUBLIC' && membershipRole !== 'ADMIN') {
    throw new Error('Only organization admins can publish public announcements');
  }

  // Publisher info snapshot
  const publisherInfo = {
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    imageUrl: currentUser.imageUrl,
    isAdmin: !!currentUser.isAdmin,
  } as const;

  // Organization info snapshot if applicable
  let organizationInfo = undefined as { name: string; slug: string; logo?: string } | undefined;
  if (args.organizationId) {
    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new Error('Organization not found');
    organizationInfo = { name: org.name, slug: org.slug, logo: org.logo };
  }

  const doc = {
    organizationId: args.organizationId,
    title,
    type: args.type,
    level: args.level,
    publishedById: currentUser._id,
    publisherInfo,
    organizationInfo,
    content,
    contentType: args.contentType,
    targetAudience: args.targetAudience,
    category,
    visibility,
    publishedAt: args.publishedAt ?? now,
    scheduledAt: args.scheduledAt,
    expiresAt: args.expiresAt,
    viewCount: 0,
    acknowledgedBy: [],
    isActive: true,
    isPinned: !!args.isPinned,
    requiresAcknowledgment: !!args.requiresAcknowledgment,
    attachments: args.attachments,
    clickCount: 0,
    dismissCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const announcementId = await ctx.db.insert('announcements', doc);

  await logAction(ctx, 'create_announcement', 'DATA_CHANGE', 'MEDIUM', `Created announcement: ${title}`, currentUser._id, args.organizationId, {
    announcementId,
    level: args.level,
    type: args.type,
    targetAudience: args.targetAudience,
    category,
    visibility,
  });

  return announcementId;
};
