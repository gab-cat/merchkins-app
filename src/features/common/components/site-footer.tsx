import React from 'react'
import Link from 'next/link'

export function SiteFooter () {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Company</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Shop</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/c/apparel">Apparel</Link></li>
            <li><Link href="/c/accessories">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/returns">Returns</Link></li>
            <li><Link href="/help">Help Center</Link></li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Merchkins. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

