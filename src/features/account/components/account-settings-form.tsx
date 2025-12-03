'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Bell, Phone, Eye, Mail, Smartphone, Package, Star, Save } from 'lucide-react';
import { useAccountSettings } from '../hooks/use-account-settings';
import { accountSettingsSchema, type AccountSettings } from '@/src/schema/account';

export function AccountSettingsForm() {
  const { data: settings, updateSettings, isUpdating } = useAccountSettings();
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>(settings?.profileVisibility || 'public');

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
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleNotificationChange = (key: 'emailNotifications' | 'pushNotifications' | 'orderUpdates' | 'promotionalEmails', checked: boolean) => {
    setValue(`notificationPrefs.${key}`, checked, { shouldDirty: true });
  };

  if (!settings) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-medium text-primary">Profile</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Manage your personal information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <Label htmlFor="phone" className="text-sm font-medium text-primary">
                Phone number
              </Label>
            </div>
            <Input id="phone" placeholder="+1 (555) 123-4567" {...register('phone')} className="h-9 border-border/50 focus:border-primary" />
            {errors.phone && (
              <p className="text-sm text-destructive" role="alert">
                {errors.phone.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Used for order updates and account recovery</p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-medium text-primary">Privacy</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Control your privacy settings</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium text-primary">Profile visibility</Label>
              </div>
              <p className="text-xs text-muted-foreground">Control who can see your profile information</p>
            </div>
            <Switch checked={profileVisibility === 'public'} onCheckedChange={(checked) => setProfileVisibility(checked ? 'public' : 'private')} />
          </div>
          <div className="flex justify-end text-xs text-muted-foreground">{profileVisibility === 'public' ? '🌐 Public' : '🔒 Private'}</div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-medium text-primary">Notifications</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <Label htmlFor="email-notifications" className="text-sm text-primary">
                Email notifications
              </Label>
            </div>
            <Switch
              id="email-notifications"
              checked={watchedPrefs?.emailNotifications ?? true}
              onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <Label htmlFor="push-notifications" className="text-sm text-primary">
                Push notifications
              </Label>
            </div>
            <Switch
              id="push-notifications"
              checked={watchedPrefs?.pushNotifications ?? true}
              onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <Label htmlFor="order-updates" className="text-sm text-primary">
                  Order updates
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Get notified about your order status and updates</p>
            </div>
            <Switch
              id="order-updates"
              checked={watchedPrefs?.orderUpdates ?? true}
              onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <Label htmlFor="promotional-emails" className="text-sm text-primary">
                  Promotional emails
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Receive updates about new products and special offers</p>
            </div>
            <Switch
              id="promotional-emails"
              checked={watchedPrefs?.promotionalEmails ?? false}
              onCheckedChange={(checked) => handleNotificationChange('promotionalEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isUpdating || !isDirty} className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="h-4 w-4 mr-2" />
          {isUpdating ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
