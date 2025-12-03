// Re-export types from schema for convenience
export type {
  AccountSettings,
  NotificationPrefs,
  ProfileVisibility,
} from '@/src/schema/account';

// Server response types
export interface AccountSettingsResponse {
  phone: string | null;
  profileVisibility: 'public' | 'private';
  notificationPrefs: {
    orderUpdates: {
      email: boolean;
      push: boolean;
    };
    promotional: {
      email: boolean;
      push: boolean;
    };
  };
}
