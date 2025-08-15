import React from 'react'

export default function Loading () {
  return (
    <div className="container mx-auto px-3 py-6">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="h-10 rounded bg-secondary animate-pulse" />
        <div className="h-10 rounded bg-secondary animate-pulse" />
        <div className="h-10 rounded bg-secondary animate-pulse" />
        <div className="h-10 rounded bg-secondary animate-pulse" />
        <div className="h-10 rounded bg-secondary animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {new Array(12).fill(null).map((_, i) => (
          <div key={i} className="rounded border overflow-hidden">
            <div className="aspect-[4/3] bg-secondary animate-pulse" />
            <div className="p-4">
              <div className="h-4 w-2/3 rounded bg-secondary animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


