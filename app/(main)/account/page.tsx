import React from 'react'
import { AccountPage } from '@/src/features/account/components/account-page'
import { auth } from '@clerk/nextjs/server'

export default async function Page () {
  const { userId } = await auth()
  if (!userId) {
    return null
  }
  return <AccountPage clerkId={userId} />
}


