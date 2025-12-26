'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Ticket,
  ArrowLeft,
  Sparkles,
  Info,
  Percent,
  DollarSign,
  Gift,
  Truck,
  RefreshCw,
  Calendar,
  Users,
  ShoppingBag,
  Tag,
} from 'lucide-react';

// UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  code: z.string().optional(),
  codePrefix: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_ITEM', 'FREE_SHIPPING']),
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

const discountTypes = [
  { value: 'PERCENTAGE', label: 'Percentage Off', icon: Percent, description: 'Discount a percentage of the order total' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount', icon: DollarSign, description: 'Discount a fixed amount from the order' },
  { value: 'FREE_ITEM', label: 'Free Item', icon: Gift, description: 'Give a free item with purchase' },
  { value: 'FREE_SHIPPING', label: 'Free Shipping', icon: Truck, description: 'Waive shipping fees (coming soon)' },
];

export default function AdminCreateVoucherPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  // Convex queries and mutations
  const createVoucher = useMutation(api.vouchers.mutations.index.createVoucher);
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');
  const products = useQuery(api.products.queries.index.getProducts, organization?._id ? { organizationId: organization._id, limit: 100 } : { limit: 100 });
  const categories = useQuery(api.categories.queries.index.getCategories, organization?._id ? { organizationId: organization._id } : 'skip');

  // State
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');
  const [generatedCode, setGeneratedCode] = useState<string>('');

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
      codePrefix: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: undefined,
      maxDiscountAmount: undefined,
      usageLimit: undefined,
      usageLimitPerUser: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
    },
  });

  const discountType = watch('discountType');
  const isActive = watch('isActive');

  // Generate preview code
  const generatePreviewCode = useCallback(() => {
    const prefix = watch('codePrefix') || 'VOUCHER';
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    const cleanPrefix = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setGeneratedCode(`${cleanPrefix}-${randomPart}`);
  }, [watch]);

  // Form submission
  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    try {
      // Validate discount value based on type
      if (values.discountType === 'PERCENTAGE' && (values.discountValue <= 0 || values.discountValue > 100)) {
        setSubmitError('Percentage must be between 1 and 100');
        return;
      }
      if (values.discountType === 'FIXED_AMOUNT' && values.discountValue <= 0) {
        setSubmitError('Fixed amount must be greater than 0');
        return;
      }

      const result = await promiseToast(
        createVoucher({
          organizationId: organization?._id,
          name: values.name,
          description: values.description || undefined,
          code: codeMode === 'manual' && values.code ? values.code : undefined,
          codePrefix: codeMode === 'auto' ? values.codePrefix || undefined : undefined,
          discountType: values.discountType,
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
          loading: 'Creating voucher...',
          success: 'Voucher created successfully!',
          error: (err: unknown) => (err instanceof Error ? err.message : 'Failed to create voucher'),
        }
      );

      if (result?.code) {
        router.push(`/admin/vouchers${suffix}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create voucher';
      setSubmitError(message);
    }
  };

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Create Voucher"
        description="Set up a new discount code for your customers"
        icon={<Ticket className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: `/admin/overview${suffix}` },
          { label: 'Vouchers', href: `/admin/vouchers${suffix}` },
          { label: 'Create', href: `/admin/vouchers/new${suffix}` },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {submitError && <FormErrorBanner errors={[submitError]} />}

        {/* Basic Info */}
        <FormCard title="Basic Information" icon={Sparkles} description="Name and description for this voucher">
          <FormField label="Voucher Name" name="name" required error={errors.name?.message} hint="Internal name for this voucher">
            <Input {...register('name')} placeholder="e.g., Holiday Sale 20% Off" />
          </FormField>

          <FormField label="Description" name="description" error={errors.description?.message} hint="Optional description for reference">
            <Textarea {...register('description')} placeholder="Describe when this voucher should be used..." rows={2} />
          </FormField>
        </FormCard>

        {/* Voucher Code */}
        <FormCard title="Voucher Code" icon={Tag} description="The code customers will enter at checkout">
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={codeMode === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCodeMode('auto')}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto Generate
            </Button>
            <Button
              type="button"
              variant={codeMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCodeMode('manual')}
              className="flex-1"
            >
              Manual Entry
            </Button>
          </div>

          {codeMode === 'auto' ? (
            <FormField
              label="Code Prefix"
              name="codePrefix"
              hint="Optional prefix for the generated code (e.g., SAVE20 → SAVE20-X1Y2Z3)"
            >
              <div className="flex gap-2">
                <Input
                  {...register('codePrefix')}
                  placeholder="e.g., HOLIDAY, SAVE20"
                  className="flex-1"
                  onChange={(e) => {
                    register('codePrefix').onChange(e);
                    setTimeout(generatePreviewCode, 100);
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={generatePreviewCode}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {generatedCode && (
                <p className="text-sm text-muted-foreground mt-2">
                  Preview: <code className="bg-muted px-2 py-0.5 rounded font-mono">{generatedCode}</code>
                </p>
              )}
            </FormField>
          ) : (
            <FormField label="Voucher Code" name="code" required error={errors.code?.message} hint="Enter a unique code (letters, numbers, hyphens only)">
              <Input {...register('code')} placeholder="e.g., SUMMER2024" className="font-mono uppercase" />
            </FormField>
          )}
        </FormCard>

        {/* Discount Configuration */}
        <FormCard title="Discount Configuration" icon={Percent} description="Type and amount of discount">
          <FormField label="Discount Type" name="discountType" required>
            <div className="grid grid-cols-2 gap-3">
              {discountTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = discountType === type.value;
                const isDisabled = type.value === 'FREE_SHIPPING'; // Coming soon

                return (
                  <button
                    key={type.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setValue('discountType', type.value as FormValues['discountType'])}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className={cn('p-2 rounded-md', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={discountType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
              name="discountValue"
              required
              error={errors.discountValue?.message}
            >
              <div className="relative">
                <Input
                  type="number"
                  {...register('discountValue')}
                  placeholder={discountType === 'PERCENTAGE' ? '10' : '100'}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {discountType === 'PERCENTAGE' ? '%' : '₱'}
                </span>
              </div>
            </FormField>

            {discountType === 'PERCENTAGE' && (
              <FormField label="Maximum Discount" name="maxDiscountAmount" hint="Cap the discount amount">
                <div className="relative">
                  <Input type="number" {...register('maxDiscountAmount')} placeholder="500" className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                </div>
              </FormField>
            )}
          </div>

          <FormField label="Minimum Order Amount" name="minOrderAmount" hint="Require a minimum spend to use this voucher">
            <div className="relative">
              <Input type="number" {...register('minOrderAmount')} placeholder="0" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
            </div>
          </FormField>
        </FormCard>

        {/* Usage Limits */}
        <FormCard title="Usage Limits" icon={Users} description="Control how many times this voucher can be used">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Usage Limit" name="usageLimit" hint="Leave empty for unlimited">
              <Input type="number" {...register('usageLimit')} placeholder="Unlimited" min={1} />
            </FormField>

            <FormField label="Per User Limit" name="usageLimitPerUser" hint="How many times each user can use it">
              <Input type="number" {...register('usageLimitPerUser')} placeholder="1" min={1} />
            </FormField>
          </div>
        </FormCard>

        {/* Validity Period */}
        <FormCard title="Validity Period" icon={Calendar} description="When this voucher can be used">
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
                  {isActive ? 'Voucher can be used by customers' : 'Voucher is disabled and cannot be used'}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Voucher'}
          </Button>
        </FormActions>
      </form>
    </div>
  );
}
