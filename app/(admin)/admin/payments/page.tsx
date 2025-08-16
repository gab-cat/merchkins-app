"use client"

import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'
import { useOffsetPagination } from '@/src/hooks/use-pagination'
import { Doc, Id } from '@/convex/_generated/dataModel'

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'GCASH' | 'MAYA' | 'OTHERS'
type PaymentStatus = 'VERIFIED' | 'PENDING' | 'DECLINED' | 'PROCESSING' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'CANCELLED'

type Payment = Doc<"payments">

type PaymentQueryArgs = {
  organizationId?: Id<"organizations">
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  limit?: number
  offset?: number
}

type PaymentQueryResult = {
  payments: Payment[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

function StatusBadge ({ value }: { value: string }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    value === 'DECLINED' || value === 'FAILED' || value === 'CANCELLED' ? 'destructive' :
    value === 'PENDING' || value === 'PROCESSING' || value === 'REFUND_PENDING' ? 'secondary' : 'default'
  return <Badge variant={variant}>{value}</Badge>
}

function formatCurrency (amount: number | undefined, currency?: string) {
  if (amount === undefined) return ''
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

export default function AdminPaymentsPage () {
  const searchParams = useSearchParams()
  const org = searchParams.get('org')

  const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL')
  const [method, setMethod] = useState<PaymentMethod | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    org ? { slug: org } : ('skip' as unknown as { slug: string }),
  )

  const baseArgs = useMemo((): PaymentQueryArgs => ({
    organizationId: org ? organization?._id : undefined,
    paymentStatus: status === 'ALL' ? undefined : status,
    paymentMethod: method === 'ALL' ? undefined : method,
  }), [org, organization?._id, status, method])

  // Skip only while resolving organization when org slug is present
  const shouldSkip = org ? organization === undefined : false

  const { items: payments, isLoading: loading, hasMore, loadMore } = useOffsetPagination<Payment, PaymentQueryArgs>({
    query: api.payments.queries.index.getPayments,
    baseArgs: shouldSkip ? 'skip' : baseArgs,
    limit: 25,
    selectItems: (res: unknown) => {
      const typedRes = res as PaymentQueryResult
      return typedRes.payments || []
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as PaymentQueryResult
      return !!typedRes.hasMore
    },
  })

  const updatePayment = useMutation(api.payments.mutations.index.updatePayment)

  const filtered = useMemo(() => {
    if (!search) return payments
    const q = search.toLowerCase()
    return payments.filter((p: Payment) =>
      [p.referenceNo || '', p.orderInfo?.orderNumber || '', p.userInfo?.email || '', p.userInfo?.firstName || '', p.userInfo?.lastName || '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [payments, search])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Payments</h1>
          <p className="text-sm text-muted-foreground">Review and verify reported payments</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search by ref #, order #, or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | 'ALL')}>
            <option value="ALL">All statuses</option>
            {['VERIFIED','PENDING','DECLINED','PROCESSING','FAILED','REFUND_PENDING','REFUNDED','CANCELLED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | 'ALL')}>
            <option value="ALL">All methods</option>
            {['CASH','BANK_TRANSFER','GCASH','MAYA','OTHERS'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="divide-y">
          {loading
            ? new Array(6).fill(null).map((_, i) => (
                <div key={`s-${i}`} className="px-3 py-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                </div>
              ))
            : filtered.map((p: Payment) => (
                <div key={p._id} className="px-3 py-2 hover:bg-secondary/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">Ref #{p.referenceNo}</div>
                      <div className="mt-0.5 grid grid-cols-2 gap-x-4 text-xs text-muted-foreground sm:grid-cols-3">
                        <span>Order {p.orderInfo?.orderNumber ? `#${p.orderInfo.orderNumber}` : String(p.orderId)}</span>
                        <span className="font-medium text-foreground">{formatCurrency(p.amount, p.currency)}</span>
                        <span className="hidden sm:block">{p.userInfo?.email}</span>
                      </div>
                    </div>
                    <StatusBadge value={p.paymentStatus} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{p.paymentMethod}</span>
                    {(p.paymentStatus === 'PENDING' || p.paymentStatus === 'PROCESSING') && (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await updatePayment({ paymentId: p._id, paymentStatus: 'DECLINED' })
                              showToast({ type: 'success', title: 'Payment declined' })
                            } catch (err: unknown) {
                              const error = err as Error
                              showToast({ type: 'error', title: error?.message || 'Failed to decline' })
                            }
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={async () => {
                            try {
                              await updatePayment({ paymentId: p._id, paymentStatus: 'VERIFIED' })
                              showToast({ type: 'success', title: 'Payment verified' })
                            } catch (err: unknown) {
                              const error = err as Error
                              showToast({ type: 'error', title: error?.message || 'Failed to verify' })
                            }
                          }}
                        >
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>

      {hasMore && !loading && (
        <div className="mt-3 flex justify-center">
          <Button size="sm" variant="ghost" onClick={loadMore}>Load more</Button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No payments found.</div>
      )}
    </div>
  )
}


