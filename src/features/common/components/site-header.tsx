import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteHeader () {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/convex.svg" alt="Merchkins" width={28} height={28} />
          <span className="font-semibold tracking-tight">Merchkins</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account">
            <User />
          </Button>
          <Button variant="default" size="default" aria-label="Cart">
            <ShoppingCart />
            <span className="sr-only">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

