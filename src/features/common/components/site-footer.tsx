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
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand / About */}
        <div className="space-y-3">
          <div className={cn('text-lg font-semibold md:text-2xl', organization?.name ? '' : 'font-genty')}>
            {organization?.name || (
              <>
                <span className='text-white'>Merch</span>
                <span className='text-brand-neon'>kins</span>
              </>
            )}
          </div>
          {organization?.description ? (
            <p className="line-clamp-3 text-sm opacity-80 leading-relaxed">
              {organization.description}
            </p>
          ) : (
            <p className="text-sm opacity-80 leading-relaxed">
              Custom merch made easy — shop, manage, and fulfill with <span className="font-genty"><span className='text-white'>Merch</span><span className='text-brand-neon'>kins</span></span>.
            </p>
          )}
          <div className="flex items-center gap-2" aria-label="Social links" role="navigation">
            {organization?.website ? (
              <Link
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:scale-110 transition-all duration-200"
                aria-label="Website"
                data-testid="footer-social-website"
              >
                <Globe className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href="mailto:business@merchkins.com"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:scale-110 transition-all duration-200"
              aria-label="Email"
              data-testid="footer-social-email"
            >
              <Mail className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Shop */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Shop</h3>
          <ul className="space-y-2 text-sm opacity-85">
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}` : '/'} className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/search` : '/search'} className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <SearchIcon className="h-3.5 w-3.5" />
                <span>Search</span>
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/c/apparel` : '/c/apparel'} className="hover:text-primary hover:translate-x-1 transition-all duration-200">
                Apparel
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/c/accessories` : '/c/accessories'} className="hover:text-primary hover:translate-x-1 transition-all duration-200">
                Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Support & legal</h3>
          <ul className="space-y-2 text-sm opacity-85">
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/chats` : '/chats'} className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat</span>
              </Link>
            </li>
            <li>
              <Link href={orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'} className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <Ticket className="h-3.5 w-3.5" />
                <span>Support tickets</span>
              </Link>
            </li>
            <li>
              <Link href="#returns" className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Returns</span>
              </Link>
            </li>
            <li>
              <Link href="#help" className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Help center</span>
              </Link>
            </li>
            <li>
              <Link href="#terms" className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <FileText className="h-3.5 w-3.5" />
                <span>Terms</span>
              </Link>
            </li>
            <li>
              <Link href="#privacy" className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-1 transition-all duration-200">
                <Shield className="h-3.5 w-3.5" />
                <span>Privacy</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Stay in the loop</h3>
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
              className="h-8 flex-1 text-sm"
              required
            />
            <Button type="submit" size="sm" className="h-8 px-3 text-sm">Subscribe</Button>
          </form>
          <p className="text-xs opacity-70 leading-relaxed">
            By subscribing, you agree to our{' '}
            <Link href="#privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link>.
          </p>
        </div>
        </div>
      </div>

      <div className="border-t border-border/50" />
      <div className="w-full px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs opacity-80">
          <p className="font-medium">&copy; {new Date().getFullYear()} {organization?.name || <span className="font-genty"><span className='text-white'>Merch</span><span className='text-brand-neon'>kins</span></span>}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="#terms" className="hover:text-primary hover:underline transition-colors">Terms</Link>
            <span aria-hidden>•</span>
            <Link href="#privacy" className="hover:text-primary hover:underline transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

