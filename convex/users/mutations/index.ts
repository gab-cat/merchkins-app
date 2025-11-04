import { mutation, internalMutation } from '../../_generated/server';

// Import args and handlers
import { addOrganizationMembershipArgs, addOrganizationMembershipHandler } from './addOrganizationMembership';
import { completeOnboardingArgs, completeOnboardingHandler } from './completeOnboarding';
import { deleteUserArgs, deleteUserHandler } from './deleteUser';
import { removeOrganizationMembershipArgs, removeOrganizationMembershipHandler } from './removeOrganizationMembership';
import { restoreUserArgs, restoreUserHandler } from './restoreUser';
import { updateLastLoginArgs, updateLastLoginHandler } from './updateLastLogin';
import { updateOrderStatsArgs, updateOrderStatsHandler } from './updateOrderStats';
import { updatePreferencesArgs, updatePreferencesHandler } from './updatePreferences';
import { updateProfileArgs, updateProfileHandler } from './updateProfile';
import { updateUserPermissionsArgs, updateUserPermissionsHandler } from './updateUserPermissions';
import { updateUserRoleArgs, updateUserRoleHandler } from './updateUserRole';

// Import webhook handlers (these are already exported as internal mutations in the clerkWebhook file)
export { handleUserCreated, handleUserUpdated, handleUserDeleted } from './clerkWebhook';

// Export regular mutation functions
export const addOrganizationMembership = mutation({
  args: addOrganizationMembershipArgs,
  handler: addOrganizationMembershipHandler,
});

export const completeOnboarding = mutation({
  args: completeOnboardingArgs,
  handler: completeOnboardingHandler,
});

export const deleteUser = mutation({
  args: deleteUserArgs,
  handler: deleteUserHandler,
});

export const removeOrganizationMembership = mutation({
  args: removeOrganizationMembershipArgs,
  handler: removeOrganizationMembershipHandler,
});

export const restoreUser = mutation({
  args: restoreUserArgs,
  handler: restoreUserHandler,
});

export const updateLastLogin = mutation({
  args: updateLastLoginArgs,
  handler: updateLastLoginHandler,
});

export const updatePreferences = mutation({
  args: updatePreferencesArgs,
  handler: updatePreferencesHandler,
});

export const updateProfile = mutation({
  args: updateProfileArgs,
  handler: updateProfileHandler,
});

export const updateUserPermissions = mutation({
  args: updateUserPermissionsArgs,
  handler: updateUserPermissionsHandler,
});

export const updateUserRole = mutation({
  args: updateUserRoleArgs,
  handler: updateUserRoleHandler,
});

// Export internal mutation (note: this is defined in its own file due to special handling)
export const updateOrderStats = internalMutation({
  args: updateOrderStatsArgs,
  handler: updateOrderStatsHandler,
});
