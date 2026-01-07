import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, createTestOrgMemberData } from '../testHelpers';

/**
 * Organization Visibility Integration Tests
 *
 * Tests the organization visibility system including:
 * - PUBLIC: Anyone can access storefront
 * - PRIVATE: Requires membership, request-to-join flow
 * - SECRET: Requires membership via invite, hidden from search
 *
 * Business Rules:
 * - PUBLIC storefront is always accessible
 * - PRIVATE storefront requires membership or pending request
 * - SECRET storefront requires membership (invite-only)
 * - SECRET orgs are hidden from search results
 * - Request-to-join only works for PRIVATE orgs
 */

describe('Organization Visibility Integration Tests', () => {
  // =========================================================================
  // checkStorefrontAccess Tests
  // =========================================================================
  describe('checkStorefrontAccess', () => {
    it('should return hasAccess: true for PUBLIC organization (unauthenticated)', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'creator_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PUBLIC',
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(userId, orgId));
      });

      // Unauthenticated query
      const result = await t.query(api.organizations.queries.index.checkStorefrontAccess, {
        organizationId: orgId,
      });

      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBe('PUBLIC');
      expect(result.organizationType).toBe('PUBLIC');
    });

    it('should return hasAccess: false for PRIVATE organization (non-member)', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'non_member_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PRIVATE',
        });
      });

      const asNonMember = t.withIdentity({ subject: 'non_member_clerk' });

      const result = await asNonMember.query(api.organizations.queries.index.checkStorefrontAccess, {
        organizationId: orgId,
      });

      expect(result.hasAccess).toBe(false);
      expect(result.organizationType).toBe('PRIVATE');
      expect(result.hasPendingRequest).toBe(false);
    });

    it('should return hasAccess: true for PRIVATE organization (member)', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'member_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PRIVATE',
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(userId, orgId, 'MEMBER'));
      });

      const asMember = t.withIdentity({ subject: 'member_clerk' });

      const result = await asMember.query(api.organizations.queries.index.checkStorefrontAccess, {
        organizationId: orgId,
      });

      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBe('MEMBER');
      expect(result.organizationType).toBe('PRIVATE');
    });

    it('should return hasAccess: false for SECRET organization (non-member)', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'non_member_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'SECRET',
        });
      });

      const asNonMember = t.withIdentity({ subject: 'non_member_clerk' });

      const result = await asNonMember.query(api.organizations.queries.index.checkStorefrontAccess, {
        organizationId: orgId,
      });

      expect(result.hasAccess).toBe(false);
      expect(result.organizationType).toBe('SECRET');
    });

    it('should return hasAccess: true for SECRET organization (member via invite)', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'invited_member_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'SECRET',
        });
      });

      // Member added via invite
      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(userId, orgId, 'MEMBER'));
      });

      const asMember = t.withIdentity({ subject: 'invited_member_clerk' });

      const result = await asMember.query(api.organizations.queries.index.checkStorefrontAccess, {
        organizationId: orgId,
      });

      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBe('MEMBER');
      expect(result.organizationType).toBe('SECRET');
    });

    it('should return hasPendingRequest: true for PRIVATE org with pending request', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'requester_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PRIVATE',
        });
      });

      // Create pending join request
      await t.run(async (ctx) => {
        await ctx.db.insert('organizationJoinRequests', {
          organizationId: orgId,
          userId,
          status: 'PENDING',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const asRequester = t.withIdentity({ subject: 'requester_clerk' });

      const result = await asRequester.query(api.organizations.queries.index.checkStorefrontAccess, {
        organizationId: orgId,
      });

      expect(result.hasAccess).toBe(false);
      expect(result.organizationType).toBe('PRIVATE');
      expect(result.hasPendingRequest).toBe(true);
    });
  });

  // =========================================================================
  // searchOrganizations Tests
  // =========================================================================
  describe('searchOrganizations', () => {
    it('should exclude SECRET organizations from search results', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          name: 'Public Store',
          slug: 'public-store',
          organizationType: 'PUBLIC',
        });
        await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          name: 'Private Store',
          slug: 'private-store',
          organizationType: 'PRIVATE',
        });
        await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          name: 'Secret Store',
          slug: 'secret-store',
          organizationType: 'SECRET',
        });
      });

      const results = await t.query(api.organizations.queries.index.searchOrganizations, {
        searchTerm: 'Store',
      });

      const names = results.map((org) => org.name);
      expect(names).toContain('Public Store');
      expect(names).toContain('Private Store');
      expect(names).not.toContain('Secret Store');
    });
  });

  // =========================================================================
  // requestToJoinOrganization Tests
  // =========================================================================
  describe('requestToJoinOrganization', () => {
    it('should reject request for PUBLIC organization', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PUBLIC',
        });
      });

      const asUser = t.withIdentity({ subject: 'user_clerk' });

      await expect(
        asUser.mutation(api.organizations.mutations.index.requestToJoinOrganization, {
          organizationId: orgId,
        })
      ).rejects.toThrow('Public organizations can be joined directly');
    });

    it('should reject request for SECRET organization', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'SECRET',
        });
      });

      const asUser = t.withIdentity({ subject: 'user_clerk' });

      await expect(
        asUser.mutation(api.organizations.mutations.index.requestToJoinOrganization, {
          organizationId: orgId,
        })
      ).rejects.toThrow('Secret organizations require an invite link');
    });

    it('should allow request for PRIVATE organization', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PRIVATE',
        });
      });

      const asUser = t.withIdentity({ subject: 'user_clerk' });

      const result = await asUser.mutation(api.organizations.mutations.index.requestToJoinOrganization, {
        organizationId: orgId,
        note: 'Please let me in!',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('PENDING');
    });
  });

  // =========================================================================
  // joinPublicOrganization Tests
  // =========================================================================
  describe('joinPublicOrganization', () => {
    it('should allow joining PUBLIC organization directly', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PUBLIC',
        });
      });

      const asUser = t.withIdentity({ subject: 'user_clerk' });

      const result = await asUser.mutation(api.organizations.mutations.index.joinPublicOrganization, {
        organizationId: orgId,
      });

      expect(result.success).toBe(true);
    });

    it('should reject joining PRIVATE organization directly', async () => {
      const t = convexTest(schema, modules);

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', {
          ...createTestOrganizationData(),
          organizationType: 'PRIVATE',
        });
      });

      const asUser = t.withIdentity({ subject: 'user_clerk' });

      await expect(
        asUser.mutation(api.organizations.mutations.index.joinPublicOrganization, {
          organizationId: orgId,
        })
      ).rejects.toThrow('Only public organizations can be joined directly');
    });
  });
});
