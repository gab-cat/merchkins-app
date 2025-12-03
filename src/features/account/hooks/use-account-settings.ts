import { useMutation as useConvexMutation, useQuery as useConvexQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { showToast } from '@/lib/toast';
import type { AccountSettings } from '@/src/schema/account';

export function useAccountSettings() {
  // Query for fetching account settings
  const data = useConvexQuery(api.users.queries.getAccountSettings.default, {});
  const isLoading = data === undefined;

  // Mutation for updating account settings
  const updateSettingsMutation = useConvexMutation(api.users.mutations.updateAccountSettings.default);

  const updateSettings = async (settings: AccountSettings) => {
    try {
      // Transform null to undefined for phone (Convex mutation expects optional string, not nullable)
      await updateSettingsMutation({
        phone: settings.phone ?? undefined,
        profileVisibility: settings.profileVisibility,
        notificationPrefs: settings.notificationPrefs,
      });
      showToast({ type: 'success', title: 'Account settings updated successfully' });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to update account settings' });
      throw error;
    }
  };

  return {
    data,
    isLoading,
    updateSettings,
    isUpdating: false, // Convex mutations don't provide loading state in the same way
  };
}
