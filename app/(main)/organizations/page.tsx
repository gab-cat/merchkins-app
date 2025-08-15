import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { OrganizationsPage } from '@/src/features/organizations/components/organizations-page'

export default async function Page () {
  const { userId } = await auth()
  if (!userId) {
    return null
  }
  return <OrganizationsPage clerkId={userId} />
}


