"use client"

import React, { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery } from 'convex/react'

export function NewTicketForm () {
  const createTicket = useMutation(api.tickets.mutations.index.createTicket)
  const pathname = usePathname()
  const orgSlug = useMemo(() => {
    if (!pathname) return undefined
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'o' && segments[1]) return segments[1]
    return undefined
  }, [pathname])
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = useMemo(() => title.trim().length >= 3 && description.trim().length >= 5, [title, description])

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await createTicket({ title: title.trim(), description: description.trim(), priority, organizationId: organization?._id })
      window.location.href = orgSlug ? `/o/${orgSlug}/tickets` : '/tickets'
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold">New Ticket</h1>
      {organization?.name && (
        <p className="mb-4 text-sm text-muted-foreground">Filed with {organization.name}</p>
      )}
      <form className="space-y-4 max-w-2xl" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="title">Title</label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief issue summary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="desc">Description</label>
          <textarea id="desc" className="h-40 w-full rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="priority">Priority</label>
          <select id="priority" className="h-9 rounded-md border bg-background px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <Button type="submit" disabled={!canSubmit || submitting}>{submitting ? 'Submitting...' : 'Create ticket'}</Button>
        </div>
      </form>
    </div>
  )
}


