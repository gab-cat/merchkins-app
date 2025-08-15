"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Home,
  Search as SearchIcon,
  RotateCcw,
  HelpCircle,
  Globe,
  Mail,
  MessageSquare,
  Ticket,
  FileText,
  Shield,
} from 'lucide-react'
import { showToast } from '@/lib/toast'

export function SiteFooter () {
  const pathname = usePathname()
  const orgSlugFromPath = useMemo(() => {
    if (!pathname) return undefined
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'o' && segments[1]) return segments[1]
    return undefined
  }, [pathname])

  const [persistedSlug, setPersistedSlug] = React.useState<string | undefined>(undefined)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (orgSlugFromPath) {
      localStorage.setItem('lastOrgSlug', orgSlugFromPath)
      setPersistedSlug(orgSlugFromPath)
      return
    }
    if (pathname === '/') {
      localStorage.removeItem('lastOrgSlug')
      setPersistedSlug(undefined)
      return
    }
    const last = localStorage.getItem('lastOrgSlug') || undefined
    setPersistedSlug(last || undefined)
  }, [orgSlugFromPath, pathname])

  const orgSlug = persistedSlug || orgSlugFromPath

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )

  const footerClassName = cn('border-t')

  return (
    <footer
      className={footerClassName}
      style={{
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-fg)'
      }}
    >
      <div className="container mx-auto px-3 py-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand / About */}
        <div>
          <div className="text-lg font-semibold md:text-xl" style={{ color: 'var(--footer-fg)' }}>
            {organization?.name || 'Merchkins'}
          </div>
          {organization?.description ? (
            <p className="mt-2 line-clamp-3 text-sm md:text-base opacity-80">
              {organization.description}
            </p>
          ) : (
            <p className="mt-2 text-sm md:text-base opacity-80">
              Custom merch made easy — shop, manage, and fulfill with Merchkins.
            </p>
          )}
          <div className="mt-3 flex items-center gap-2" aria-label="Social links" role="navigation">
            {organization?.website ? (
              <Link
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                aria-label="Website"
                data-testid="footer-social-website"
              >
                <Globe className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href="mailto:business@merchkins.com"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
              aria-label="Email"
              data-testid="footer-social-email"
            >
              <Mail className="h-4 w-4" />
            </Link>
            {/* Optional social placeholders; render only if org provides links in future */}
            {/* <Link href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" aria-label="Instagram"><Instagram className="h-4 w-4" /></Link> */}
            {/* <Link href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" aria-label="Facebook"><Facebook className="h-4 w-4" /></Link> */}
            {/* <Link href="#" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></Link> */}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--footer-fg)' }}>Shop</h3>
          <ul className="space-y-2 text-sm md:text-[15px]" style={{ color: 'var(--footer-fg)', opacity: 0.85 }}>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}` : '/'} className="inline-flex items-center gap-2">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/search` : '/search'} className="inline-flex items-center gap-2">
                <SearchIcon className="h-3.5 w-3.5" />
                <span>Search</span>
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/c/apparel` : '/c/apparel'}>
                Apparel
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/c/accessories` : '/c/accessories'}>
                Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--footer-fg)' }}>Support & legal</h3>
          <ul className="space-y-2 text-sm md:text-[15px]" style={{ color: 'var(--footer-fg)', opacity: 0.85 }}>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/chats` : '/chats'} className="inline-flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat</span>
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'} className="inline-flex items-center gap-2">
                <Ticket className="h-3.5 w-3.5" />
                <span>Support tickets</span>
              </Link>
            </li>
            <li>
              <Link href="#returns" className="inline-flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Returns</span>
              </Link>
            </li>
            <li>
              <Link href="#help" className="inline-flex items-center gap-2">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Help center</span>
              </Link>
            </li>
            <li>
              <Link href="#terms" className="inline-flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                <span>Terms</span>
              </Link>
            </li>
            <li>
              <Link href="#privacy" className="inline-flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                <span>Privacy</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--footer-fg)' }}>Stay in the loop</h3>
          <form
            className="flex w-full max-w-sm items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const input = form.elements.namedItem('email') as HTMLInputElement | null
              const email = input?.value?.trim() || ''
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast({ type: 'error', title: 'Enter a valid email address' })
                return
              }
              showToast({ type: 'success', title: 'Subscribed! Thanks for joining.' })
              form.reset()
            }}
            data-testid="footer-newsletter-form"
          >
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              className="h-10 flex-1"
              required
            />
            <Button type="submit" className="h-10 px-3">Subscribe</Button>
          </form>
          <p className="mt-2 text-xs md:text-sm opacity-70">
            By subscribing, you agree to our{' '}
            <Link href="#privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <div className="border-t" />
      <div className="container mx-auto flex items-center justify-between gap-3 px-3 py-4 text-xs md:text-sm opacity-80">
        <p className="font-medium">&copy; {new Date().getFullYear()} {organization?.name || 'Merchkins'}. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link href="#terms" className="hover:underline">Terms</Link>
          <span aria-hidden>•</span>
          <Link href="#privacy" className="hover:underline">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}

