'use client';

import React from 'react';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { type ExternalToast, toast } from 'sonner';

type ShowToastParams = {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
} & ExternalToast;

// Brand-consistent styling for toasts
const toastStyles = {
  success: {
    icon: () =>
      React.createElement(CheckCircle, {
        className: 'h-5 w-5 text-green-600 dark:text-green-500',
      }),
    defaultDuration: 3000,
  },
  error: {
    icon: () =>
      React.createElement(XCircle, {
        className: 'h-5 w-5 text-red-600 dark:text-red-500',
      }),
    defaultDuration: 4000,
  },
  warning: {
    icon: () =>
      React.createElement(AlertTriangle, {
        className: 'h-5 w-5 text-amber-600 dark:text-amber-500',
      }),
    defaultDuration: 4000,
  },
  info: {
    icon: () =>
      React.createElement(Info, {
        className: 'h-5 w-5 text-blue-600 dark:text-blue-500',
      }),
    defaultDuration: 3500,
  },
} as const;

const brandClassNames = {
  toast:
    'group pointer-events-auto select-none rounded-lg border bg-card text-card-foreground shadow-md ring-1 ring-border border-l-4 data-[type=success]:border-l-green-500 data-[type=error]:border-l-red-500 data-[type=warning]:border-l-amber-500 data-[type=info]:border-l-blue-500 backdrop-blur-sm',
  title: 'text-sm font-semibold',
  description: 'text-xs text-gray-500!',
  closeButton: 'text-muted-foreground hover:text-foreground transition-colors',
  actionButton: 'bg-secondary text-foreground hover:bg-secondary/80 transition-colors',
  cancelButton: 'bg-secondary text-foreground hover:bg-secondary/80 transition-colors',
} as const;

export const showToast = ({ type, title, ...options }: ShowToastParams) => {
  const defaults = toastStyles[type];

  const { description, duration, position, richColors, unstyled, classNames, ...restOptions } = options;

  toast[type](title, {
    description,
    duration: duration ?? defaults.defaultDuration,
    icon: unstyled ? undefined : defaults.icon(),
    position: position ?? 'top-right',
    richColors: richColors ?? false,
    closeButton: true,
    classNames: unstyled ? classNames : { ...brandClassNames, ...classNames },
    ...restOptions,
  });
};

// Promise-based toast utility for action flows (loading → success/error)
export async function promiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((value: T) => string);
    error?: string | ((error: unknown) => string);
  },
  options: Partial<ExternalToast> = {}
): Promise<T> {
  const { position, richColors, unstyled, classNames, ...rest } = options;
  const id = toast.loading(messages.loading, {
    position: position ?? 'top-right',
    richColors: richColors ?? false,
    classNames: unstyled ? classNames : { ...brandClassNames, ...classNames },
    closeButton: true,
    ...rest,
  });
  try {
    const value = await promise;
    const successText = typeof messages.success === 'function' ? messages.success(value) : messages.success;
    toast.success(successText, {
      id,
      position: position ?? 'top-right',
      richColors: richColors ?? false,
      classNames: unstyled ? classNames : { ...brandClassNames, ...classNames },
      closeButton: true,
      ...rest,
    });
    return value;
  } catch (error: unknown) {
    const errorText = typeof messages.error === 'function' ? messages.error(error) : messages.error || 'Something went wrong';
    toast.error(errorText, {
      id,
      position: position ?? 'top-right',
      richColors: richColors ?? false,
      classNames: unstyled ? classNames : { ...brandClassNames, ...classNames },
      closeButton: true,
      ...rest,
    });
    throw error;
  }
}
