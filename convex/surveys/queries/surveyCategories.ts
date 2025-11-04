import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getSurveyCategoryByIdArgs = { categoryId: v.id('surveyCategories') };

export const getSurveyCategoryByIdHandler = async (ctx: QueryCtx, args: { categoryId: Id<'surveyCategories'> }) => {
  const doc = await ctx.db.get(args.categoryId);
  if (!doc || doc.isDeleted) return null;
  return doc;
};

export const getSurveyCategoriesArgs = {
  activeOnly: v.optional(v.boolean()),
};

export const getSurveyCategoriesHandler = async (ctx: QueryCtx, args: { activeOnly?: boolean }) => {
  let q = ctx.db.query('surveyCategories');
  if (args.activeOnly) {
    q = q.filter((f) => f.eq(f.field('isActive'), true));
  }
  const list = await q.filter((f) => f.eq(f.field('isDeleted'), false)).collect();
  return list;
};
