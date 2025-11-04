import React from 'react';

export default function Loading() {
  return (
    <div className="container mx-auto px-3 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-secondary animate-pulse" />
        <div className="h-10 w-40 rounded bg-secondary animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {new Array(12).fill(null).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded bg-secondary animate-pulse" />
        ))}
      </div>
    </div>
  );
}
