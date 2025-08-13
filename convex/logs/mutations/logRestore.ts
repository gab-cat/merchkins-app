import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
	requireAuthentication,
	requireOrganizationPermission,
	requireStaffOrAdmin,
	validateOrganizationExists,
	logAction,
} from "../../helpers";

export const restoreLogArgs = {
	logId: v.id("logs"),
};

export const restoreLogHandler = async (
	ctx: MutationCtx,
	args: { logId: Id<"logs"> }
) => {
	const currentUser = await requireAuthentication(ctx);

	const log = await ctx.db.get(args.logId);
	if (!log) {
		throw new Error("Log not found");
	}

	if (log.organizationId) {
		await validateOrganizationExists(ctx, log.organizationId);
		await requireOrganizationPermission(ctx, log.organizationId, "MANAGE_LOGS", "update");
	} else {
		await requireStaffOrAdmin(ctx);
	}

	if (!log.isArchived) {
		return null;
	}

	await ctx.db.patch(args.logId, {
		isArchived: false,
		archivedAt: undefined,
	});

	await logAction(
		ctx,
		"restore_log",
		"AUDIT_TRAIL",
		"LOW",
		`Log restored ${args.logId}`,
		currentUser._id,
		log.organizationId || undefined,
		{ logId: args.logId }
	);

	return null;
};

