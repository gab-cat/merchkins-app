import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HomeHero () {
  return (
    <section className="bg-brand-gradient-subtle border-b relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container max-w-7xl mx-auto grid gap-6 px-4 py-8 md:py-10 lg:grid-cols-2 lg:items-center relative">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-primary/90 tracking-wide">Custom Merch</p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Bring your brand to life with{' '}
              <span className='inline-block bg-primary px-4 py-1 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300'>
                <span className='font-genty'>
                  <span className='text-white'>Merch</span>
                  <span className='text-brand-neon'>kins</span>
                </span>
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-prose">
            Design, order, and fulfill on-brand merchandise. Fast lead times,
            premium quality, and scalable fulfillment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" asChild className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
              <Link href="/search">Browse products</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="hover:scale-105 transition-all duration-200 hover:bg-primary hover:text-white border-2">
              <Link href="/account">Start a project</Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:block relative">
          <div className="aspect-[16/9] rounded-xl bg-brand-gradient shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
            <div className="absolute inset-4 border border-white/20 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  )
}

