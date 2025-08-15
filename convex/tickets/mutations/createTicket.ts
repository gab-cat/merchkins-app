import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  logAction,
  sanitizeString,
  validateNotEmpty,
  validateStringLength,
  validateUserExists,
  requireActiveOrganization,
} from "../../helpers";

export const createTicketArgs = {
  title: v.string(),
  description: v.string(),
  priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
  category: v.optional(
    v.union(
      v.literal("BUG"),
      v.literal("FEATURE_REQUEST"),
      v.literal("SUPPORT"),
      v.literal("QUESTION"),
      v.literal("OTHER")
    )
  ),
  tags: v.optional(v.array(v.string())),
  assignedToId: v.optional(v.id("users")),
  dueDate: v.optional(v.number()),
  organizationId: v.optional(v.id("organizations")),
};

export const createTicketHandler = async (
  ctx: MutationCtx,
  args: {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    category?: "BUG" | "FEATURE_REQUEST" | "SUPPORT" | "QUESTION" | "OTHER";
    tags?: string[];
    assignedToId?: Id<"users">;
    dueDate?: number;
    organizationId?: Id<"organizations">;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  validateNotEmpty(args.title, "Title");
  validateStringLength(args.title, "Title", 1, 180);
  validateNotEmpty(args.description, "Description");
  validateStringLength(args.description, "Description", 1, 8000);

  const title = sanitizeString(args.title);
  const description = sanitizeString(args.description);
  const tags = (args.tags || []).slice(0, 20).map(sanitizeString);

  // Validate assignee exists if provided
  let assigneeInfo: { firstName?: string; lastName?: string; email: string; imageUrl?: string } | undefined;
  if (args.assignedToId) {
    const assignee = await validateUserExists(ctx, args.assignedToId);
    assigneeInfo = {
      firstName: assignee.firstName,
      lastName: assignee.lastName,
      email: assignee.email,
      imageUrl: assignee.imageUrl,
    };
  }

  // Creator info (either from user or derived minimal)
  const creatorInfo = {
    firstName: currentUser?.firstName,
    lastName: currentUser?.lastName,
    email: currentUser?.email,
    imageUrl: currentUser?.imageUrl,
  };

  const now = Date.now();

  // Validate organization if provided (customers may file tickets with orgs)
  if (args.organizationId) {
    await requireActiveOrganization(ctx, args.organizationId);
  }

  const ticketId = await ctx.db.insert("tickets", {
    organizationId: args.organizationId,
    title,
    description,
    status: "OPEN",
    priority: args.priority,
    createdById: currentUser._id,
    assignedToId: args.assignedToId,
    creatorInfo,
    assigneeInfo,
    recentUpdates: [],
    updates: undefined,
    updateCount: 0,
    responseTime: undefined,
    resolutionTime: undefined,
    category: args.category,
    tags,
    dueDate: args.dueDate,
    escalated: false,
    escalatedAt: undefined,
    createdAt: now,
    updatedAt: now,
  });

  // Append first update
  const updateId = await ctx.db.insert("ticketUpdates", {
    ticketId,
    update: "OPEN",
    createdById: currentUser._id,
    creatorInfo,
    ticketInfo: { title, priority: args.priority, category: args.category },
    content: "Ticket created",
    updateType: "STATUS_CHANGE",
    previousValue: undefined,
    newValue: "OPEN",
    attachments: undefined,
    isInternal: false,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.patch(ticketId, {
    recentUpdates: [
      {
        updateId,
        update: "OPEN",
        content: "Ticket created",
        createdById: currentUser._id,
        creatorName: `${creatorInfo.firstName || ""} ${creatorInfo.lastName || ""}`.trim() || creatorInfo.email,
        createdAt: now,
      },
    ],
    updatedAt: Date.now(),
  });

  await logAction(
    ctx,
    "create_ticket",
    "DATA_CHANGE",
    "MEDIUM",
    `Created ticket: ${title}`,
    currentUser._id,
    undefined,
    { ticketId, priority: args.priority, category: args.category, assignedToId: args.assignedToId }
  );

  return ticketId;
};


