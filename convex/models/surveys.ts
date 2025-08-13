import { defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized customer satisfaction surveys with embedded order and category info
export const surveyResponses = defineTable({
  orderId: v.id("orders"),
  categoryId: v.id("surveyCategories"),
  
  // Embedded order info for context
  orderInfo: v.object({
    customerName: v.string(),
    customerEmail: v.string(),
    organizationName: v.optional(v.string()),
    totalAmount: v.number(),
    orderDate: v.number(),
    itemCount: v.number(),
  }),
  
  // Embedded category info
  categoryInfo: v.object({
    name: v.string(),
    description: v.optional(v.string()),
  }),
  
  // Embedded questions and answers for better querying
  surveyData: v.object({
    question1: v.object({
      question: v.string(),
      answer: v.number(),
    }),
    question2: v.object({
      question: v.string(),
      answer: v.number(),
    }),
    question3: v.object({
      question: v.string(),
      answer: v.number(),
    }),
    question4: v.object({
      question: v.string(),
      answer: v.number(),
    }),
  }),
  
  submitDate: v.number(),
  answers: v.optional(v.object({
    question1: v.number(),
    question2: v.number(),
    question3: v.number(),
    question4: v.number(),
  })),
  metadata: v.optional(v.any()),
  comments: v.optional(v.string()),
  
  // Survey metrics
  overallScore: v.number(), // Average of all answers
  isPositive: v.boolean(), // Overall score >= 3.5
  responseTime: v.optional(v.number()), // Time taken to complete survey
  
  // Follow-up tracking
  needsFollowUp: v.boolean(),
  followUpSent: v.boolean(),
  followUpDate: v.optional(v.number()),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_order", ["orderId"])
  .index("by_category", ["categoryId"])
  .index("by_submit_date", ["submitDate"])
  .index("by_overall_score", ["overallScore"])
  .index("by_positive", ["isPositive"])
  .index("by_needs_followup", ["needsFollowUp"])
  .index("by_category_score", ["categoryId", "overallScore"])
  .index("by_organization", ["orderInfo.organizationName"]);

// Enhanced survey categories with embedded question data
export const surveyCategories = defineTable({
  isDeleted: v.boolean(),
  name: v.string(),
  description: v.optional(v.string()),
  
  // Structured question data
  questions: v.object({
    question1: v.object({
      text: v.string(),
      type: v.union(v.literal("rating"), v.literal("scale"), v.literal("yesno")),
      weight: v.number(), // For weighted scoring
    }),
    question2: v.object({
      text: v.string(),
      type: v.union(v.literal("rating"), v.literal("scale"), v.literal("yesno")),
      weight: v.number(),
    }),
    question3: v.object({
      text: v.string(),
      type: v.union(v.literal("rating"), v.literal("scale"), v.literal("yesno")),
      weight: v.number(),
    }),
    question4: v.object({
      text: v.string(),
      type: v.union(v.literal("rating"), v.literal("scale"), v.literal("yesno")),
      weight: v.number(),
    }),
  }),
  
  // Legacy fields for backward compatibility
  question1: v.string(),
  question2: v.string(),
  question3: v.string(),
  question4: v.string(),
  
  // Category metrics
  totalResponses: v.number(),
  averageScore: v.number(),
  positiveResponseRate: v.number(),
  
  // Category settings
  isActive: v.boolean(),
  isDefault: v.boolean(),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_isDeleted", ["isDeleted"])
  .index("by_active", ["isActive"])
  .index("by_default", ["isDefault"])
  .index("by_average_score", ["averageScore"]);
