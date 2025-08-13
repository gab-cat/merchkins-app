import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HomeHero () {
  return (
    <section className="bg-brand-gradient-subtle border-b">
      <div className="container mx-auto grid gap-6 px-4 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-primary/80 tracking-wide">Custom Merch</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            Bring your brand to life with Merchkins
          </h1>
          <p className="mt-4 text-muted-foreground max-w-prose">
            Design, order, and fulfill on-brand merchandise. Fast lead times,
            premium quality, and scalable fulfillment.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/search">Browse products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account">Start a project</Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="aspect-[16/10] rounded-lg bg-brand-gradient shadow-modern-lg" />
        </div>
      </div>
    </section>
  )
}

