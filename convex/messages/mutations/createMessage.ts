import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import {
  getOptionalCurrentUser,
  logAction,
  sanitizeString,
  validateEmail,
  validateNotEmpty,
  validateStringLength,
  validateOrganizationExists,
} from '../../helpers';

export const createMessageArgs = {
  organizationId: v.optional(v.id('organizations')),
  email: v.string(),
  subject: v.string(),
  message: v.string(),
  messageType: v.union(v.literal('INQUIRY'), v.literal('COMPLAINT'), v.literal('SUPPORT'), v.literal('FEEDBACK'), v.literal('REPLY')),
  priority: v.union(v.literal('LOW'), v.literal('NORMAL'), v.literal('HIGH'), v.literal('URGENT')),
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
  tags: v.optional(v.array(v.string())),
};

export const createMessageHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<'organizations'>;
    email: string;
    subject: string;
    message: string;
    messageType: 'INQUIRY' | 'COMPLAINT' | 'SUPPORT' | 'FEEDBACK' | 'REPLY';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    attachments?: Array<{
      filename: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
    tags?: string[];
  }
) => {
  // Optional auth: allow public submissions but enrich if user is logged in
  const currentUser = await getOptionalCurrentUser(ctx);

  // Validate inputs
  if (!validateEmail(args.email)) {
    throw new Error('Invalid email format');
  }
  validateNotEmpty(args.subject, 'Subject');
  validateStringLength(args.subject, 'Subject', 1, 200);
  validateNotEmpty(args.message, 'Message');
  validateStringLength(args.message, 'Message', 1, 5000);

  // Sanitize strings
  const subject = sanitizeString(args.subject);
  const message = sanitizeString(args.message);

  // Validate & cap attachments
  const attachments = (args.attachments || []).slice(0, 10);

  // Optionally embed organization info
  let organizationInfo:
    | {
        name: string;
        slug: string;
        logo?: string;
      }
    | undefined = undefined;

  if (args.organizationId) {
    const organization = await validateOrganizationExists(ctx, args.organizationId);
    organizationInfo = {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    };
  }

  // Build sender info
  const senderInfo = {
    firstName: currentUser?.firstName,
    lastName: currentUser?.lastName,
    email: currentUser?.email || args.email,
    imageUrl: currentUser?.imageUrl,
    isStaff: currentUser?.isStaff ?? false,
    isAdmin: currentUser?.isAdmin ?? false,
  };

  const now = Date.now();
  const isSentByAdmin = !!(currentUser && (currentUser.isStaff || currentUser.isAdmin));
  const isSentByCustomer = !isSentByAdmin;

  // Create initial message (root of a conversation)
  const messageId = await ctx.db.insert('messages', {
    organizationId: args.organizationId,
    isArchived: false,
    isRead: isSentByAdmin ? true : false,
    isResolved: false,
    isSentByCustomer,
    isSentByAdmin,
    repliesToId: undefined,
    sentBy: currentUser?._id,
    senderInfo,
    organizationInfo,
    replyToInfo: undefined,
    email: args.email,
    subject,
    message,
    messageType: args.messageType,
    priority: args.priority,
    conversationId: undefined,
    threadDepth: 0,
    attachments,
    responseTime: undefined,
    assignedTo: undefined,
    assigneeInfo: undefined,
    tags: args.tags || [],
    sentimentScore: undefined,
    urgencyScore: undefined,
    createdAt: now,
    updatedAt: now,
  });

  // Use the created id as the conversation id
  await ctx.db.patch(messageId, { conversationId: messageId as unknown as string, updatedAt: Date.now() });

  await logAction(ctx, 'create_message', 'DATA_CHANGE', 'MEDIUM', `Created message: ${subject}`, currentUser?._id, args.organizationId, {
    messageId,
    priority: args.priority,
    type: args.messageType,
  });

  return messageId;
};
