import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// TODO: Replace with Convex query hook when client wiring is added.
const demo = Array.from({ length: 6 }).map((_, i) => ({
  id: `demo-${i}`,
  name: `Popular Product ${i + 1}`,
  price: (24 + i * 3).toFixed(2),
}))

export function PopularProducts () {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl font-semibold">Popular products</h2>
        <Link className="text-sm text-primary" href="/search">View all</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {demo.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-[4/3] bg-secondary" />
            <CardHeader>
              <CardTitle className="text-base font-medium leading-tight">
                {p.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="font-semibold">${p.price}</span>
              <Button size="sm">Add to cart</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

