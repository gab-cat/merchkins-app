"use client"

import { useQuery } from 'convex/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'

interface StatProps {
  title: string
  value: string
}

function Stat ({ title, value }: StatProps) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

export function AdminOverviewContent () {
  const products = useQuery(
    api.products.queries.index.getProducts,
    { limit: 5 }
  )
  const announcements = useQuery(api.announcements.queries.index.getAnnouncements, {
    targetAudience: 'ADMINS',
    limit: 5,
  })
  const loading = products === undefined

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Overview</h1>
      {loading ? (
        <div className="text-sm text-muted-foreground">
          Loading metrics...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat title="Products" value={String(products?.total ?? 0)} />
          <Stat
            title="Total variants (sample)"
            value={String(
              products?.products.reduce(
                (count, p) => count + p.totalVariants,
                0
              ) ?? 0
            )}
          />
          <Stat
            title="Avg rating (sample)"
            value={String(
              Math.round(
                ((products?.products.reduce(
                  (sum, p) => sum + p.rating,
                  0
                ) ?? 0) /
                  Math.max(1, products?.products.length ?? 1)) * 10
              ) / 10
            )}
          />
        </div>
      )}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(announcements?.announcements || []).map((a: Doc<"announcements">) => (
                <div key={a._id} className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                        <span className="truncate max-w-[120px]">{a.category || 'general'}</span>
                      </span>
                      <div className="truncate font-medium" title={a.title}>{a.title}</div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{a.content}</p>
                </div>
              ))}
              {(!announcements || (announcements.announcements || []).length === 0) && (
                <div className="text-sm text-muted-foreground">No announcements yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminOverviewContent


