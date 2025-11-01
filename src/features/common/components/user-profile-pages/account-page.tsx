"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
//
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

//
import { User, Phone, Save } from 'lucide-react'
import { SettingsHeader, SettingsList, SettingsRow } from './settings'

export function AccountPage () {
  const { userId: clerkId } = useAuth()
  const user = useQuery(api.users.queries.index.getCurrentUser, {
    clerkId: clerkId || ''
  })
  const updateProfile = useMutation(api.users.mutations.index.updateProfile)
  const updatePreferences = useMutation(
    api.users.mutations.index.updatePreferences
  )

  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  // Preferences state (copied from Account page)
  const defaultPreferences = useMemo(
    () => ({
      notifications: {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: false
      },
      privacy: {
        profileVisibility: 'PUBLIC' as const,
        showActivity: true
      }
    }),
    []
  )

  const [prefEmail, setPrefEmail] = useState(true)
  const [prefPush, setPrefPush] = useState(true)
  const [prefOrderUpdates, setPrefOrderUpdates] = useState(true)
  const [prefPromotions, setPrefPromotions] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState<
    'PUBLIC' | 'PRIVATE'
  >('PUBLIC')
  const [showActivity, setShowActivity] = useState(true)
  const [savingPrefs, setSavingPrefs] = useState(false)

  useEffect(() => {
    if (!user) return
    setPhone(user.phone ?? '')

    const prefs = user.preferences ?? defaultPreferences
    setPrefEmail(prefs.notifications.email)
    setPrefPush(prefs.notifications.push)
    setPrefOrderUpdates(prefs.notifications.orderUpdates)
    setPrefPromotions(prefs.notifications.promotions)
    setProfileVisibility(prefs.privacy.profileVisibility)
    setShowActivity(prefs.privacy.showActivity)
  }, [user, defaultPreferences])

  async function handleSaveProfile () {
    if (!user) return
    try {
      setSaving(true)
      await updateProfile({
        userId: user._id,
        phone: phone || undefined
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePreferences () {
    if (!user) return
    try {
      setSavingPrefs(true)
      await updatePreferences({
        userId: user._id,
        preferences: {
          notifications: {
            email: prefEmail,
            push: prefPush,
            orderUpdates: prefOrderUpdates,
            promotions: prefPromotions
          },
          privacy: {
            profileVisibility,
            showActivity
          }
        }
      })
    } finally {
      setSavingPrefs(false)
    }
  }

  if (user === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <p className="text-muted-foreground">
          Please sign in to view your profile.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsHeader title="Account Settings" />
      <SettingsList>

        <SettingsRow
          label={<span>Phone</span>}
          action={
            <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="h-8">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          }
        >
          <div className="relative max-w-sm">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="pl-9 h-9"
            />
          </div>
        </SettingsRow>

        <SettingsRow label={<span>Notifications</span>}>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={prefEmail}
                onChange={(e) => setPrefEmail(e.target.checked)}
              />
              Email notifications
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={prefPush}
                onChange={(e) => setPrefPush(e.target.checked)}
              />
              Push notifications
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={prefOrderUpdates}
                onChange={(e) => setPrefOrderUpdates(e.target.checked)}
              />
              Order updates
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={prefPromotions}
                onChange={(e) => setPrefPromotions(e.target.checked)}
              />
              Promotional emails
            </label>
          </div>
        </SettingsRow>

        <SettingsRow
          label={<span>Privacy</span>}
          action={
            <Button onClick={handleSavePreferences} disabled={savingPrefs} size="sm" className="h-8">
              {savingPrefs ? 'Saving...' : 'Save preferences'}
            </Button>
          }
          alignTop
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile visibility</label>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={profileVisibility}
                onChange={(e) =>
                  setProfileVisibility(
                    e.target.value === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'
                  )
                }
              >
                <option value="PUBLIC">🌐 Public - Anyone can see your profile</option>
                <option value="PRIVATE">🔒 Private - Only you can see your profile</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={showActivity}
                onChange={(e) => setShowActivity(e.target.checked)}
              />
              Show activity status
            </label>
          </div>
        </SettingsRow>
      </SettingsList>


    </div>
  )
}
