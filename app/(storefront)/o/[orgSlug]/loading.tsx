import React from 'react';

function BannerSkeleton() {
  return (
    <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse overflow-hidden">
      <div className="px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          {/* Logo skeleton */}
          <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-xl sm:rounded-2xl bg-slate-300 flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            {/* Badge */}
            <div className="h-6 w-24 rounded-full bg-slate-300" />
            {/* Title */}
            <div className="h-8 sm:h-10 w-48 sm:w-64 rounded-lg bg-slate-300" />
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full max-w-md rounded bg-slate-300" />
              <div className="h-4 w-3/4 max-w-sm rounded bg-slate-300" />
            </div>
            {/* Metadata */}
            <div className="flex gap-3">
              <div className="h-5 w-20 rounded bg-slate-300" />
              <div className="h-5 w-24 rounded bg-slate-300" />
            </div>
            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-1">
              <div className="h-9 w-28 rounded-full bg-slate-300" />
              <div className="h-9 w-20 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="container mx-auto px-3 py-6 sm:py-8 md:py-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-200 animate-pulse" />
            <div className="h-7 w-36 sm:w-48 rounded-lg bg-slate-200 animate-pulse" />
          </div>
          <div className="h-4 w-48 sm:w-64 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
      </div>

      {/* Products grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`product-skeleton-${i}`}
            className="rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-6 w-20 rounded-lg bg-slate-200" />
                <div className="h-8 w-8 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="relative py-6 sm:py-8 md:py-10">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-slate-50/80 to-white" />
      <div className="container mx-auto px-3 relative">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-7 w-40 sm:w-52 rounded-lg bg-slate-200 animate-pulse" />
            </div>
            <div className="h-4 w-44 sm:w-56 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`category-skeleton-${i}`}
              className={`rounded-2xl border border-slate-100 bg-white p-4 md:p-5 animate-pulse ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`rounded-xl bg-slate-200 mb-3 ${i === 0 ? 'h-12 w-12' : 'h-10 w-10'}`} />
              <div className={`rounded-lg bg-slate-200 mb-2 ${i === 0 ? 'h-6 w-32' : 'h-5 w-20'}`} />
              <div className={`rounded bg-slate-100 ${i === 0 ? 'h-4 w-24' : 'h-4 w-16'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="container mx-auto px-3 py-6 sm:py-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-slate-200 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-5 w-28 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-3 w-40 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`action-skeleton-${i}`}
            className="rounded-xl border border-slate-100 bg-white p-4 animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="h-8 w-8 rounded-lg bg-slate-200 mb-3" />
            <div className="h-4 w-20 rounded bg-slate-200 mb-1.5" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <BannerSkeleton />
      <ProductsSkeleton />
      <CategoriesSkeleton />
      <QuickActionsSkeleton />
    </div>
  );
}
