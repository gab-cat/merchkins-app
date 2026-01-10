import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { getOptionalCurrentUser } from '../../helpers/auth';
import { buildPublicUrl } from '../../helpers/utils';

type SearchedOrganization = {
  id: Id<'organizations'>;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  bannerImage?: string;
  bannerImageUrl?: string;
  organizationType: 'PUBLIC' | 'PRIVATE';
  industry?: string;
  memberCount: number;
  isMember: boolean;
};

export const searchPublicOrganizationsArgs = {
  searchTerm: v.string(),
  limit: v.optional(v.number()),
  organizationType: v.optional(v.union(v.literal('PUBLIC'), v.literal('PRIVATE'))),
};

export const searchPublicOrganizationsHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm: string;
    limit?: number;
    organizationType?: 'PUBLIC' | 'PRIVATE';
  }
): Promise<SearchedOrganization[]> => {
  const { searchTerm, limit = 20, organizationType } = args;

  // Require minimum search length
  if (searchTerm.length < 2) {
    return [];
  }

  // Use the search index for efficient text search at the database level
  let organizationsMatches = await ctx.db
    .query('organizations')
    .withSearchIndex('search_organizations', (q) => {
      let search = q.search('name', searchTerm).eq('isDeleted', false);
      if (organizationType) {
        search = search.eq('organizationType', organizationType);
      }
      return search;
    })
    .take(Math.min(limit * 2, 100)); // Fetch a healthy pool for custom sorting

  // ALWAYS filter out SECRET organizations - they should never be discoverable
  // And apply type filter if search index didn't (i.e., if no organizationType was provided)
  let organizations = organizationsMatches.filter((org) => {
    if (org.organizationType === 'SECRET') return false;
    if (organizationType && org.organizationType !== organizationType) return false;
    return true;
  });

  // Search by name, slug, or description (case insensitive) for the already fetched candidates
  const searchLower = searchTerm.toLowerCase();
  const matchedOrganizations = organizations;

  // Sort results: exact name match first, then by member count
  matchedOrganizations.sort((a, b) => {
    const aExact = a.name.toLowerCase() === searchLower ? 1 : 0;
    const bExact = b.name.toLowerCase() === searchLower ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    // Public orgs first
    const aPublic = a.organizationType === 'PUBLIC' ? 1 : 0;
    const bPublic = b.organizationType === 'PUBLIC' ? 1 : 0;
    if (aPublic !== bPublic) return bPublic - aPublic;

    // Then by member count
    return (b.memberCount || 0) - (a.memberCount || 0);
  });

  // Limit results
  const limitedResults = matchedOrganizations.slice(0, limit);

  // Get current user for membership check
  const currentUser = await getOptionalCurrentUser(ctx);
  const membershipMap = new Map<Id<'organizations'>, boolean>();

  if (currentUser) {
    const memberships = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', currentUser._id))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    memberships.forEach((m) => {
      membershipMap.set(m.organizationId, true);
    });
  }

  // Build response with membership info and resolved URLs
  const results: SearchedOrganization[] = limitedResults.map((org): SearchedOrganization => {
    const isMember = membershipMap.get(org._id) || false;

    // Resolve R2 public URLs
    const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

    let bannerImageUrl: string | undefined;
    if (org.bannerImage && isKey(org.bannerImage)) {
      bannerImageUrl = buildPublicUrl(org.bannerImage) || undefined;
    }

    let logoUrl: string | undefined;
    if (org.logo && isKey(org.logo)) {
      logoUrl = buildPublicUrl(org.logo) || undefined;
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
      organizationType: org.organizationType as 'PUBLIC' | 'PRIVATE',
      industry: org.industry,
      memberCount: org.memberCount,
      isMember,
    };
  });

  return results;
};
