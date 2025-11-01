"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
  LayoutDashboard,
  Package,
  Shapes,
  ShoppingBag,
  CreditCard,
  Megaphone,
  Ticket,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react'

export function AdminNav () {
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org')
  const suffix = orgSlug ? `?org=${orgSlug}` : ''

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const chatUnread = useQuery(
    api.chats.queries.index.getUnreadCount,
    organization?._id ? { organizationId: organization._id } : {}
  )
  const ticketUnread = useQuery(
    api.tickets.queries.index.getUnreadCount,
    organization?._id ? { organizationId: organization._id } : {}
  )
  const chatsCount = chatUnread?.count || 0
  const ticketsCount = ticketUnread?.count || 0

  return (
    <nav className="space-y-1 animate-in fade-in slide-in-from-left-2 p-2">
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/overview${suffix}`}>
        <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Overview</span>
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/products${suffix}`}>
        <Package className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Products</span>
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/categories${suffix}`}>
        <Shapes className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Categories</span>
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/orders${suffix}`}>
        <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Orders</span>
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/payments${suffix}`}>
        <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Payments</span>
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/announcements${suffix}`}>
        <Megaphone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Announcements</span>
      </Link>
      <Link className="relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/tickets${suffix}`}>
        <Ticket className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Tickets</span>
        {ticketsCount > 0 && (
          <span className="absolute right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] leading-none text-white font-medium animate-pulse">
            {ticketsCount > 99 ? '99+' : ticketsCount}
          </span>
        )}
      </Link>
      <Link className="relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/chats${suffix}`}>
        <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Chats</span>
        {chatsCount > 0 && (
          <span className="absolute right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] leading-none text-white font-medium animate-pulse">
            {chatsCount > 99 ? '99+' : chatsCount}
          </span>
        )}
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/analytics${suffix}`}>
        <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Analytics</span>
      </Link>

      <div className="mt-4 mb-2 px-2">
        <div className="h-px bg-border/50" />
        <div className="mt-3 text-xs uppercase text-muted-foreground font-semibold tracking-wide">Organization</div>
      </div>

      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/org-members${suffix}`}>
        <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Members</span>
      </Link>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1 group" href={`/admin/org-settings${suffix}`}>
        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Settings</span>
      </Link>
    </nav>
  )
}


