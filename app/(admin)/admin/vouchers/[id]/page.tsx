'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  Ticket,
  ArrowLeft,
  Sparkles,
  Info,
  Percent,
  DollarSign,
  Gift,
  Truck,
  Calendar,
  Users,
  Copy,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

// UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Admin Components
import { PageHeader } from '@/src/components/admin/page-header';
import { FormCard, FormField, FormActions, FormErrorBanner } from '@/src/components/admin/form-components';

// Utils
import { showToast, promiseToast } from '@/lib/toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Schema
const voucherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  discountValue: z.coerce.number().min(0, 'Discount value must be positive'),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(0).optional(),
  usageLimitPerUser: z.coerce.number().min(1).default(1),
  validFrom: z.string(),
  validUntil: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof voucherSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDiscountTypeIcon(type: string) {
  switch (type) {
    case 'PERCENTAGE':
      return <Percent className="h-4 w-4" />;
    case 'FIXED_AMOUNT':
      return <DollarSign className="h-4 w-4" />;
    case 'FREE_ITEM':
      return <Gift className="h-4 w-4" />;
    case 'FREE_SHIPPING':
      return <Truck className="h-4 w-4" />;
    default:
      return <Ticket className="h-4 w-4" />;
  }
}

function getDiscountTypeLabel(type: string) {
  switch (type) {
    case 'PERCENTAGE':
      return 'Percentage Off';
    case 'FIXED_AMOUNT':
      return 'Fixed Amount';
    case 'FREE_ITEM':
      return 'Free Item';
    case 'FREE_SHIPPING':
      return 'Free Shipping';
    default:
      return type;
  }
}

