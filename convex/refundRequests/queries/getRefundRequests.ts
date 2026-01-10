import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

export const getRefundRequestsArgs = {
  organizationId: v.optional(v.id('organizations')),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  search: v.optional(v.string()),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
} as const;

export const getRefundRequestsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    dateFrom?: number;
    dateTo?: number;
    search?: string;
    limit?: number;
    cursor?: string | null;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  let query = ctx.db.query('refundRequests').withIndex('by_isDeleted', (q) => q.eq('isDeleted', false));

  // Filter by organization if provided
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, PERMISSION_CODES.MANAGE_REFUNDS, 'read');
    const statusFilter = args.status ?? 'PENDING';
    query = ctx.db
      .query('refundRequests')
      .withIndex('by_organization_status', (q) => q.eq('organizationId', args.organizationId!).eq('status', statusFilter))
      .filter((q) => q.eq(q.field('isDeleted'), false));
  } else {
    // Super admin can see all
    if (!currentUser.isAdmin) {
      throw new Error('Permission denied');
    }
    if (args.status) {
      query = ctx.db
        .query('refundRequests')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('isDeleted'), false));
    } else if (args.dateFrom || args.dateTo) {
      query = ctx.db.query('refundRequests').withIndex('by_createdAt');
    }
  }

  // Apply date filters
  if (args.dateFrom !== undefined || args.dateTo !== undefined) {
    query = query.filter((q: any) => {
      const cond: any[] = [];
      if (args.dateFrom !== undefined) {
        cond.push(q.gte(q.field('createdAt'), args.dateFrom));
      }
      if (args.dateTo !== undefined) {
        cond.push(q.lte(q.field('createdAt'), args.dateTo));
      }
      return cond.length > 0 ? q.and(...cond) : q.and();
    });
  }

  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const cursor = args.cursor ?? null;
  const page = await query.order('desc').paginate({ numItems: limit, cursor });

  // Apply search filter if provided
  if (args.search && args.search.trim().length > 0) {
    const searchTerm = args.search.toLowerCase().trim();
    const filteredPage = page.page.filter((request: any) => {
      const orderNumber = request.orderInfo?.orderNumber?.toLowerCase() || '';
      const customerEmail = request.customerInfo?.email?.toLowerCase() || '';
      const customerFirstName = request.customerInfo?.firstName?.toLowerCase() || '';
      const customerLastName = request.customerInfo?.lastName?.toLowerCase() || '';
      const customerName = `${customerFirstName} ${customerLastName}`.trim();

      return orderNumber.includes(searchTerm) || customerEmail.includes(searchTerm) || customerName.includes(searchTerm);
    });

    return {
      ...page,
      page: filteredPage,
      isDone: filteredPage.length < limit || page.isDone,
    };
  }

  return page;
};
