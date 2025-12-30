'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Shield, Bell, Phone, Eye, Mail, Smartphone, Package, Star, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { useAccountSettings } from '../hooks/use-account-settings';
import { accountSettingsSchema, type AccountSettings } from '@/src/schema/account';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function AccountSettingsForm() {
  const { data: settings, updateSettings, isUpdating } = useAccountSettings();
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>(settings?.profileVisibility || 'public');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state with loaded settings
  useEffect(() => {
    if (settings?.profileVisibility) {
      setProfileVisibility(settings.profileVisibility);
    }
  }, [settings?.profileVisibility]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AccountSettings>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: settings || {
      phone: '',
      profileVisibility: 'public',
      notificationPrefs: {
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotionalEmails: false,
      },
    },
    values: settings
      ? {
          ...settings,
          phone: settings.phone ?? null,
        }
      : undefined,
  });

  const watchedPrefs = watch('notificationPrefs');

  const onSubmit = async (data: AccountSettings) => {
    try {
      await updateSettings({
        ...data,
        profileVisibility,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleNotificationChange = (key: 'emailNotifications' | 'pushNotifications' | 'orderUpdates' | 'promotionalEmails', checked: boolean) => {
    setValue(`notificationPrefs.${key}`, checked, { shouldDirty: true });
  };

  if (!settings) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton matching new design */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-100 p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg bg-slate-100" />
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {/* Profile Section */}
        <motion.div variants={itemVariants}>
          <div className="rounded-xl border border-slate-100 overflow-hidden bg-white hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded-lg bg-[#1d43d8]/10">
                <User className="h-4 w-4 text-[#1d43d8]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Profile</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                    Phone number
                  </Label>
                </div>
                <Input
                  id="phone"
                  placeholder="+63 912 345 6789"
                  {...register('phone')}
                  className="h-10 rounded-lg border-slate-200 focus:border-[#1d43d8] focus:ring-2 focus:ring-[#1d43d8]/20 transition-all"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 flex items-center gap-1" role="alert">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-slate-500">Used for order updates and account recovery</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacy Section */}
        <motion.div variants={itemVariants}>
          <div className="rounded-xl border border-slate-100 overflow-hidden bg-white hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded-lg bg-[#1d43d8]/10">
                <Shield className="h-4 w-4 text-[#1d43d8]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Privacy</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <Label className="text-sm font-medium text-slate-700">Profile visibility</Label>
                  </div>
                  <p className="text-xs text-slate-500">Control who can see your profile information</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                      profileVisibility === 'public'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {profileVisibility === 'public' ? '🌐 Public' : '🔒 Private'}
                  </span>
                  <Switch
                    checked={profileVisibility === 'public'}
                    onCheckedChange={(checked) => setProfileVisibility(checked ? 'public' : 'private')}
                    className="data-[state=checked]:bg-[#1d43d8]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={itemVariants}>
          <div className="rounded-xl border border-slate-100 overflow-hidden bg-white hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded-lg bg-[#1d43d8]/10">
                <Bell className="h-4 w-4 text-[#1d43d8]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Notifications</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Email notifications */}
              <div className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Mail className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Email notifications
                    </Label>
                    <p className="text-xs text-slate-500">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={watchedPrefs?.emailNotifications ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  className="data-[state=checked]:bg-[#1d43d8]"
                />
              </div>

              {/* Push notifications */}
              <div className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Smartphone className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Push notifications
                    </Label>
                    <p className="text-xs text-slate-500">Get notified on your device</p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={watchedPrefs?.pushNotifications ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                  className="data-[state=checked]:bg-[#1d43d8]"
                />
              </div>

              {/* Order updates */}
              <div className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Package className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <Label htmlFor="order-updates" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Order updates
                    </Label>
                    <p className="text-xs text-slate-500">Status changes, shipping updates</p>
                  </div>
                </div>
                <Switch
                  id="order-updates"
                  checked={watchedPrefs?.orderUpdates ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                  className="data-[state=checked]:bg-[#1d43d8]"
                />
              </div>

              {/* Promotional emails */}
              <div className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <Label htmlFor="promotional-emails" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Promotions & offers
                    </Label>
                    <p className="text-xs text-slate-500">New products and special deals</p>
                  </div>
                </div>
                <Switch
                  id="promotional-emails"
                  checked={watchedPrefs?.promotionalEmails ?? false}
                  onCheckedChange={(checked) => handleNotificationChange('promotionalEmails', checked)}
                  className="data-[state=checked]:bg-[#1d43d8]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            type="submit"
            disabled={isUpdating || !isDirty}
            className={`w-full h-11 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
              saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' : 'bg-[#1d43d8] hover:bg-[#1d43d8]/90 shadow-[#1d43d8]/25'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  );
}
