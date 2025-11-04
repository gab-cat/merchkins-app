'use client'

import React from 'react'
import type { Preloaded } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { OrgThemeControllerWithPreload } from './org-theme-controller'

interface OrgThemeProviderProps {
  preloadedOrganization: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>
}

export function OrgThemeProvider ({ preloadedOrganization }: OrgThemeProviderProps) {
  return <OrgThemeControllerWithPreload preloadedOrganization={preloadedOrganization} />
}

