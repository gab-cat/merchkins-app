"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AdminNav } from '@/src/features/admin/components/admin-nav'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

export function AdminHeader () {
  const pathname = usePathname()
  const params = useSearchParams()
  const [query, setQuery] = useState('')

  const areaLabel = useMemo(() => {
    if (!pathname) return 'Admin'
    if (pathname.startsWith('/super-admin')) return 'Super Admin'
    return 'Admin'
  }, [pathname])

  const orgSlug = params.get('org') ?? undefined

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = query.trim()
    if (q.length === 0) return
    const base = pathname?.startsWith('/super-admin') ? '/super-admin' : '/admin'
    const qp = new URLSearchParams()
    qp.set('q', q)
    if (orgSlug) qp.set('org', orgSlug)
    window.location.href = `${base}?${qp.toString()}`
  }

  return (
    <header
      data-testid="admin-header"
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="relative h-0.5 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/70" />
      <div className="container mx-auto flex h-14 items-center gap-2 px-3">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="px-3 py-2 border-b">
                <div className="text-sm text-muted-foreground">{areaLabel}</div>
                <div className={cn('font-semibold tracking-tight', orgSlug ? '' : 'font-genty')}>
                  {orgSlug ? `Org: ${orgSlug}` : 'Merchkins'}
                </div>
              </div>
              <div className="p-2">
                <AdminNav />
              </div>
            </SheetContent>
          </Sheet>
          <Link href={pathname?.startsWith('/super-admin') ? '/super-admin' : '/admin'} className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight font-genty">
              {areaLabel}
            </span>
          </Link>
        </div>

        <form onSubmit={onSearch} role="search" className="ml-2 hidden flex-1 items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${areaLabel.toLowerCase()}...`}
              aria-label="Search admin"
              className="h-9 pl-7"
            />
          </div>
          <Button type="submit" variant="secondary" className="h-9 px-3">Search</Button>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" className="h-8 px-2 text-sm">Sign in</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader


