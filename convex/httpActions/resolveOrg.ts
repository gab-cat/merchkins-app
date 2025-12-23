import { api } from '../_generated/api';
import { httpAction } from '../_generated/server';

export const resolveOrgHandler = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    const organization = await ctx.runQuery(api.organizations.queries.index.getOrganizationBySlug, {
      slug,
    });

    if (organization) {
      return new Response(JSON.stringify({ slug: organization.slug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response('Organization not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error resolving organization:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
