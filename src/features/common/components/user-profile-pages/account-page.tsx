"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { Separator } from '@/components/ui/separator'
import { User, Mail, Phone, Save } from 'lucide-react'

export function AccountPage() {
  const { userId: clerkId } = useAuth()
  const user = useQuery(api.users.queries.index.getCurrentUser, { clerkId: clerkId || '' })
  const updateProfile = useMutation(api.users.mutations.index.updateProfile)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setPhone(user.phone ?? '')
  }, [user])

  async function handleSaveProfile() {
    if (!user) return
    try {
      setSaving(true)
      await updateProfile({
        userId: user._id,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  if (user === undefined) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Profile Information</h3>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center">
        <Button variant="outline" asChild>
          <a href="/account">View Full Profile</a>
        </Button>
      </div>
    </div>
  )
}
