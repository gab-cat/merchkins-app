"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Building2, Package, User as UserIcon, MessageSquare, Ticket } from 'lucide-react'
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
import { ChatsPage, TicketsPage, OrganizationsPage, AccountPage } from '@/src/features/common/components/user-profile-pages'

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
    'sticky top-0 z-40 w-full border-b',
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
      <div className="container max-w-7xl mx-auto flex h-14 items-center gap-4 px-4">
        {/* Logo */}
        <Link 
          href={orgSlug ? `/o/${orgSlug}` : '/'} 
          className="flex items-center gap-2 text-xl font-bold tracking-tight mt-2"
          style={{ color: 'var(--header-fg)' }}
        >
          <span className={cn(
            'text-lg md:text-4xl font-semibold',
            organization?.name ? '' : 'font-genty'
          )}>
            {organization?.name ?? (
              <span className="font-genty">Merchkins</span>
            )}
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} role="search" className="ml-2 hidden flex-1 items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-9 pl-7"
            />
          </div>
          <Button type="submit" variant="secondary" className="h-9 px-3">Search</Button>
        </form>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Support dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 px-3 h-9 relative"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
                {totalSupportUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {totalSupportUnread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild data-testid="support-chats">
                <Link href={orgSlug ? `/o/${orgSlug}/chats` : '/chats'} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chats</span>
                  {totalChatUnread > 0 && (
                    <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {totalChatUnread}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="support-tickets">
                <Link href={orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'} className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  <span>Tickets</span>
                  {totalTicketUnread > 0 && (
                    <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {totalTicketUnread}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="support-new-ticket">
                <Link href={orgSlug ? `/o/${orgSlug}/tickets/new` : '/tickets/new'} className="flex items-center gap-2">
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
                  "gap-2 px-3 h-9",
                  orgSlug 
                    ? "text-black bg-white hover:bg-gray-100" // Storefront page
                    : "text-white hover:text-white" // Main page
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="text-sm font-medium">{totalItems}</span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </CartSheet>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button 
                  variant={"secondary"} 
                  size="sm" 
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button 
                  variant={"default"} 
                  size="sm" 
                  className={cn(
                    "px-4 h-9 text-sm",
                    orgSlug 
                      ? "text-black border-black hover:bg-black hover:text-white" // Storefront page
                      : "bg-brand-neon text-black hover:bg-brand-neon/90" // Main page
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
                  userButtonAvatarBox: "!size-10",
                  userButtonPopoverCard: "bg-blue-100", 
                  userButtonPopoverActionButton: "text-neutral-700",
                }
              }}>
              <UserButton.MenuItems>
                <UserButton.Action label="Account" open="account" labelIcon={<UserIcon className="h-4 w-4" />} />
                <UserButton.Action label="Chat" open="chats" labelIcon={<MessageSquare className="h-4 w-4" />} />
                <UserButton.Action label="Tickets" open="tickets" labelIcon={<Ticket className="h-4 w-4" />} />
                <UserButton.Action label="Organizations" open="organizations" labelIcon={<Building2 className="h-4 w-4" />} />
                <UserButton.Link href="/orders" label="My Orders" labelIcon={<Package className="h-4 w-4" />} />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
              <UserButton.UserProfilePage label="Account" url="account" labelIcon={<UserIcon className="h-4 w-4" />}>
                <AccountPage />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage label="Chat" url="chats" labelIcon={<MessageSquare className="h-4 w-4" />}>
                <ChatsPage />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage label="Tickets" url="tickets" labelIcon={<Ticket className="h-4 w-4" />}>
                <TicketsPage />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage label="Organizations" url="organizations" labelIcon={<Building2 className="h-4 w-4" />}>
                <OrganizationsPage />
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white border-t border-muted-foreground/10">
        <div className="w-full px-4 py-2">
          <nav className="flex items-center gap-1 overflow-x-auto max-w-7xl mx-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-3 text-primary font-medium hover:bg-primary/10 hover:text-primary">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {(topCategories?.categories ?? []).map((c) => (
                  c && (
                    <DropdownMenuItem key={c._id} asChild>
                      <Link
                        href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}
                        className="w-full text-left text-primary"
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

