import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission, requireStaffOrAdmin } from "../../helpers";

export const getLogsArgs = {
	organizationId: v.optional(v.id("organizations")),
	userId: v.optional(v.id("users")),
	createdById: v.optional(v.id("users")),
	logType: v.optional(
		v.union(
			v.literal("USER_ACTION"),
			v.literal("SYSTEM_EVENT"),
			v.literal("SECURITY_EVENT"),
			v.literal("DATA_CHANGE"),
			v.literal("ERROR_EVENT"),
			v.literal("AUDIT_TRAIL"),
		),
	),
	severity: v.optional(
		v.union(
			v.literal("LOW"),
			v.literal("MEDIUM"),
			v.literal("HIGH"),
			v.literal("CRITICAL"),
		),
	),
	resourceType: v.optional(v.string()),
	resourceId: v.optional(v.string()),
	action: v.optional(v.string()),
	correlationId: v.optional(v.string()),
	sessionId: v.optional(v.string()),
	isArchived: v.optional(v.boolean()),
	dateFrom: v.optional(v.number()),
	dateTo: v.optional(v.number()),
	limit: v.optional(v.number()),
	offset: v.optional(v.number()),
};

export const getLogsHandler = async (
	ctx: QueryCtx,
	args: {
		organizationId?: Id<"organizations">;
		userId?: Id<"users">;
		createdById?: Id<"users">;
		logType?: string;
		severity?: string;
		resourceType?: string;
		resourceId?: string;
		action?: string;
		correlationId?: string;
		sessionId?: string;
		isArchived?: boolean;
		dateFrom?: number;
		dateTo?: number;
		limit?: number;
		offset?: number;
	}
) => {
	await requireAuthentication(ctx);

	let baseQuery;
	if (args.organizationId) {
		await requireOrganizationPermission(ctx, args.organizationId, "VIEW_LOGS", "read");

		if (args.logType) {
			baseQuery = ctx.db
				.query("logs")
				.withIndex("by_organization_type", (q) =>
					q.eq("organizationId", args.organizationId!).eq("logType", args.logType as any),
				);
		} else {
			baseQuery = ctx.db
				.query("logs")
				.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
		}
	} else {
		await requireStaffOrAdmin(ctx);
		baseQuery = ctx.db.query("logs");
	}

	let rows = await baseQuery.collect();

	rows = rows.filter((row) => {
		if (args.userId && row.userId !== args.userId) return false;
		if (args.createdById && row.createdById !== args.createdById) return false;
		if (args.severity && row.severity !== (args.severity as any)) return false;
		if (args.resourceType && row.resourceType !== args.resourceType) return false;
		if (args.resourceId && row.resourceId !== args.resourceId) return false;
		if (args.action && row.action !== args.action) return false;
		if (args.correlationId && row.correlationId !== args.correlationId) return false;
		if (args.sessionId && row.sessionId !== args.sessionId) return false;
		if (args.isArchived !== undefined && row.isArchived !== args.isArchived) return false;
		if (args.dateFrom && row.createdDate < args.dateFrom) return false;
		if (args.dateTo && row.createdDate > args.dateTo) return false;
		return true;
	});

	rows.sort((a, b) => b.createdDate - a.createdDate);

	const total = rows.length;
	const offset = args.offset || 0;
	const limit = args.limit || 50;
	const items = rows.slice(offset, offset + limit);

	return {
		logs: items,
		total,
		offset,
		limit,
		hasMore: offset + limit < total,
	};
};

