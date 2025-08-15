"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

/**
 * Applies organization theme variables globally when on /o/[orgSlug].
 * This ensures common components like the global header/footer adopt
 * the organization's colors, mode, and font.
 */
export function OrgThemeController () {
  const pathname = usePathname()

  const orgSlugFromPath = React.useMemo(() => {
    if (!pathname) return undefined
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'o' && segments[1]) return segments[1]
    return undefined
  }, [pathname])

  const [persistedSlug, setPersistedSlug] = React.useState<string | undefined>(undefined)

  // Load persisted slug for non-org pages
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (orgSlugFromPath) {
      localStorage.setItem('lastOrgSlug', orgSlugFromPath)
      setPersistedSlug(orgSlugFromPath)
      return
    }
    // Reset when visiting the main homepage only
    if (pathname === '/') {
      localStorage.removeItem('lastOrgSlug')
      setPersistedSlug(undefined)
      return
    }
    const last = localStorage.getItem('lastOrgSlug') || undefined
    setPersistedSlug(last || undefined)
  }, [orgSlugFromPath, pathname])

  const slugToUse = orgSlugFromPath || persistedSlug

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    slugToUse ? { slug: slugToUse } : ('skip' as unknown as { slug: string })
  )

  const darkSetByThis = React.useRef(false)

  React.useEffect(() => {
    const root = document.documentElement
    const t = organization?.themeSettings

    const setVar = (key: string, value?: string) => {
      if (value && value.trim().length > 0) {
        root.style.setProperty(key, value)
      } else {
        root.style.removeProperty(key)
      }
    }

    // Only activate theming on /o/* routes
    if (slugToUse) {
      setVar('--primary', t?.primaryColor)
      setVar('--accent', t?.secondaryColor)
      setVar('--font-sans', t?.fontFamily)
      setVar('--header-bg', t?.headerBackgroundColor)
      setVar('--header-fg', t?.headerForegroundColor)
      setVar('--footer-bg', t?.footerBackgroundColor)
      setVar('--footer-fg', t?.footerForegroundColor)
      setVar('--header-title', t?.headerTitleColor)

      if (t?.borderRadius) {
        const map: Record<string, string> = {
          none: '0rem',
          small: '0.375rem',
          medium: '0.75rem',
          large: '1rem',
        }
        setVar('--radius', map[t.borderRadius] || '0.75rem')
      } else {
        setVar('--radius', undefined)
      }

      if (t?.mode === 'dark') {
        if (!root.classList.contains('dark')) darkSetByThis.current = true
        root.classList.add('dark')
      } else if (t?.mode === 'light') {
        if (root.classList.contains('dark')) {
          root.classList.remove('dark')
          darkSetByThis.current = false
        }
      }
    } else {
      // Leaving org routes: reset to defaults
      setVar('--primary', undefined)
      setVar('--accent', undefined)
      setVar('--font-sans', undefined)
      setVar('--radius', undefined)
      setVar('--header-bg', undefined)
      setVar('--header-fg', undefined)
      setVar('--footer-bg', undefined)
      setVar('--footer-fg', undefined)
      setVar('--header-title', undefined)
      if (darkSetByThis.current) {
        root.classList.remove('dark')
        darkSetByThis.current = false
      }
    }

    return () => {}
  }, [slugToUse, organization])

  return null
}


