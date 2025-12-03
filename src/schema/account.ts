import { z } from 'zod';

// Phone validation - 10-11 digits only or empty
const phoneSchema = z
  .string()
  .regex(/^\d{10,11}$|^$/, 'Phone number must be exactly 10-11 digits')
  .nullable()
  .transform((val) => (val === '' ? null : val));

// Profile visibility enum
const profileVisibilitySchema = z.enum(['public', 'private']);

// Notification preferences schema - simplified structure
const notificationPrefsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  orderUpdates: z.boolean(),
  promotionalEmails: z.boolean(),
});

// Combined account settings schema
export const accountSettingsSchema = z.object({
  phone: phoneSchema,
  profileVisibility: profileVisibilitySchema,
  notificationPrefs: notificationPrefsSchema,
});

// Types inferred from schemas
export type AccountSettings = z.infer<typeof accountSettingsSchema>;
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;
export type ProfileVisibility = z.infer<typeof profileVisibilitySchema>;
