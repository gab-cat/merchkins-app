'use client';

import { Settings } from 'lucide-react';
import { AccountSettingsForm } from '../components/account-settings-form';

export function AccountSettingsView() {
  return (
    <div className="container mx-auto max-w-3xl px-0 py-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-primary">Account Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage your account information and notification preferences.</p>
        </div>
        <AccountSettingsForm />
      </div>
    </div>
  );
}
