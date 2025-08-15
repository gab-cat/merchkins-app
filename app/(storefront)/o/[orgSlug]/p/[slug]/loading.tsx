import React from 'react'

export default function Loading () {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-secondary animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-secondary animate-pulse" />
          <div className="h-5 w-1/3 rounded bg-secondary animate-pulse" />
          <div className="h-24 w-full rounded bg-secondary animate-pulse" />
          <div className="h-10 w-40 rounded bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
  )
}


