import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";
import {
	requireAuthentication,
	requireOrganizationPermission,
	requireStaffOrAdmin,
	validateOrganizationExists,
	validateUserExists,
	sanitizeString,
	logAction,
} from "../../helpers";

export const createLogArgs = {
	organizationId: v.optional(v.id("organizations")),
	userId: v.optional(v.id("users")),
	createdById: v.optional(v.id("users")),
	logType: v.union(
		v.literal("USER_ACTION"),
		v.literal("SYSTEM_EVENT"),
		v.literal("SECURITY_EVENT"),
		v.literal("DATA_CHANGE"),
		v.literal("ERROR_EVENT"),
		v.literal("AUDIT_TRAIL"),
	),
	severity: v.union(
		v.literal("LOW"),
		v.literal("MEDIUM"),
		v.literal("HIGH"),
		v.literal("CRITICAL"),
	),
	reason: v.string(),
	systemText: v.string(),
	userText: v.string(),
	resourceType: v.optional(v.string()),
	resourceId: v.optional(v.string()),
	action: v.optional(v.string()),
	metadata: v.optional(v.any()),
	ipAddress: v.optional(v.string()),
	userAgent: v.optional(v.string()),
	previousValue: v.optional(v.any()),
	newValue: v.optional(v.any()),
	correlationId: v.optional(v.string()),
	sessionId: v.optional(v.string()),
};

export const createLogHandler = async (
	ctx: MutationCtx,
	args: {
		organizationId?: Id<"organizations">;
		userId?: Id<"users">;
		createdById?: Id<"users">;
		logType: Doc<"logs">["logType"];
		severity: Doc<"logs">["severity"];
		reason: string;
		systemText: string;
		userText: string;
		resourceType?: string;
		resourceId?: string;
		action?: string;
		metadata?: Record<string, unknown>;
		ipAddress?: string;
		userAgent?: string;
		previousValue?: unknown;
		newValue?: unknown;
		correlationId?: string;
		sessionId?: string;
	}
) => {
	const currentUser = await requireAuthentication(ctx);

	if (args.organizationId) {
		await validateOrganizationExists(ctx, args.organizationId);
		await requireOrganizationPermission(ctx, args.organizationId, "MANAGE_LOGS", "create");
	} else {
		await requireStaffOrAdmin(ctx);
	}

	let userInfo = undefined;
	let creatorInfo = undefined;
	let organizationInfo = undefined;

	if (args.userId) {
		const user = await validateUserExists(ctx, args.userId);
		userInfo = {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			imageUrl: user.imageUrl,
		};
	}

	const creatorId = args.createdById ?? currentUser._id;
	const creator = await validateUserExists(ctx, creatorId);
	creatorInfo = {
		firstName: creator.firstName,
		lastName: creator.lastName,
		email: creator.email,
		imageUrl: creator.imageUrl,
	};

	if (args.organizationId) {
		const org = await validateOrganizationExists(ctx, args.organizationId);
		organizationInfo = {
			name: org.name,
			slug: org.slug,
			logo: org.logo,
		};
	}

	const now = Date.now();
	const reason = sanitizeString(args.reason);
	const systemText = sanitizeString(args.systemText);
	const userText = sanitizeString(args.userText);
	const action = args.action ? sanitizeString(args.action) : undefined;
	const resourceType = args.resourceType ? sanitizeString(args.resourceType) : undefined;
	const resourceId = args.resourceId ? sanitizeString(args.resourceId) : undefined;
	const correlationId = args.correlationId ? sanitizeString(args.correlationId) : undefined;
	const sessionId = args.sessionId ? sanitizeString(args.sessionId) : undefined;

	const logId = await ctx.db.insert("logs", {
		organizationId: args.organizationId,
		userId: args.userId,
		createdById: creatorId,
		userInfo,
		creatorInfo,
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
		ipAddress: args.ipAddress || "Unknown",
		userAgent: args.userAgent || "Unknown",
		previousValue: args.previousValue,
		newValue: args.newValue,
		correlationId,
		sessionId,
		isArchived: false,
	});

	await logAction(
		ctx,
		"create_log",
		"AUDIT_TRAIL",
		"LOW",
		`Log created ${logId}`,
		currentUser._id,
		args.organizationId,
		{ logId, action: args.action, resourceType: args.resourceType, resourceId: args.resourceId }
	);

	return logId;
};

