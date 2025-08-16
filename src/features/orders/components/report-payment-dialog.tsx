"use client"

import React, { useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { showToast } from '@/lib/toast'

const schema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1').or(z.string().regex(/^\d+(?:[.,]\d+)?$/, 'Invalid amount')).transform((v) => typeof v === 'string' ? Number(v.replace(',', '.')) : v),
  currency: z.string().min(3).max(8),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS']),
  referenceNo: z.string().min(3).max(128),
  transactionId: z.string().optional(),
  memo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ReportPaymentDialog ({ orderId, defaultAmount, defaultCurrency = 'PHP', onCreated }: {
  orderId: string
  defaultAmount?: number
  defaultCurrency?: string
  onCreated?: () => void
}) {
  const { userId } = useAuth()
  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    userId ? { clerkId: userId } : ('skip' as unknown as { clerkId: string }),
  )
  const createPayment = useMutation(api.payments.mutations.index.createPayment)

  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount ?? 0,
      currency: defaultCurrency,
      paymentMethod: 'BANK_TRANSFER',
      referenceNo: '',
      transactionId: '',
      memo: '',
    },
  })

  const submitting = form.formState.isSubmitting
  const canSubmit = useMemo(() => currentUser && !submitting, [currentUser, submitting])

  async function handleSubmit (values: FormValues) {
    if (!currentUser) return
    try {
      await createPayment({
        orderId: orderId as Id<'orders'>,
        userId: currentUser._id as Id<'users'>,
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod,
        paymentSite: 'OFFSITE',
        referenceNo: values.referenceNo,
        currency: values.currency,
        memo: values.memo || undefined,
        transactionId: values.transactionId || undefined,
      })
      showToast({ type: 'success', title: 'Payment submitted for review' })
      setOpen(false)
      onCreated?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit payment'
      showToast({ type: 'error', title: errorMessage })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Report Payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a payment</DialogTitle>
          <DialogDescription>
            Submit your payment details for this order. An admin will verify it shortly.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Amount</label>
              <Input
                inputMode="decimal"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <div className="mt-1 text-xs text-destructive">{form.formState.errors.amount.message as string}</div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Currency</label>
              <Input
                placeholder="PHP"
                {...form.register('currency')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Payment method</label>
              <Select
                value={form.watch('paymentMethod')}
                onValueChange={(v) => form.setValue('paymentMethod', v as FormValues['paymentMethod'])}
              >
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
              <label className="mb-1 block text-xs text-muted-foreground">Reference #</label>
              <Input placeholder="Bank/Gcash ref no" {...form.register('referenceNo')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Transaction ID (optional)</label>
              <Input placeholder="If available" {...form.register('transactionId')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Memo (optional)</label>
              <Input placeholder="Notes" {...form.register('memo')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? 'Submitting...' : 'Submit payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


