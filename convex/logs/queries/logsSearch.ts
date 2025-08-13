import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission, requireStaffOrAdmin } from "../../helpers";

export const searchLogsArgs = {
	searchTerm: v.string(),
	organizationId: v.optional(v.id("organizations")),
	limit: v.optional(v.number()),
};

export const searchLogsHandler = async (
	ctx: QueryCtx,
	args: { searchTerm: string; organizationId?: Id<"organizations">; limit?: number }
) => {
	await requireAuthentication(ctx);
	const term = args.searchTerm.toLowerCase().trim();
	if (!term) return [];

	let query;
	if (args.organizationId) {
		await requireOrganizationPermission(ctx, args.organizationId, "VIEW_LOGS", "read");
		query = ctx.db
			.query("logs")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
	} else {
		await requireStaffOrAdmin(ctx);
		query = ctx.db.query("logs");
	}

	const rows = await query.collect();

	const filtered = rows.filter((l) => {
		const f = (s?: string) => (s || "").toLowerCase();
		const inReason = f(l.reason).includes(term);
		const inSystem = f(l.systemText).includes(term);
		const inUser = f(l.userText).includes(term);
		const inAction = f(l.action).includes(term);
		const inResType = f(l.resourceType).includes(term);
		const inResId = f(l.resourceId).includes(term);
		const inCreator = f(l.creatorInfo?.email).includes(term) || f(l.creatorInfo?.firstName).includes(term) || f(l.creatorInfo?.lastName).includes(term);
		const inUserInfo = f(l.userInfo?.email).includes(term) || f(l.userInfo?.firstName).includes(term) || f(l.userInfo?.lastName).includes(term);
		return inReason || inSystem || inUser || inAction || inResType || inResId || inCreator || inUserInfo;
	});

	filtered.sort((a, b) => b.createdDate - a.createdDate);
	const limit = args.limit || 25;
	return filtered.slice(0, limit);
};

