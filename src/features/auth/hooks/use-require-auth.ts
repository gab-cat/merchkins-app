'use client'

import { useState } from 'react'
import { useCurrentUser } from './use-current-user'
import { SignInRequiredDialog } from '../components/sign-in-required-dialog'

export const useRequireAuth = () => {
  const { user, isLoading } = useCurrentUser()
  const [dialogOpen, setDialogOpen] = useState(false)

  const requireAuth = (action?: () => void | Promise<void>) => {
    if (isLoading) {
      // Still loading, defer the action
      return
    }

    if (user === null) {
      // User not authenticated, show dialog
      setDialogOpen(true)
      return
    }

    // User is authenticated, run the action
    if (action) {
      action()
    }
  }

  return {
    requireAuth,
    dialogOpen,
    setDialogOpen,
  }
}
