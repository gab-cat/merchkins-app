"use client"

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SuperAdminPermissionsPage () {
  const [category, setCategory] = useState<'' | 'USER_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'ORDER_MANAGEMENT' | 'PAYMENT_MANAGEMENT' | 'ORGANIZATION_MANAGEMENT' | 'SYSTEM_ADMINISTRATION'>('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [requiredRole, setRequiredRole] = useState<'' | 'ADMIN' | 'STAFF' | 'MEMBER'>('')

  const permissions = useQuery(api.permissions.queries.index.getPermissions, {
    category: category || undefined,
    limit: 200,
  })

  const createPermission = useMutation(api.permissions.mutations.index.createPermission)

  const canSubmit = useMemo(() => code.trim().length >= 2 && name.trim().length >= 2 && !!category, [code, name, category])

  async function handleCreate (e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    await createPermission({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      category: category as any,
      defaultSettings: { canCreate: false, canRead: true, canUpdate: false, canDelete: false },
      requiredRole: requiredRole || undefined,
    })
    setCode('')
    setName('')
    setDescription('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as any)}>
              <option value="">All categories</option>
              <option value="USER_MANAGEMENT">User Management</option>
              <option value="PRODUCT_MANAGEMENT">Product Management</option>
              <option value="ORDER_MANAGEMENT">Order Management</option>
              <option value="PAYMENT_MANAGEMENT">Payment Management</option>
              <option value="ORGANIZATION_MANAGEMENT">Organization Management</option>
              <option value="SYSTEM_ADMINISTRATION">System Administration</option>
            </select>
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-12 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div className="col-span-3">Code</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-3">Required Role</div>
            </div>
            <div>
              {permissions?.page?.map((p) => (
                <div key={p._id} className="grid grid-cols-12 px-3 py-2 hover:bg-secondary">
                  <div className="col-span-3 text-xs font-mono">{p.code}</div>
                  <div className="col-span-3 text-sm">{p.name}</div>
                  <div className="col-span-3 text-xs">{p.category}</div>
                  <div className="col-span-3 text-xs">{p.requiredRole || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="perm-code">Code</label>
              <Input id="perm-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VIEW_USERS" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="perm-name">Name</label>
              <Input id="perm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="View Users" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" htmlFor="perm-desc">Description</label>
              <textarea id="perm-desc" className="h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="perm-cat">Category</label>
              <select id="perm-cat" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <option value="">Select</option>
                <option value="USER_MANAGEMENT">User Management</option>
                <option value="PRODUCT_MANAGEMENT">Product Management</option>
                <option value="ORDER_MANAGEMENT">Order Management</option>
                <option value="PAYMENT_MANAGEMENT">Payment Management</option>
                <option value="ORGANIZATION_MANAGEMENT">Organization Management</option>
                <option value="SYSTEM_ADMINISTRATION">System Administration</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="perm-role">Required role</label>
              <select id="perm-role" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={requiredRole} onChange={(e) => setRequiredRole(e.target.value as any)}>
                <option value="">None</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
                <option value="MEMBER">Member</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={!canSubmit}>Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


