import React from 'react'
import Link from 'next/link'

const demo = [
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Drinkware', slug: 'drinkware' },
]

export function FeaturedCategories () {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl font-semibold">Featured categories</h2>
        <Link className="text-sm text-primary" href="/search">View all</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {demo.map((c) => (
          <Link key={c.slug} href={`/c/${c.slug}`} className="group rounded-lg border p-5 transition hover:border-primary">
            <div className="h-28 rounded-md bg-secondary/60 group-hover:bg-secondary" />
            <div className="mt-3 font-medium">{c.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

