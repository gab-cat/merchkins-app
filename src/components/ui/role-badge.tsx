'use client';

import { Badge } from '@/components/ui/badge';
import { Crown, User, Users, HelpCircle } from 'lucide-react';

type Role = 'ADMIN' | 'STAFF' | 'MEMBER' | string;

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const roleConfig: Record<Role, { icon: typeof Crown; bg: string; text: string; border: string; label: string }> = {
  ADMIN: {
    icon: Crown,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    label: 'Admin',
  },
  STAFF: {
    icon: User,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    label: 'Staff',
  },
  MEMBER: {
    icon: Users,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    label: 'Member',
  },
};

const defaultConfig = {
  icon: HelpCircle,
  bg: 'bg-slate-50',
  text: 'text-slate-600',
  border: 'border-slate-200',
  label: 'Unknown',
};

export function RoleBadge({ role, size = 'sm', showIcon = true }: RoleBadgeProps) {
  const config = roleConfig[role] || { ...defaultConfig, label: role };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <Badge className={`font-semibold rounded-full border shadow-none ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border}`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  );
}

export function OrgTypeBadge({ type, size = 'sm' }: { type: 'PUBLIC' | 'PRIVATE'; size?: 'sm' | 'md' | 'lg' }) {
  const isPublic = type === 'PUBLIC';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <Badge
      className={`font-medium rounded-full border shadow-none ${sizeClasses[size]} ${
        isPublic ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
      }`}
    >
      {isPublic ? '🌐 Public' : '🔒 Private'}
    </Badge>
  );
}
