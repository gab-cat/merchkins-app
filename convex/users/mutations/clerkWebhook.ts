/* eslint-disable @typescript-eslint/no-explicit-any */
import { MutationCtx, internalMutation } from '../../_generated/server';
import { v } from 'convex/values';

// Handle user creation from Clerk webhook
export const handleUserCreatedArgs = {
  clerkUser: v.any(),
};

export const handleUserCreatedHandler = async (ctx: MutationCtx, args: { clerkUser: any }) => {
  const { clerkUser } = args;

  try {
    console.log('Creating user from Clerk webhook:', clerkUser.id);

    // Extract user data from Clerk user object
    const email = clerkUser.email_addresses?.[0]?.email_address || '';
    const firstName = clerkUser.first_name || '';
    const lastName = clerkUser.last_name || '';
    const imageUrl = clerkUser.image_url || '';
    const phone = clerkUser.phone_numbers?.[0]?.phone_number || '';

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkUser.id))
      .first();

    if (existingUser) {
      console.log('User already exists, skipping creation');
      return existingUser._id;
    }

    // Create new user with default values
    const userId = await ctx.db.insert('users', {
      clerkId: clerkUser.id,
      email,
      firstName,
      lastName,
      imageUrl,
      phone,
      isDeleted: false,
      isOnboarded: false,
      isStaff: false,
      isAdmin: false,
      isSetupDone: false,
      isMerchant: false,
      permissions: [],
      totalOrders: 0,
      totalSpent: 0,
      reviewCount: 0,
      organizationMemberships: [],
      profileVisibility: 'public',
      notificationPrefs: {
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotionalEmails: false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('User created successfully:', userId);
    return userId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error}`);
  }
};

// Handle user updates from Clerk webhook
export const handleUserUpdatedArgs = {
  clerkUser: v.any(),
};

export const handleUserUpdatedHandler = async (ctx: MutationCtx, args: { clerkUser: any }) => {
  const { clerkUser } = args;

  try {
    console.log('Updating user from Clerk webhook:', clerkUser.id);

    // Find existing user
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkUser.id))
      .first();

    if (!existingUser) {
      console.log('User not found, creating new user');

      // Extract user data from Clerk user object
      const email = clerkUser.email_addresses?.[0]?.email_address || '';
      const firstName = clerkUser.first_name || '';
      const lastName = clerkUser.last_name || '';
      const imageUrl = clerkUser.image_url || '';
      const phone = clerkUser.phone_numbers?.[0]?.phone_number || '';

      // Create new user with default values
      const userId = await ctx.db.insert('users', {
        clerkId: clerkUser.id,
        email,
        firstName,
        lastName,
        imageUrl,
        phone,
        isDeleted: false,
        isOnboarded: false,
        isStaff: false,
        isAdmin: false,
        isSetupDone: false,
        isMerchant: false,
        permissions: [],
        totalOrders: 0,
        totalSpent: 0,
        reviewCount: 0,
        organizationMemberships: [],
        profileVisibility: 'public',
        notificationPrefs: {
          emailNotifications: true,
          pushNotifications: true,
          orderUpdates: true,
          promotionalEmails: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log('User created successfully:', userId);
      return userId;
    }

    // Extract updated data from Clerk user object
    const email = clerkUser.email_addresses?.[0]?.email_address || existingUser.email;
    const firstName = clerkUser.first_name || existingUser.firstName;
    const lastName = clerkUser.last_name || existingUser.lastName;
    const imageUrl = clerkUser.image_url || existingUser.imageUrl;
    const phone = clerkUser.phone_numbers?.[0]?.phone_number || existingUser.phone;

    // Update user
    await ctx.db.patch(existingUser._id, {
      email,
      firstName,
      lastName,
      imageUrl,
      phone,
      updatedAt: Date.now(),
    });

    console.log('User updated successfully:', existingUser._id);
    return existingUser._id;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error}`);
  }
};

// Handle user deletion from Clerk webhook
export const handleUserDeletedArgs = {
  clerkUserId: v.string(),
};

export const handleUserDeletedHandler = async (ctx: MutationCtx, args: { clerkUserId: string }) => {
  const { clerkUserId } = args;

  try {
    console.log('Soft deleting user from Clerk webhook:', clerkUserId);

    // Find existing user
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkUserId))
      .first();

    if (!existingUser) {
      console.log('User not found, skipping deletion');
      return;
    }

    // Soft delete user (don't actually delete the record)
    await ctx.db.patch(existingUser._id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    console.log('User soft deleted successfully:', existingUser._id);
    return existingUser._id;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error}`);
  }
};

// Export internal mutations
export const handleUserCreated = internalMutation({
  args: handleUserCreatedArgs,
  handler: handleUserCreatedHandler,
});

export const handleUserUpdated = internalMutation({
  args: handleUserUpdatedArgs,
  handler: handleUserUpdatedHandler,
});

export const handleUserDeleted = internalMutation({
  args: handleUserDeletedArgs,
  handler: handleUserDeletedHandler,
});
