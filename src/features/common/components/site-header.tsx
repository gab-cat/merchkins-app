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
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { CartSheet } from '@/src/features/cart/components/cart-sheet'
import { cn } from '@/lib/utils'

export function SiteHeader () {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const { isSignedIn } = useAuth()
  

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
      <div className="container mx-auto flex h-14 items-center gap-3 px-3 pt-4">
        <Link href={orgSlug ? `/o/${orgSlug}` : '/'} className="flex items-center gap-2 text-3xl" style={{ color: 'var(--header-fg)' }}>
          <span
            className={cn('font-semibold tracking-tight text-lg md:text-4xl', organization?.name ? '' : 'font-genty')}
          >
            {organization?.name ?? 'Merchkins'}
          </span>
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          className="ml-3 hidden flex-1 items-center gap-2 md:flex"
          role="search"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black opacity-60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-9 md:h-10 pl-8 bg-white text-black placeholder:text-black placeholder:opacity-60 text-sm md:text-base hover:bg-white focus:bg-white focus-visible:bg-white"
            />
          </div>
          <Button type="submit" variant="default" size="sm">Search</Button>
        </form>

        <div className="ml-auto flex items-center gap-2" style={{ color: 'var(--header-fg)' }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative gap-2 px-3 text-black" data-testid="support-menu">
                <MessageSquare className="h-4 w-4" />
                {totalSupportUnread > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-destructive-foreground">
                    {totalSupportUnread > 99 ? '99+' : totalSupportUnread}
                  </span>
                )}
                <span className="hidden sm:inline">Support</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild data-testid="support-tickets">
                <Link href={orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'} className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  <span>Tickets</span>
                  {totalTicketUnread > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-destructive-foreground">
                      {totalTicketUnread > 99 ? '99+' : totalTicketUnread}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="support-chat">
                <Link href={orgSlug ? `/o/${orgSlug}/chats` : '/chats'} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                  {totalChatUnread > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-destructive-foreground">
                      {totalChatUnread > 99 ? '99+' : totalChatUnread}
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
          <CartSheet initialCount={totalItems}>
            <Button variant="default" aria-label="Cart" size="sm" className="gap-2 px-3">
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Cart</span>
            </Button>
          </CartSheet>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="px-3">Sign in</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link href="/orders" label="My Orders" labelIcon={<Package className="h-4 w-4" />} />
                <UserButton.Link href={orgSlug ? `/o/${orgSlug}/chats` : '/chats'} label="Chat" labelIcon={<MessageSquare className="h-4 w-4" />} />
                <UserButton.Link href={orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'} label="My Tickets" labelIcon={<Ticket className="h-4 w-4" />} />
                <UserButton.Link href="/organizations" label="My Organizations" labelIcon={<Building2 className="h-4 w-4" />} />
                <UserButton.Link href="/account" label="Account" labelIcon={<UserIcon className="h-4 w-4" />} />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </div>

      <div className="container mx-auto hidden items-center gap-2 px-3 py-2 md:flex">
        <nav className="flex w-full items-center gap-1.5 overflow-x-auto">
          {(topCategories?.categories ?? new Array(6).fill(null)).map((c, i) => (
            c ? (
              <Link
                key={c._id}
                href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100",
                  orgSlug 
                    ? "text-black hover:bg-secondary hover:text-black" // Storefront page
                    : "text-white hover:bg-green-500/20 hover:text-white" // Main page
                )}
              >
                {c.name}
              </Link>
            ) : (
              <span
                key={`skeleton-${i}`}
                className="h-5 w-20 animate-pulse rounded-md bg-secondary"
              />
            )
          ))}
        </nav>
      </div>
    </header>
  )
}

