'use client';

import React from 'react';
import { ManualOrderForm } from '@/src/features/orders/components/manual-order-form';

export default function NewAdminOrderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ManualOrderForm />
    </div>
  );
}
