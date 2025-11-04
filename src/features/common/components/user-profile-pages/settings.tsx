'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsListProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsList({ children, className }: SettingsListProps) {
  return <div className={cn('border-t border-border bg-card divide-y divide-border/50 rounded-lg overflow-hidden', className)}>{children}</div>;
}

interface SettingsRowProps {
  label: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  alignTop?: boolean;
}

export function SettingsRow({ label, children, action, alignTop = false }: SettingsRowProps) {
  return (
    <div className={cn('px-4 py-3 hover:bg-muted/30 transition-colors', alignTop ? 'items-start' : 'items-center')}>
      <div className="grid grid-cols-[140px_1fr_auto] gap-4 items-center">
        <div className="text-sm font-semibold text-muted-foreground">{label}</div>
        <div className="min-w-0">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

interface SettingsHeaderProps {
  title: string;
}

export function SettingsHeader({ title }: SettingsHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight text-primary">{title}</h2>
    </div>
  );
}

interface SettingsDescriptionProps {
  children: React.ReactNode;
}

export function SettingsDescription({ children }: SettingsDescriptionProps) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function RowValue({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}
