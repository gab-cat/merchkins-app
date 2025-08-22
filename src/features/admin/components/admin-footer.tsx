"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminFooter () {
  const pathname = usePathname()
  const params = useSearchParams()
  const areaLabel = pathname?.startsWith('/super-admin') ? 'Super Admin' : 'Admin'
  const org = params.get('org') ?? undefined
  const withOrg = (href: string) => (org ? `${href}?org=${encodeURIComponent(org)}` : href)

  return (
    <footer data-testid="admin-footer" className="border-t" style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-fg)' }}>
      <div className="container mx-auto grid gap-3 px-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xs uppercase mb-1" style={{ color: 'var(--footer-fg)', opacity: 0.8 }}>{areaLabel}</div>
          <div className={cn('text-sm font-semibold tracking-tight', org ? '' : 'font-genty')}>
            {org ? `Org: ${org}` : (
              <>
                <span className='text-white'>Merch</span>
                <span className='text-brand-neon'>kins</span>
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Resources</h3>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--footer-fg)', opacity: 0.85 }}>
            <li><Link href={withOrg('/admin/overview')}>Overview</Link></li>
            <li><Link href={withOrg('/admin/analytics')}>Analytics</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Organization</h3>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--footer-fg)', opacity: 0.85 }}>
            <li><Link href={withOrg('/admin/org-members')}>Members</Link></li>
            <li><Link href={withOrg('/admin/org-settings')}>Settings</Link></li>
          </ul>
        </div>
        <div className="text-sm" style={{ color: 'var(--footer-fg)', opacity: 0.8 }}>
          <p>&copy; {new Date().getFullYear()} <span className="font-genty"><span className='text-white'>Merch</span><span className='text-brand-neon'>kins</span></span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default AdminFooter


