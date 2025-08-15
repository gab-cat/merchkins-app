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
    <nav className="space-y-0.5 animate-in fade-in slide-in-from-left-2">
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/overview${suffix}`}>
        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
        <span>Overview</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/products${suffix}`}>
        <Package className="h-4 w-4 text-muted-foreground" />
        <span>Products</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/categories${suffix}`}>
        <Shapes className="h-4 w-4 text-muted-foreground" />
        <span>Categories</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/orders${suffix}`}>
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        <span>Orders</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/payments${suffix}`}>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span>Payments</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/announcements${suffix}`}>
        <Megaphone className="h-4 w-4 text-muted-foreground" />
        <span>Announcements</span>
      </Link>
      <Link className="relative flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/tickets${suffix}`}>
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <span>Tickets</span>
        {ticketsCount > 0 && (
          <span className="absolute right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-destructive-foreground">
            {ticketsCount > 99 ? '99+' : ticketsCount}
          </span>
        )}
      </Link>
      <Link className="relative flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/chats${suffix}`}>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span>Chats</span>
        {chatsCount > 0 && (
          <span className="absolute right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-destructive-foreground">
            {chatsCount > 99 ? '99+' : chatsCount}
          </span>
        )}
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/analytics${suffix}`}>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span>Analytics</span>
      </Link>
      <div className="mt-3 border-t pt-2 text-xs uppercase text-muted-foreground">Organization</div>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/org-members${suffix}`}>
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>Members</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href={`/admin/org-settings${suffix}`}>
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span>Settings</span>
      </Link>
    </nav>
  )
}


