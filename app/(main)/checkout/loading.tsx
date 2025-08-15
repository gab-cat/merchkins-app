import React from 'react'

export default function Loading () {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded border p-4 space-y-2">
            <div className="h-4 w-1/2 bg-secondary animate-pulse rounded" />
            {new Array(3).fill(null).map((_, i) => (
              <div key={i} className="h-5 w-full bg-secondary animate-pulse rounded" />
            ))}
          </div>
        </div>
        <div className="rounded border p-4 space-y-2 h-fit">
          <div className="h-4 w-1/2 bg-secondary animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-secondary animate-pulse rounded" />
          <div className="h-10 w-full bg-secondary animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}


