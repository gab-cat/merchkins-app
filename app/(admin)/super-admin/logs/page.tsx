"use client"

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Doc, Id } from '@/convex/_generated/dataModel'

type Log = Doc<"logs">

export default function SuperAdminLogsPage () {
  const [search, setSearch] = useState('')
  const [isArchived, setIsArchived] = useState<boolean | undefined>(undefined)

  const logs = useQuery(api.logs.queries.index.getLogs, {
    isArchived,
    limit: 100,
  })

  const archiveLog = useMutation(api.logs.mutations.index.archiveLog)
  const restoreLog = useMutation(api.logs.mutations.index.restoreLog)

  async function handleArchive (logId: Id<"logs">) {
    await archiveLog({ logId })
  }

  async function handleRestore (logId: Id<"logs">) {
    await restoreLog({ logId })
  }

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return logs?.logs || []
    return (logs?.logs || []).filter((l: Log) =>
      (l.reason || '').toLowerCase().includes(term) ||
      (l.resourceType || '').toLowerCase().includes(term) ||
      (l.action || '').toLowerCase().includes(term)
    )
  }, [logs, search])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Search logs" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={isArchived === undefined ? '' : isArchived ? '1' : '0'} onChange={(e) => setIsArchived(e.target.value === '' ? undefined : e.target.value === '1')}>
              <option value="">All</option>
              <option value="0">Active</option>
              <option value="1">Archived</option>
            </select>
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-12 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div className="col-span-4">Message</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-2">Severity</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div>
              {filtered.map((l: Log) => (
                <div key={l._id} className="grid grid-cols-12 items-center px-3 py-2 hover:bg-secondary">
                  <div className="col-span-4 text-sm">{l.reason}</div>
                  <div className="col-span-2 text-xs text-muted-foreground">{l.resourceType}</div>
                  <div className="col-span-2 text-xs">{l.action}</div>
                  <div className="col-span-2 text-xs">{l.severity}</div>
                  <div className="col-span-2 text-right">
                    {l.isArchived ? (
                      <Button size="sm" variant="outline" onClick={() => handleRestore(l._id)}>Restore</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleArchive(l._id)}>Archive</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


