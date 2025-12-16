import { Package, DollarSign, MessageSquare, Shield } from 'lucide-react';

export type DocumentCategory = 'operations' | 'finance' | 'communication' | 'administration';

export interface DocumentMetadata {
  slug: string;
  title: string;
  description: string;
  category: DocumentCategory;
  icon: string;
  lastUpdated: string;
  readingTime: number; // in minutes
  relatedSlugs?: string[];
}

export const documents: DocumentMetadata[] = [
  {
    slug: 'refund-system',
    title: 'Refund System & Scenarios',
    description: 'Complete guide to refund workflows, voucher issuance, and payout attribution for refunded orders.',
    category: 'finance',
    icon: 'DollarSign',
    lastUpdated: '2025-12-16',
    readingTime: 15,
    relatedSlugs: ['voucher-system', 'payout-system', 'order-management'],
  },
  {
    slug: 'order-management',
    title: 'Order Management',
    description: 'Understanding order statuses, fulfillment workflows, cancellation policies, and order processing.',
    category: 'operations',
    icon: 'Package',
    lastUpdated: '2025-12-12',
    readingTime: 12,
    relatedSlugs: ['refund-system', 'product-management'],
  },
  {
    slug: 'voucher-system',
    title: 'Voucher & Coupon System',
    description: 'Creating vouchers, validation rules, voucher types, usage tracking, and redemption workflows.',
    category: 'finance',
    icon: 'DollarSign',
    lastUpdated: '2025-12-12',
    readingTime: 10,
    relatedSlugs: ['refund-system', 'order-management'],
  },
  {
    slug: 'payout-system',
    title: 'Payout System',
    description: 'Weekly payout schedules, platform fee calculations, invoice generation, and bank details management.',
    category: 'finance',
    icon: 'DollarSign',
    lastUpdated: '2025-12-16',
    readingTime: 12,
    relatedSlugs: ['refund-system'],
  },
  {
    slug: 'product-management',
    title: 'Product Management',
    description: 'Creating and editing products, managing variants and inventory, stock levels, and category organization.',
    category: 'operations',
    icon: 'Package',
    lastUpdated: '2025-12-12',
    readingTime: 12,
    relatedSlugs: ['order-management'],
  },
  {
    slug: 'permissions-roles',
    title: 'Permissions & Roles',
    description: 'Role hierarchy, permission codes, assigning permissions, and access control management.',
    category: 'administration',
    icon: 'Shield',
    lastUpdated: '2025-12-12',
    readingTime: 8,
    relatedSlugs: [],
  },
  {
    slug: 'ticket-support',
    title: 'Ticket & Support System',
    description: 'Creating tickets, priority levels, response guidelines, and resolution workflows.',
    category: 'communication',
    icon: 'MessageSquare',
    lastUpdated: '2025-12-12',
    readingTime: 8,
    relatedSlugs: [],
  },
  {
    slug: 'announcements',
    title: 'Announcements Management',
    description: 'Creating announcements, targeting and scheduling, analytics tracking, and best practices.',
    category: 'communication',
    icon: 'MessageSquare',
    lastUpdated: '2025-12-12',
    readingTime: 6,
    relatedSlugs: [],
  },
  {
    slug: 'order-batches',
    title: 'Order Batches Management',
    description: 'Creating and managing order batches, automatic assignment, bulk status updates, and batch organization workflows.',
    category: 'operations',
    icon: 'Package',
    lastUpdated: '2025-12-16',
    readingTime: 15,
    relatedSlugs: ['order-management', 'product-management'],
  },
];

export const categories: Record<DocumentCategory, { label: string; icon: typeof Package; color: string }> = {
  operations: {
    label: 'Operations',
    icon: Package,
    color: 'text-blue-500',
  },
  finance: {
    label: 'Finance',
    icon: DollarSign,
    color: 'text-green-500',
  },
  communication: {
    label: 'Communication',
    icon: MessageSquare,
    color: 'text-purple-500',
  },
  administration: {
    label: 'Administration',
    icon: Shield,
    color: 'text-orange-500',
  },
};

export function getDocumentBySlug(slug: string): DocumentMetadata | undefined {
  return documents.find((doc) => doc.slug === slug);
}

export function getDocumentsByCategory(category: DocumentCategory): DocumentMetadata[] {
  return documents.filter((doc) => doc.category === category);
}

export function searchDocuments(query: string): DocumentMetadata[] {
  const lowerQuery = query.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.slug.toLowerCase().includes(lowerQuery)
  );
}
