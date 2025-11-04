import React from 'react';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-2/3 rounded bg-secondary animate-pulse" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {new Array(8).fill(null).map((_, i) => (
          <div key={i} className="h-40 rounded bg-secondary animate-pulse" />
        ))}
      </div>
    </div>
  );
}
