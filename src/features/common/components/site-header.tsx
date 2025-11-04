"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Building2, Package, User as UserIcon, MessageSquare, Ticket, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useQuery } from 'convex/react'
import { SignedIn, SignedOut, UserButton, useAuth, SignInButton, SignUpButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { CartSheet } from '@/src/features/cart/components/cart-sheet'
import { cn } from '@/lib/utils'
import { OrganizationsPage, AccountPage } from '@/src/features/common/components/user-profile-pages'

export function SiteHeader () {
  const router = useRouter()
  const pathname = usePathname()
  const { userId: clerkId } = useAuth()
  const isSignedIn = !!clerkId
  const [search, setSearch] = useState('')

  const orgSlugFromPath = useMemo(() => {
    if (!pathname) return undefined
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'o' && segments[1]) return segments[1]
    return undefined
  }, [pathname])

  const [persistedSlug, setPersistedSlug] = useState<string | undefined>(undefined)
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

  const topCategories = useQuery(
    api.categories.queries.index.getCategories,
    organization?._id
      ? { organizationId: organization._id, level: 0, isActive: true, limit: 8 }
      : { level: 0, isActive: true, limit: 8 }
  )

  const cart = useQuery(api.carts.queries.index.getCartByUser, {})
  const totalItems = useMemo(() => cart?.totalItems ?? 0, [cart])

  // Get current user and their organizations to check membership
  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string })
  )
  const userOrganizations = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id ? { userId: currentUser._id } : ('skip' as unknown as { userId: Id<'users'> })
  )

  // Check if user is a member of the current organization
  const isMember = useMemo(() => {
    if (!organization?._id || !userOrganizations) return false
    return userOrganizations.some((org) => org._id === organization._id)
  }, [organization?._id, userOrganizations])

  // Unread counts - only run when authenticated AND member of organization
  const chatsUnread = useQuery(
    api.chats.queries.index.getUnreadCount,
    isSignedIn && organization?._id && isMember
      ? { organizationId: organization._id } 
      : ('skip' as unknown as { organizationId?: Id<"organizations"> })
  )
  const ticketsUnread = useQuery(
    api.tickets.queries.index.getUnreadCount,
    isSignedIn && organization?._id && isMember
      ? { organizationId: organization._id } 
      : ('skip' as unknown as { organizationId?: Id<"organizations">; forAssignee?: boolean })
  )
  const totalChatUnread = (chatsUnread as { count?: number } | undefined)?.count || 0
  const totalTicketUnread = (ticketsUnread as { count?: number } | undefined)?.count || 0
  const totalSupportUnread = totalChatUnread + totalTicketUnread

  // Show home button if on storefront or using another store's theme
  const showHomeButton = useMemo(() => {
    return !!orgSlugFromPath || (!!persistedSlug && !orgSlugFromPath)
  }, [orgSlugFromPath, persistedSlug])

  function handleSearchSubmit (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = search.trim()
    if (q.length > 0) {
      router.push(
        orgSlug
          ? `/o/${orgSlug}/search?q=${encodeURIComponent(q)}`
          : `/search?q=${encodeURIComponent(q)}`
      )
    } else {
      router.push(orgSlug ? `/o/${orgSlug}/search` : '/search')
    }
  }

  const headerClassName = cn(
    'sticky top-0 z-40 w-full border-b',
    'supports-[backdrop-filter]:backdrop-blur-md',
    organization && 'border-primary/20 shadow-sm'
  )

  return (
    <header
      className={headerClassName}
      style={{
        backgroundColor: organization ? 'rgba(255, 255, 255, 0.95)' : 'var(--header-bg)',
        color: organization ? 'var(--foreground)' : 'var(--header-fg)'
      }}
    >
      {/* Main Header */}
      <div className="container max-w-7xl mx-auto flex h-14 items-center gap-2 px-4">
        {/* Logo */}
        <Link
          href={orgSlug ? `/o/${orgSlug}` : '/'}
          className="flex items-center gap-2 font-bold tracking-tight transition-opacity hover:opacity-80"
          style={{ color: organization ? 'var(--primary)' : 'var(--header-fg)' }}
        >
          <span className={cn(
            'text-lg md:text-xl font-bold',
            organization?.name ? '' : 'font-genty'
          )}>
            {organization?.name ?? (
              <div className="flex items-center">
                <span className="text-white">Merch</span>
                <span className="font-genty">kins</span>
              </div>
            )}
          </span>
        </Link>

        {/* Home button - shown when on storefront or using another store's theme */}
        {showHomeButton && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs px-2.5 h-9 hover:opacity-80 transition-all text-primary"
            aria-label="Go back home"
          >
            <Link className='!text-xs' href="/">
              <ArrowLeft className="h-2 w-2" />
              <span className="hidden sm:inline text-xs">Go back home</span>
            </Link>
          </Button>
        )}

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} role="search" className="hidden md:flex">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 z-10 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="h-9 pl-10 text-sm pr-10 bg-white text-black rounded-full border border-border hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-primary/10 hover:-translate-y-1/2 transition-all"
              >
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>
          {/* Support dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 px-2.5 h-9 relative hover:bg-gray-100/20 hover:opacity-80 transition-all",
                  organization ? "text-primary hover:text-primary" : "text-white hover:text-white"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Support</span>
                {totalSupportUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center animate-pulse font-medium">
                    {totalSupportUnread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 zoom-in-95">
              <DropdownMenuItem asChild data-testid="support-chats">
                <Link href={orgSlug ? `/o/${orgSlug}/chats` : '/chats'} className="flex items-center gap-2 hover:bg-accent/50 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chats</span>
                  {totalChatUnread > 0 && (
                    <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse font-medium">
                      {totalChatUnread}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="support-tickets">
                <Link href={orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'} className="flex items-center gap-2 hover:bg-accent/50 transition-colors">
                  <Ticket className="h-4 w-4" />
                  <span>Tickets</span>
                  {totalTicketUnread > 0 && (
                    <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse font-medium">
                      {totalTicketUnread}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="support-new-ticket">
                <Link href={orgSlug ? `/o/${orgSlug}/tickets/new` : '/tickets/new'} className="flex items-center gap-2 hover:bg-accent/50 transition-colors">
                  <Ticket className="h-4 w-4" />
                  <span>Create ticket</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SignedIn>
            <CartSheet initialCount={totalItems}>
              <Button
                variant="ghost"
                aria-label="Cart"
                size="sm"
                className={cn(
                  "gap-1.5 px-2.5 h-9 hover:bg-accent/20 hover:opacity-80 transition-all",
                  organization ? "text-primary hover:text-primary" : "text-white hover:text-white"
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only">Cart</span>
              </Button>
            </CartSheet>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-sm hover:bg-accent/50 transition-colors"
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="px-3 h-9 text-sm bg-primary hover:bg-primary/90 shadow-sm"
                >
                  Register
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/"
            appearance={{
                elements: {
                  userButtonAvatarBox: "!size-8 hover:scale-105 transition-transform duration-200",
                  userButtonPopoverCard: "bg-white border shadow-lg",
                  userButtonPopoverActionButton: "text-neutral-700 hover:bg-accent/50 transition-colors",
                }
              }}>
              <UserButton.MenuItems>
                <UserButton.Action label="Account" open="account" labelIcon={<UserIcon className="h-4 w-4" />} />
                <UserButton.Action label="Organizations" open="organizations" labelIcon={<Building2 className="h-4 w-4" />} />
                <UserButton.Link href="/orders" label="My Orders" labelIcon={<Package className="h-4 w-4" />} />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
              <UserButton.UserProfilePage label="Account" url="account" labelIcon={<UserIcon className="h-4 w-4" />}>
                <AccountPage />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage label="Organizations" url="organizations" labelIcon={<Building2 className="h-4 w-4" />}>
                <OrganizationsPage />
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-t border-border/50 bg-white">
        <div className="container max-w-7xl mx-auto px-4 py-2">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {topCategories === undefined ? (
              // Loading skeleton
              <>
                {new Array(8).fill(null).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="w-20 rounded skeleton flex-shrink-0"
                  />
                ))}
              </>
            ) : (
              // Categories
              (topCategories?.categories ?? []).map((c) => (
                c && (
                  <Button
                    key={c._id}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="px-3 text-sm font-medium hover:bg-accent/20 transition-all text-primary whitespace-nowrap flex-shrink-0"
                  >
                    <Link href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}>
                      {c.name}
                    </Link>
                  </Button>
                )
              ))
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

