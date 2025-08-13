import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireStaffOrAdmin, logAction } from "../../helpers";

export const markSurveyResponseFollowUpArgs = {
  surveyResponseId: v.id("surveyResponses"),
  followUpSent: v.boolean(),
};

export const markSurveyResponseFollowUpHandler = async (
  ctx: MutationCtx,
  args: { surveyResponseId: Id<"surveyResponses">; followUpSent: boolean }
) => {
  const user = await requireStaffOrAdmin(ctx);
  const existing = await ctx.db.get(args.surveyResponseId);
  if (!existing) throw new Error("Survey response not found");

  const updates: Partial<typeof existing> = {
    followUpSent: args.followUpSent,
    followUpDate: args.followUpSent ? Date.now() : undefined,
    updatedAt: Date.now(),
  };
  // When follow-up is sent, needsFollowUp becomes false
  if (args.followUpSent) updates.needsFollowUp = false;

  await ctx.db.patch(args.surveyResponseId, updates);

  await logAction(
    ctx,
    "mark_survey_followup",
    "DATA_CHANGE",
    "LOW",
    `Marked survey follow-up as ${args.followUpSent ? "sent" : "not sent"}`,
    user._id,
    undefined,
    { surveyResponseId: args.surveyResponseId, followUpSent: args.followUpSent }
  );

  return { success: true };
};


