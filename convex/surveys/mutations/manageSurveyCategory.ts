import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAdmin, logAction, validateNotEmpty, validateStringLength, sanitizeString } from '../../helpers';

// Create
export const createSurveyCategoryArgs = {
  name: v.string(),
  description: v.optional(v.string()),
  // Questions payload mirrors schema shape, optional to allow partial overrides; defaults provided
  questions: v.optional(
    v.object({
      question1: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
      question2: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
      question3: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
      question4: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
    })
  ),
  isActive: v.optional(v.boolean()),
  isDefault: v.optional(v.boolean()),
};

export const createSurveyCategoryHandler = async (
  ctx: MutationCtx,
  args: {
    name: string;
    description?: string;
    questions?: {
      question1: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
      question2: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
      question3: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
      question4: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
    };
    isActive?: boolean;
    isDefault?: boolean;
  }
) => {
  const user = await requireAdmin(ctx);

  validateNotEmpty(args.name, 'Category name');
  validateStringLength(args.name, 'Category name', 2, 100);
  if (args.description) validateStringLength(args.description, 'Description', 0, 500);

  const name = sanitizeString(args.name);
  const description = args.description ? sanitizeString(args.description) : undefined;

  // Uniqueness on name
  const existing = await ctx.db
    .query('surveyCategories')
    .withIndex('by_name', (q) => q.eq('name', name))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();
  if (existing) throw new Error('Survey category name already exists');

  // Default questions if not provided
  const questions = args.questions ?? {
    question1: { text: 'How satisfied are you with your order?', type: 'rating', weight: 1 },
    question2: { text: 'How likely are you to recommend us?', type: 'scale', weight: 1 },
    question3: { text: 'Was the delivery on time?', type: 'yesno', weight: 1 },
    question4: { text: 'Rate the overall value for money.', type: 'rating', weight: 1 },
  };

  const now = Date.now();
  const doc = {
    isDeleted: false,
    name,
    description,
    questions,
    // Legacy fields mirroring first 4 questions' texts
    question1: questions.question1.text,
    question2: questions.question2.text,
    question3: questions.question3.text,
    question4: questions.question4.text,
    totalResponses: 0,
    averageScore: 0,
    positiveResponseRate: 0,
    isActive: args.isActive ?? true,
    isDefault: args.isDefault ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const categoryId = await ctx.db.insert('surveyCategories', doc);

  await logAction(ctx, 'create_survey_category', 'DATA_CHANGE', 'MEDIUM', `Created survey category: ${name}`, user._id, undefined, { categoryId });

  return categoryId;
};

// Update
export const updateSurveyCategoryArgs = {
  categoryId: v.id('surveyCategories'),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  questions: v.optional(
    v.object({
      question1: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
      question2: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
      question3: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
      question4: v.object({ text: v.string(), type: v.union(v.literal('rating'), v.literal('scale'), v.literal('yesno')), weight: v.number() }),
    })
  ),
  isActive: v.optional(v.boolean()),
  isDefault: v.optional(v.boolean()),
};

export const updateSurveyCategoryHandler = async (
  ctx: MutationCtx,
  args: {
    categoryId: Id<'surveyCategories'>;
    name?: string;
    description?: string;
    questions?: {
      question1: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
      question2: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
      question3: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
      question4: { text: string; type: 'rating' | 'scale' | 'yesno'; weight: number };
    };
    isActive?: boolean;
    isDefault?: boolean;
  }
) => {
  const user = await requireAdmin(ctx);

  const existing = await ctx.db.get(args.categoryId);
  if (!existing) throw new Error('Survey category not found');

  const updates: Partial<typeof existing> = { updatedAt: Date.now() };

  if (args.name !== undefined) {
    validateNotEmpty(args.name, 'Category name');
    validateStringLength(args.name, 'Category name', 2, 100);
    const newName = sanitizeString(args.name);
    if (newName !== existing.name) {
      const conflict = await ctx.db
        .query('surveyCategories')
        .withIndex('by_name', (q) => q.eq('name', newName))
        .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.neq(q.field('_id'), args.categoryId)))
        .first();
      if (conflict) throw new Error('Survey category name already exists');
    }
    updates.name = newName;
  }

  if (args.description !== undefined) {
    updates.description = args.description ? sanitizeString(args.description) : undefined;
  }

  if (args.questions !== undefined) {
    updates.questions = args.questions;
    updates.question1 = args.questions.question1.text;
    updates.question2 = args.questions.question2.text;
    updates.question3 = args.questions.question3.text;
    updates.question4 = args.questions.question4.text;
  }

  if (args.isActive !== undefined) updates.isActive = args.isActive;
  if (args.isDefault !== undefined) updates.isDefault = args.isDefault;

  await ctx.db.patch(args.categoryId, updates);

  await logAction(
    ctx,
    'update_survey_category',
    'DATA_CHANGE',
    'MEDIUM',
    `Updated survey category: ${updates.name || existing.name}`,
    user._id,
    undefined,
    { categoryId: args.categoryId, changes: Object.keys(updates).filter((k) => k !== 'updatedAt') }
  );

  return args.categoryId;
};

// Soft delete
export const deleteSurveyCategoryArgs = { categoryId: v.id('surveyCategories'), force: v.optional(v.boolean()) };

export const deleteSurveyCategoryHandler = async (ctx: MutationCtx, args: { categoryId: Id<'surveyCategories'>; force?: boolean }) => {
  const user = await requireAdmin(ctx);
  const existing = await ctx.db.get(args.categoryId);
  if (!existing) throw new Error('Survey category not found');

  if (args.force) {
    await ctx.db.delete(args.categoryId);
    await logAction(
      ctx,
      'hard_delete_survey_category',
      'DATA_CHANGE',
      'HIGH',
      `Hard deleted survey category: ${existing.name}`,
      user._id,
      undefined,
      { categoryId: args.categoryId }
    );
    return { success: true };
  }

  if (existing.isDeleted) throw new Error('Survey category is already deleted');
  await ctx.db.patch(args.categoryId, { isDeleted: true, updatedAt: Date.now() });
  await logAction(ctx, 'delete_survey_category', 'DATA_CHANGE', 'MEDIUM', `Deleted survey category: ${existing.name}`, user._id, undefined, {
    categoryId: args.categoryId,
  });
  return { success: true };
};

// Restore
export const restoreSurveyCategoryArgs = { categoryId: v.id('surveyCategories') };

export const restoreSurveyCategoryHandler = async (ctx: MutationCtx, args: { categoryId: Id<'surveyCategories'> }) => {
  const user = await requireAdmin(ctx);
  const existing = await ctx.db.get(args.categoryId);
  if (!existing) throw new Error('Survey category not found');
  if (!existing.isDeleted) throw new Error('Survey category is not deleted');

  // Ensure name still unique
  const conflict = await ctx.db
    .query('surveyCategories')
    .withIndex('by_name', (q) => q.eq('name', existing.name))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();
  if (conflict) throw new Error('Cannot restore: name already in use');

  await ctx.db.patch(args.categoryId, { isDeleted: false, updatedAt: Date.now() });
  await logAction(ctx, 'restore_survey_category', 'DATA_CHANGE', 'MEDIUM', `Restored survey category: ${existing.name}`, user._id, undefined, {
    categoryId: args.categoryId,
  });
  return { success: true };
};
