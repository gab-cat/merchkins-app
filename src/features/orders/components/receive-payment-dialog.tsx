'use client'

import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Id } from '@/convex/_generated/dataModel'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { showToast } from '@/lib/toast'

const schema = z.object({
  amount: z
    .union([z.number(), z.string().regex(/^\d+(?:[.,]\d+)?$/)])
    .transform((v) => (typeof v === 'string' ? Number(v.replace(',', '.')) : v))
    .refine((v) => v > 0, 'Amount must be greater than 0'),
  currency: z.string().min(3).max(8).default('PHP'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS']).default('CASH'),
  referenceNo: z.string().min(3).max(128),
  memo: z.string().optional(),
  status: z.enum(['VERIFIED', 'PENDING']).default('VERIFIED'),
})

type FormValues = z.infer<typeof schema>

export function ReceivePaymentDialog ({
  orderId,
  customerId,
  organizationId,
  defaultAmount,
  defaultCurrency = 'PHP',
  onCreated,
}: {
  orderId: Id<'orders'>
  customerId: Id<'users'>
  organizationId?: Id<'organizations'>
  defaultAmount?: number
  defaultCurrency?: string
  onCreated?: () => void
}) {
  const createPayment = useMutation(api.payments.mutations.index.createPayment)
  const payments = useQuery(api.payments.queries.index.getPayments, { orderId })

  const verifiedTotal = useMemo(() => {
    if (!payments) return 0
    return (payments.payments ?? payments)
      .filter((p: any) => p.paymentStatus === 'VERIFIED')
      .reduce((s: number, p: any) => s + (p.amount || 0), 0)
  }, [payments])

  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount ?? 0,
      currency: defaultCurrency,
      paymentMethod: 'CASH',
      referenceNo: '',
      memo: '',
      status: 'VERIFIED',
    },
  })

  async function handleSubmit (values: FormValues) {
    try {
      await createPayment({
        organizationId,
        orderId,
        userId: customerId,
        amount: Number(values.amount),
        processingFee: 0,
        paymentMethod: values.paymentMethod,
        paymentSite: 'ONSITE',
        paymentStatus: values.status,
        referenceNo: values.referenceNo,
        memo: values.memo || undefined,
        currency: values.currency,
      })
      showToast({ type: 'success', title: 'Payment recorded' })
      setOpen(false)
      onCreated?.()
    } catch (err: any) {
      showToast({ type: 'error', title: err?.message || 'Failed to record payment' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Enter payment details. Verified payments will update the order balance.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-3 text-xs text-muted-foreground">
          Already verified: {verifiedTotal.toFixed(2)}
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Amount</label>
              <Input inputMode="decimal" {...form.register('amount')} />
              {form.formState.errors.amount && (
                <div className="mt-1 text-xs text-destructive">{form.formState.errors.amount.message as string}</div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Currency</label>
              <Input placeholder="PHP" {...form.register('currency')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Payment method</label>
              <Select value={form.watch('paymentMethod')} onValueChange={(v) => form.setValue('paymentMethod', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {['CASH','BANK_TRANSFER','GCASH','MAYA','OTHERS'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Status</label>
              <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Reference #</label>
              <Input placeholder="Receipt / Txn ref" {...form.register('referenceNo')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Memo (optional)</label>
              <Input placeholder="Notes" {...form.register('memo')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReceivePaymentDialog


