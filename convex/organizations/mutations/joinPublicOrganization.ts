import { MutationCtx } from "../../_generated/server"
import { v } from "convex/values"
import { Id } from "../../_generated/dataModel"
import { requireAuthentication } from "../../helpers/auth"

export const joinPublicOrganizationArgs = {
  organizationId: v.id('organizations'),
}

export const joinPublicOrganizationHandler = async (
  ctx: MutationCtx,
  args: { organizationId: Id<'organizations'> }
) => {
  const user = await requireAuthentication(ctx)

  const organization = await ctx.db.get(args.organizationId)
  if (!organization || organization.isDeleted) {
    throw new Error('Organization not found')
  }

  if (organization.organizationType !== 'PUBLIC') {
    throw new Error('Only public organizations can be joined directly')
  }

  // Check existing membership
  const existing = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) =>
      q.eq('userId', user._id as Id<'users'>).eq('organizationId', args.organizationId)
    )
    .first()

  if (existing) {
    if (existing.isActive) {
      return { success: true, organizationId: args.organizationId }
    }

    await ctx.db.patch(existing._id, {
      isActive: true,
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    })
  } else {
    await ctx.db.insert('organizationMembers', {
      userId: user._id as Id<'users'>,
      organizationId: args.organizationId,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        imageUrl: user.imageUrl,
        isStaff: user.isStaff,
      },
      organizationInfo: {
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        organizationType: organization.organizationType,
      },
      role: 'MEMBER',
      isActive: true,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
      permissions: [],
      orderCount: 0,
      messageCount: 0,
      updatedAt: Date.now(),
    })
  }

  // Recompute member and admin counts
  const activeMembers = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organization_active', (q) =>
      q.eq('organizationId', args.organizationId).eq('isActive', true)
    )
    .collect()

  const adminCount = activeMembers.filter((m) => m.role === 'ADMIN').length

  await ctx.db.patch(args.organizationId, {
    memberCount: activeMembers.length,
    adminCount,
    updatedAt: Date.now(),
  })

  return { success: true, organizationId: args.organizationId }
}


