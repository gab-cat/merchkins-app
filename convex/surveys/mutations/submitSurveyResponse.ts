import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  validateOrderExists,
  validateStringLength,
  validateNonNegativeNumber,
  logAction,
} from "../../helpers";
import { internal } from "../../_generated/api";

export const submitSurveyResponseArgs = {
  orderId: v.id("orders"),
  categoryId: v.id("surveyCategories"),
  // Answers 1-4 numeric: rating/scale expected 1-5; yesno expected 0/1 but we accept 1-5 and normalize
  answers: v.object({
    question1: v.number(),
    question2: v.number(),
    question3: v.number(),
    question4: v.number(),
  }),
  comments: v.optional(v.string()),
  metadata: v.optional(v.any()),
};

type Answers = { question1: number; question2: number; question3: number; question4: number };

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeAnswer(type: "rating" | "scale" | "yesno", value: number): number {
  // Normalize to 0..5 scale for uniform scoring
  if (type === "yesno") {
    // treat <=2 as No(0), >2 as Yes(5), and interpolate in between
    return value >= 3 ? 5 : 0;
  }
  return clampToRange(value, 0, 5);
}

function computeWeightedAverage(
  questions: {
    question1: { type: "rating" | "scale" | "yesno"; weight: number };
    question2: { type: "rating" | "scale" | "yesno"; weight: number };
    question3: { type: "rating" | "scale" | "yesno"; weight: number };
    question4: { type: "rating" | "scale" | "yesno"; weight: number };
  },
  answers: Answers
): number {
  const w1 = Math.max(0, questions.question1.weight);
  const w2 = Math.max(0, questions.question2.weight);
  const w3 = Math.max(0, questions.question3.weight);
  const w4 = Math.max(0, questions.question4.weight);
  const totalWeight = w1 + w2 + w3 + w4 || 1;
  const s1 = normalizeAnswer(questions.question1.type, answers.question1);
  const s2 = normalizeAnswer(questions.question2.type, answers.question2);
  const s3 = normalizeAnswer(questions.question3.type, answers.question3);
  const s4 = normalizeAnswer(questions.question4.type, answers.question4);
  return (s1 * w1 + s2 * w2 + s3 * w3 + s4 * w4) / totalWeight;
}

export const submitSurveyResponseHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<"orders">;
    categoryId: Id<"surveyCategories">;
    answers: Answers;
    comments?: string;
    metadata?: unknown;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  // Ownership/permission: order owner or staff/admin can submit
  if (!(currentUser.isAdmin || currentUser.isStaff || currentUser._id === order.customerId)) {
    throw new Error("Permission denied: you can only submit a survey for your own order");
  }

  const category = await ctx.db.get(args.categoryId);
  if (!category || category.isDeleted || !category.isActive) {
    throw new Error("Survey category not found or inactive");
  }

  // Validate answers within reasonable range (0..5) then clamp/normalize in scoring
  validateNonNegativeNumber(args.answers.question1, "Answer 1");
  validateNonNegativeNumber(args.answers.question2, "Answer 2");
  validateNonNegativeNumber(args.answers.question3, "Answer 3");
  validateNonNegativeNumber(args.answers.question4, "Answer 4");

  if (args.comments) validateStringLength(args.comments, "Comments", 0, 2000);

  // Prevent duplicate submission for same order
  if (order.customerSatisfactionSurveyId) {
    const existing = await ctx.db.get(order.customerSatisfactionSurveyId);
    if (existing) {
      throw new Error("A survey response has already been submitted for this order");
    }
  }
  // Best-effort additional guard via index
  const existingByOrder = await ctx.db
    .query("surveyResponses")
    .withIndex("by_order", (ix) => ix.eq("orderId", args.orderId))
    .first();
  if (existingByOrder) {
    throw new Error("A survey response has already been submitted for this order");
  }

  // Build embedded snapshots
  const orderInfo = {
    customerName: `${order.customerInfo.firstName ?? ""} ${order.customerInfo.lastName ?? ""}`.trim() || order.customerInfo.email,
    customerEmail: order.customerInfo.email,
    organizationName: order.organizationInfo?.name,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    itemCount: order.itemCount,
  };
  const categoryInfo = {
    name: category.name,
    description: category.description,
  };

  const submitDate = Date.now();
  const responseTime = submitDate - order.orderDate;

  const overallScore = computeWeightedAverage(category.questions, args.answers);
  const isPositive = overallScore >= 3.5;
  const needsFollowUp = !isPositive || (args.comments ? args.comments.length > 0 : false);

  const surveyData = {
    question1: { question: category.questions.question1.text, answer: clampToRange(args.answers.question1, 0, 5) },
    question2: { question: category.questions.question2.text, answer: clampToRange(args.answers.question2, 0, 5) },
    question3: { question: category.questions.question3.text, answer: clampToRange(args.answers.question3, 0, 5) },
    question4: { question: category.questions.question4.text, answer: clampToRange(args.answers.question4, 0, 5) },
  } as const;

  const doc = {
    orderId: args.orderId,
    categoryId: args.categoryId,
    orderInfo,
    categoryInfo,
    surveyData,
    submitDate,
    answers: args.answers,
    metadata: args.metadata,
    comments: args.comments,
    overallScore,
    isPositive,
    responseTime,
    needsFollowUp,
    followUpSent: false,
    followUpDate: undefined,
    createdAt: submitDate,
    updatedAt: submitDate,
  };

  const surveyId = await ctx.db.insert("surveyResponses", doc);

  // Link to order
  await ctx.db.patch(args.orderId, { customerSatisfactionSurveyId: surveyId, updatedAt: Date.now() });

  // Update category stats
  await ctx.runMutation(internal.surveys.mutations.index.updateSurveyCategoryStats, {
    categoryId: args.categoryId,
    newScore: overallScore,
    isPositive,
  });

  // Log
  await logAction(
    ctx,
    "submit_survey_response",
    "DATA_CHANGE",
    "MEDIUM",
    `Submitted survey for order ${order.orderNumber ?? String(args.orderId)}`,
    currentUser._id,
    order.organizationId,
    { surveyId, orderId: args.orderId, categoryId: args.categoryId, overallScore }
  );

  return surveyId;
};


