import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { QueryCtx } from '../../_generated/server';

// Get files by usage type and related entity
export const getFilesByEntityArgs = {
  relatedEntityType: v.string(),
  relatedEntityId: v.string(),
  usageType: v.optional(v.string()),
  organizationId: v.optional(v.id('organizations')),
};

export const getFilesByEntityHandler = async (
  ctx: QueryCtx,
  args: {
    relatedEntityType: string;
    relatedEntityId: string;
    usageType?: string;
    organizationId?: Id<'organizations'>;
  }
) => {
  let query = ctx.db
    .query('files')
    .withIndex('by_related_entity', (q) => q.eq('relatedEntityType', args.relatedEntityType).eq('relatedEntityId', args.relatedEntityId))
    .filter((q) => q.eq(q.field('isActive'), true));

  if (args.usageType) {
    query = query.filter((q) => q.eq(q.field('usageType'), args.usageType));
  }

  if (args.organizationId) {
    query = query.filter((q) => q.eq(q.field('organizationId'), args.organizationId));
  }

  const files = await query.collect();

  return files.map((file) => ({
    _id: file._id,
    fileName: file.fileName,
    originalName: file.originalName,
    fileType: file.fileType,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    url: file.url,
    usageType: file.usageType,
    relatedEntityId: file.relatedEntityId,
    relatedEntityType: file.relatedEntityType,
    imageMetadata: file.imageMetadata,
    isPublic: file.isPublic,
    accessLevel: file.accessLevel,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }));
};
