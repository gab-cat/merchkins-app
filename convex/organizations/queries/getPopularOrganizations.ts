import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser } from '../../helpers/auth';
import { buildPublicUrl } from '../../helpers/utils';

type PopularOrganization = {
  id: Id<'organizations'>;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  bannerImage?: string;
  bannerImageUrl?: string;
  organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  industry?: string;
  memberCount: number;
  totalOrderCount: number;
  isMember: boolean;
  popularityScore: number;
};

export const getPopularOrganizationsArgs = {
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
  metric: v.optional(v.union(v.literal('members'), v.literal('orders'), v.literal('composite'))),
};

export const getPopularOrganizationsHandler = async (
  ctx: QueryCtx,
  args: {
    limit?: number;
    offset?: number;
    metric?: 'members' | 'orders' | 'composite';
  }
): Promise<{
  organizations: Array<PopularOrganization>;
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}> => {
  const { limit = 8, offset = 0, metric = 'composite' } = args;

  // Only consider public, non-deleted organizations
  const all = await ctx.db
    .query('organizations')
    .withIndex('by_organizationType', (q) => q.eq('organizationType', 'PUBLIC'))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  // Compute a popularity score
  const scored = all.map((org) => {
    let score = 0;
    if (metric === 'members') {
      score = org.memberCount;
    } else if (metric === 'orders') {
      score = org.totalOrderCount;
    } else {
      // composite weighting
      score = org.memberCount * 0.6 + org.totalOrderCount * 0.4;
    }
    return { org, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const paginated = scored.slice(offset, offset + limit);

  // Attach current-user membership flag
  const currentUser = await getOptionalCurrentUser(ctx);
  const withMembership: Array<PopularOrganization> = await Promise.all(
    paginated.map(async ({ org, score }): Promise<PopularOrganization> => {
      let isMember = false;
      if (currentUser) {
        const membership = await ctx.db
          .query('organizationMembers')
          .withIndex('by_user_organization', (q) =>
            q.eq('userId', currentUser._id as Id<'users'>).eq('organizationId', org._id as Id<'organizations'>)
          )
          .filter((q) => q.eq(q.field('isActive'), true))
          .first();
        isMember = !!membership;
      }

      // Resolve R2 public URLs for banner/logo using direct URL construction (no query needed)
      const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

      let bannerImageUrl: string | undefined;
      if (isKey(org.bannerImage as unknown as string)) {
        bannerImageUrl = buildPublicUrl(org.bannerImage as unknown as string) || undefined;
      }

      let logoUrl: string | undefined;
      if (isKey(org.logo as unknown as string)) {
        logoUrl = buildPublicUrl(org.logo as unknown as string) || undefined;
      }

      return {
        id: org._id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        logo: org.logo,
        logoUrl,
        bannerImage: org.bannerImage,
        bannerImageUrl,
        organizationType: org.organizationType,
        industry: org.industry,
        memberCount: org.memberCount,
        totalOrderCount: org.totalOrderCount,
        isMember,
        popularityScore: score,
      };
    })
  );

  return {
    organizations: withMembership,
    total: scored.length,
    offset,
    limit,
    hasMore: offset + limit < scored.length,
  };
};