export default function AdminEditVoucherPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const voucherId = params.id as string;
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  // Convex queries and mutations
  const voucher = useQuery(api.vouchers.queries.index.getVoucherById, { voucherId: voucherId as Id<'vouchers'> });
  const updateVoucher = useMutation(api.vouchers.mutations.index.updateVoucher);
  const deleteVoucher = useMutation(api.vouchers.mutations.index.deleteVoucher);

  // State
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      name: '',
      description: '',
      discountValue: 0,
      minOrderAmount: undefined,
      maxDiscountAmount: undefined,
      usageLimit: undefined,
      usageLimitPerUser: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  // Populate form when voucher data loads
  useEffect(() => {
    if (voucher) {
      reset({
        name: voucher.name,
        description: voucher.description || '',
        discountValue: voucher.discountValue,
        minOrderAmount: voucher.minOrderAmount || undefined,
        maxDiscountAmount: voucher.maxDiscountAmount || undefined,
        usageLimit: voucher.usageLimit || undefined,
        usageLimitPerUser: voucher.usageLimitPerUser || 1,
        validFrom: new Date(voucher.validFrom).toISOString().split('T')[0],
        validUntil: voucher.validUntil ? new Date(voucher.validUntil).toISOString().split('T')[0] : '',
        isActive: voucher.isActive,
      });
    }
  }, [voucher, reset]);

  const copyCode = () => {
    if (voucher) {
      navigator.clipboard.writeText(voucher.code);
      showToast({ type: 'success', title: 'Voucher code copied!' });
    }
  };

  // Form submission
  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    try {
      // Validate discount value based on type
      if (voucher?.discountType === 'PERCENTAGE' && (values.discountValue <= 0 || values.discountValue > 100)) {
        setSubmitError('Percentage must be between 1 and 100');
        return;
      }
      if (voucher?.discountType === 'FIXED_AMOUNT' && values.discountValue <= 0) {
        setSubmitError('Fixed amount must be greater than 0');
        return;
      }

      await promiseToast(
        updateVoucher({
          voucherId: voucherId as Id<'vouchers'>,
          name: values.name,
          description: values.description || undefined,
          discountValue: values.discountValue,
          minOrderAmount: values.minOrderAmount || undefined,
          maxDiscountAmount: values.maxDiscountAmount || undefined,
          usageLimit: values.usageLimit || undefined,
          usageLimitPerUser: values.usageLimitPerUser || 1,
          validFrom: new Date(values.validFrom).getTime(),
          validUntil: values.validUntil ? new Date(values.validUntil).getTime() : undefined,
          isActive: values.isActive,
        }),
        {
          loading: 'Updating voucher...',
          success: 'Voucher updated successfully!',
          error: (err: unknown) => (err instanceof Error ? err.message : 'Failed to update voucher'),
        }
      );

      router.push(`/admin/vouchers${suffix}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update voucher';
      setSubmitError(message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this voucher? This action cannot be undone.')) {
      return;
    }

    try {
      await promiseToast(deleteVoucher({ voucherId: voucherId as Id<'vouchers'> }), {
        loading: 'Deleting voucher...',
        success: 'Voucher deleted',
        error: () => 'Failed to delete voucher',
      });
      router.push(`/admin/vouchers${suffix}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (voucher === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (voucher === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Voucher not found</h2>
        <p className="text-muted-foreground mb-4">This voucher may have been deleted.</p>
        <Link href={`/admin/vouchers${suffix}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Edit Voucher"
        description={`Editing voucher: ${voucher.code}`}
        icon={<Ticket className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: `/admin/overview${suffix}` },
          { label: 'Vouchers', href: `/admin/vouchers${suffix}` },
          { label: voucher.name, href: `/admin/vouchers/${voucherId}${suffix}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          {submitError && <FormErrorBanner errors={[submitError]} />}

          {/* Voucher Code (Read-only) */}
          <FormCard title="Voucher Code" icon={Ticket} description="The code cannot be changed after creation">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <code className="text-lg font-mono font-bold text-primary">{voucher.code}</code>
              <Button type="button" variant="ghost" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {getDiscountTypeIcon(voucher.discountType)}
                <span className="ml-1">{getDiscountTypeLabel(voucher.discountType)}</span>
              </Badge>
            </div>
          </FormCard>

          {/* Basic Info */}
          <FormCard title="Basic Information" icon={Sparkles}>
            <FormField label="Voucher Name" name="name" required error={errors.name?.message}>
              <Input {...register('name')} placeholder="e.g., Holiday Sale 20% Off" />
            </FormField>

            <FormField label="Description" name="description" error={errors.description?.message}>
              <Textarea {...register('description')} placeholder="Describe when this voucher should be used..." rows={2} />
            </FormField>
          </FormCard>

          {/* Discount Configuration */}
          <FormCard title="Discount Configuration" icon={Percent}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={voucher.discountType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
                name="discountValue"
                required
                error={errors.discountValue?.message}
              >
                <div className="relative">
                  <Input
                    type="number"
                    {...register('discountValue')}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {voucher.discountType === 'PERCENTAGE' ? '%' : '₱'}
                  </span>
                </div>
              </FormField>

              {voucher.discountType === 'PERCENTAGE' && (
                <FormField label="Maximum Discount" name="maxDiscountAmount" hint="Cap the discount amount">
                  <div className="relative">
                    <Input type="number" {...register('maxDiscountAmount')} placeholder="500" className="pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                  </div>
                </FormField>
              )}
            </div>

            <FormField label="Minimum Order Amount" name="minOrderAmount" hint="Require a minimum spend">
              <div className="relative">
                <Input type="number" {...register('minOrderAmount')} placeholder="0" className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
              </div>
            </FormField>
          </FormCard>

          {/* Usage Limits */}
          <FormCard title="Usage Limits" icon={Users}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Total Usage Limit" name="usageLimit" hint="Leave empty for unlimited">
                <Input type="number" {...register('usageLimit')} placeholder="Unlimited" min={1} />
              </FormField>

              <FormField label="Per User Limit" name="usageLimitPerUser">
                <Input type="number" {...register('usageLimitPerUser')} placeholder="1" min={1} />
              </FormField>
            </div>
          </FormCard>

          {/* Validity Period */}
          <FormCard title="Validity Period" icon={Calendar}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" name="validFrom" required error={errors.validFrom?.message}>
                <Input type="date" {...register('validFrom')} />
              </FormField>

              <FormField label="End Date" name="validUntil" hint="Leave empty for no expiration">
                <Input type="date" {...register('validUntil')} />
              </FormField>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-md', isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500')}>
                  {isActive ? <Sparkles className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{isActive ? 'Active' : 'Inactive'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? 'Voucher can be used by customers' : 'Voucher is disabled'}
                  </p>
                </div>
              </div>
              <Switch checked={isActive} onCheckedChange={(checked) => setValue('isActive', checked)} />
            </div>
          </FormCard>

          {/* Actions */}
          <FormActions>
            <Link href={`/admin/vouchers${suffix}`}>
              <Button type="button" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </FormActions>
        </form>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          <FormCard title="Usage Statistics" icon={BarChart3}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Uses</span>
                <span className="text-lg font-bold">
                  {voucher.usedCount}
                  {voucher.usageLimit && <span className="text-muted-foreground font-normal"> / {voucher.usageLimit}</span>}
                </span>
              </div>

              {voucher.stats && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unique Users</span>
                    <span className="text-lg font-bold">{voucher.stats.uniqueUsers}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Discount Given</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(voucher.stats.totalDiscountGiven)}</span>
                  </div>
                </>
              )}

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Created on {formatDate(voucher.createdAt)}
                </p>
              </div>
            </div>
          </FormCard>

          {voucher.stats?.recentUsages && voucher.stats.recentUsages.length > 0 && (
            <FormCard title="Recent Uses" icon={Users}>
              <div className="space-y-3">
                {voucher.stats.recentUsages.map((usage, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{usage.userInfo.email}</span>
                    <span className="text-primary font-medium">{formatCurrency(usage.discountAmount)}</span>
                  </div>
                ))}
              </div>
            </FormCard>
          )}
        </div>
      </div>
    </div>
  );
}
