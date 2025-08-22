import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HomeHero () {
  return (
    <section className="bg-brand-gradient-subtle border-b">
      <div className="container max-w-7xl mx-auto grid gap-4 px-4 py-10 md:py-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-primary/80 tracking-wide">Custom Merch</p>
          <h1 className="mt-1.5 text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">
            Bring your brand to life with{' '}
            <div className='inline-block bg-primary px-6 py-0 rounded-full mt-2'>
              <span className='font-genty'>
                <span className='text-white'>Merch</span>
                <span className='text-brand-neon'>kins</span>
              </span>
            </div>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-prose">
            Design, order, and fulfill on-brand merchandise. Fast lead times,
            premium quality, and scalable fulfillment.
          </p>
          <div className="mt-4 flex gap-3">
            <Button size="lg" asChild>
              <Link href="/search">Browse products</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/account">Start a project</Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="aspect-[16/9] rounded-md bg-brand-gradient shadow-md" />
        </div>
      </div>
    </section>
  )
}

