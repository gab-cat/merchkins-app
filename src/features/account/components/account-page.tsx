'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AccountPageProps {
  clerkId: string;
}

export function AccountPage({ clerkId }: AccountPageProps) {
  const user = useQuery(api.users.queries.index.getCurrentUser, { clerkId });
  const updateProfile = useMutation(api.users.mutations.index.updateProfile);
  const updatePreferences = useMutation(api.users.mutations.index.updatePreferences);

  const loading = user === undefined;

  const defaultPreferences = useMemo(
    () => ({
      notifications: {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: false,
      },
      privacy: {
        profileVisibility: 'PUBLIC' as const,
        showActivity: true,
      },
    }),
    []
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [prefEmail, setPrefEmail] = useState(true);
  const [prefPush, setPrefPush] = useState(true);
  const [prefOrderUpdates, setPrefOrderUpdates] = useState(true);
  const [prefPromotions, setPrefPromotions] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [showActivity, setShowActivity] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setPhone(user.phone ?? '');

    const prefs = user.preferences ?? defaultPreferences;
    setPrefEmail(prefs.notifications.email);
    setPrefPush(prefs.notifications.push);
    setPrefOrderUpdates(prefs.notifications.orderUpdates);
    setPrefPromotions(prefs.notifications.promotions);
    setProfileVisibility(prefs.privacy.profileVisibility);
    setShowActivity(prefs.privacy.showActivity);
  }, [user, defaultPreferences]);

  async function handleSaveProfile() {
    if (!user) return;
    try {
      setSavingProfile(true);
      await updateProfile({
        userId: user._id,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePreferences() {
    if (!user) return;
    try {
      setSavingPrefs(true);
      await updatePreferences({
        userId: user._id,
        preferences: {
          notifications: {
            email: prefEmail,
            push: prefPush,
            orderUpdates: prefOrderUpdates,
            promotions: prefPromotions,
          },
          privacy: {
            profileVisibility,
            showActivity,
          },
        },
      });
    } finally {
      setSavingPrefs(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 w-full rounded bg-secondary animate-pulse" />
                <div className="h-10 w-full rounded bg-secondary animate-pulse" />
                <div className="h-10 w-full rounded bg-secondary animate-pulse" />
                <div className="h-10 w-40 rounded bg-secondary animate-pulse" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-6 w-2/3 rounded bg-secondary animate-pulse" />
                <div className="h-6 w-3/4 rounded bg-secondary animate-pulse" />
                <div className="h-6 w-1/2 rounded bg-secondary animate-pulse" />
                <div className="h-10 w-40 rounded bg-secondary animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Account</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="firstName">
                  First name
                </label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="lastName">
                  Last name
                </label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="phone">
                  Phone
                </label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="pt-2">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium">Notifications</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={prefEmail} onChange={(e) => setPrefEmail(e.target.checked)} />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={prefPush} onChange={(e) => setPrefPush(e.target.checked)} />
                    Push
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={prefOrderUpdates} onChange={(e) => setPrefOrderUpdates(e.target.checked)} />
                    Order updates
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={prefPromotions} onChange={(e) => setPrefPromotions(e.target.checked)} />
                    Promotions
                  </label>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-2 text-sm font-medium">Privacy</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Profile visibility</label>
                    <select
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE')}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={showActivity} onChange={(e) => setShowActivity(e.target.checked)} />
                    Show activity
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleSavePreferences} disabled={savingPrefs}>
                  {savingPrefs ? 'Saving...' : 'Save preferences'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
