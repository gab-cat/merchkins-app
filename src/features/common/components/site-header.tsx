"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Building2, Package, User as UserIcon, MessageSquare, Ticket, ArrowRight } from 'lucide-react'
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

  // Unread counts - only run when authenticated
  const chatsUnread = useQuery(
    api.chats.queries.index.getUnreadCount,
    isSignedIn && organization?._id 
      ? { organizationId: organization._id } 
      : ('skip' as unknown as { organizationId?: Id<"organizations"> })
  )
  const ticketsUnread = useQuery(
    api.tickets.queries.index.getUnreadCount,
    isSignedIn && organization?._id 
      ? { organizationId: organization._id } 
      : ('skip' as unknown as { organizationId?: Id<"organizations">; forAssignee?: boolean })
  )
  const totalChatUnread = (chatsUnread as { count?: number } | undefined)?.count || 0
  const totalTicketUnread = (ticketsUnread as { count?: number } | undefined)?.count || 0
  const totalSupportUnread = totalChatUnread + totalTicketUnread

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
    'sticky top-0 z-40 w-full border-b py-2',
    'supports-[backdrop-filter]:backdrop-blur-sm',
    organization && 'border-primary/40'
  )

  return (
    <header
      className={headerClassName}
      style={{
        backgroundColor: 'var(--header-bg)',
        color: 'var(--header-fg)'
      }}
    >
      {/* Main Header */}
      <div className="container max-w-7xl mx-auto flex h-12 items-center gap-3 px-4">
        {/* Logo */}
        <Link
          href={orgSlug ? `/o/${orgSlug}` : '/'}
          className="flex items-center gap-2 text-lg font-bold tracking-tight hover:scale-105 transition-transform duration-200"
          style={{ color: 'var(--header-fg)' }}
        >
          <span className={cn(
            'text-base md:text-2xl font-bold',
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

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} role="search" className="ml-1 hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 z-10 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-8 pl-9 text-sm pr-10 bg-white/90 backdrop-blur-sm rounded-full border-0 shadow-sm hover:shadow-md focus:shadow-md focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200 placeholder:text-muted-foreground/70"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-200"
            >
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </form>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Support dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-2 h-8 relative hover:scale-105 transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Support</span>
                {totalSupportUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse font-medium">
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
                variant={orgSlug ? "default" : "ghost"}
                aria-label="Cart"
                size="sm"
                className={cn(
                  "gap-2 px-2 h-8 hover:scale-105 transition-all duration-200",
                  orgSlug
                    ? "text-black bg-white hover:bg-gray-100 shadow-sm hover:shadow-md" // Storefront page
                    : "text-white hover:text-white" // Main page
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only">Cart</span>
              </Button>
            </CartSheet>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-1">
              <SignInButton mode="modal">
                <Button
                  variant={"secondary"}
                  size="sm"
                  className="h-8 px-3 text-sm hover:scale-105 transition-all duration-200"
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant={"default"}
                  size="sm"
                  className={cn(
                    "px-3 h-8 text-sm hover:scale-105 transition-all duration-200",
                    orgSlug
                      ? "text-black border-black hover:bg-black hover:text-white shadow-sm hover:shadow-md" // Storefront page
                      : "bg-brand-neon text-black hover:bg-brand-neon/90 shadow-sm hover:shadow-md" // Main page
                  )}
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
                  userButtonAvatarBox: "!size-8 hover:scale-110 transition-transform duration-200",
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
      <div className="bg-white/95 backdrop-blur-sm border-t border-muted-foreground/10">
        <div className="w-full px-4 py-1.5">
          <nav className="flex items-center gap-1 overflow-x-auto max-w-7xl mx-auto scrollbar-hide">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 px-2.5 text-primary font-medium hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 text-sm">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 animate-in fade-in-0 zoom-in-95">
                {(topCategories?.categories ?? []).map((c) => (
                  c && (
                    <DropdownMenuItem key={c._id} asChild>
                      <Link
                        href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}
                        className="w-full text-left text-primary hover:bg-accent/50 transition-colors"
                      >
                        {c.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}

