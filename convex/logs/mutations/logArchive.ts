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

export const archiveLogArgs = {
	logId: v.id("logs"),
	reason: v.optional(v.string()),
};

export const archiveLogHandler = async (
	ctx: MutationCtx,
	args: { logId: Id<"logs">; reason?: string }
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

	if (log.isArchived) {
		return null;
	}

	await ctx.db.patch(args.logId, {
		isArchived: true,
		archivedAt: Date.now(),
	});

	await logAction(
		ctx,
		"archive_log",
		"AUDIT_TRAIL",
		"LOW",
		`Log archived ${args.logId}`,
		currentUser._id,
		log.organizationId || undefined,
		{ logId: args.logId, reason: args.reason }
	);

	return null;
};

