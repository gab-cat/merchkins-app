import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

export const updateSurveyCategoryStatsArgs = {
  categoryId: v.id("surveyCategories"),
  newScore: v.number(),
  isPositive: v.boolean(),
};

export const updateSurveyCategoryStatsHandler = async (
  ctx: MutationCtx,
  args: { categoryId: Id<"surveyCategories">; newScore: number; isPositive: boolean }
) => {
  const category = await ctx.db.get(args.categoryId);
  if (!category) return;

  const totalResponses = (category.totalResponses || 0) + 1;
  const averageScore = totalResponses > 0
    ? ((category.averageScore || 0) * (totalResponses - 1) + args.newScore) / totalResponses
    : args.newScore;

  // Track positive count via recomputation from rate if available
  const previousPositiveCount = Math.round((category.positiveResponseRate || 0) * (category.totalResponses || 0));
  const positiveCount = previousPositiveCount + (args.isPositive ? 1 : 0);
  const positiveResponseRate = totalResponses > 0 ? positiveCount / totalResponses : 0;

  await ctx.db.patch(args.categoryId, {
    totalResponses,
    averageScore,
    positiveResponseRate,
    updatedAt: Date.now(),
  });
};


