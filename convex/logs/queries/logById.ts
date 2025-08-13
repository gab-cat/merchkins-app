import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission, requireStaffOrAdmin } from "../../helpers";

export const getLogByIdArgs = {
	logId: v.id("logs"),
};

export const getLogByIdHandler = async (
	ctx: QueryCtx,
	args: { logId: Id<"logs"> }
) => {
	await requireAuthentication(ctx);
	const row = await ctx.db.get(args.logId);
	if (!row) return null;

	if (row.organizationId) {
		await requireOrganizationPermission(ctx, row.organizationId, "VIEW_LOGS", "read");
	} else {
		await requireStaffOrAdmin(ctx);
	}

	return row;
};

