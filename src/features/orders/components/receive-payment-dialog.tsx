'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { showToast } from '@/lib/toast'
import { useMemo, useState } from 'react'
import { Doc, Id } from '@/convex/_generated/dataModel'

type Payment = Doc<'payments'>

const schema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS']),
  referenceNo: z.string().optional(),
  memo: z.string().optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'FAILED']),
})

type FormValues = z.infer<typeof schema>

interface ReceivePaymentDialogProps {
  orderId: Id<'orders'>
  customerId: Id<'users'>
  organizationId: Id<'organizations'>
  defaultAmount?: number
  defaultCurrency?: string
  onCreated?: () => void
}

export function ReceivePaymentDialog ({
  orderId,
  customerId,
  organizationId,
  defaultAmount,
  defaultCurrency = 'PHP',
  onCreated,
}: ReceivePaymentDialogProps) {
  const createPayment = useMutation(api.payments.mutations.index.createPayment)
  const payments = useQuery(api.payments.queries.index.getPayments, { orderId })

  const verifiedTotal = useMemo(() => {
    if (!payments) return 0
    return (payments.payments ?? payments)
      .filter((p: Payment) => p.paymentStatus === 'VERIFIED')
      .reduce((s: number, p: Payment) => s + (p.amount || 0), 0)
  }, [payments])

  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: String(defaultAmount ?? 0),
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
        referenceNo: values.referenceNo || 'CASH_PAYMENT',
        memo: values.memo || undefined,
        currency: values.currency,
      })
      showToast({ type: 'success', title: 'Payment recorded' })
      setOpen(false)
      onCreated?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment'
      showToast({ type: 'error', title: errorMessage })
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
              <Select value={form.watch('paymentMethod')} onValueChange={(v) => form.setValue('paymentMethod', v as FormValues['paymentMethod'])}>
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
              <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as FormValues['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['PENDING','VERIFIED','FAILED'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Reference number</label>
            <Input placeholder="Optional" {...form.register('referenceNo')} />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Memo</label>
            <Input placeholder="Optional notes" {...form.register('memo')} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Recording...' : 'Record payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReceivePaymentDialog


