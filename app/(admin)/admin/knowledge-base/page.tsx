'use client';

import { useState, Suspense } from 'react';
import { BookOpen } from 'lucide-react';
import { documents } from '@/docs/knowledge-base/index';
import { KnowledgeBaseList } from '@/src/features/admin/components/knowledge-base/knowledge-base-list';
import { KnowledgeBaseSearch } from '@/src/features/admin/components/knowledge-base/knowledge-base-search';

function KnowledgeBaseContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          </div>
          <p className="text-muted-foreground">Find answers and guides for operating your storefront</p>
        </div>
      </div>

      {/* Search */}
      <KnowledgeBaseSearch value={searchQuery} onChange={setSearchQuery} />

      {/* Document List */}
      <KnowledgeBaseList documents={documents} searchQuery={searchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <KnowledgeBaseContent />
    </Suspense>
  );
}




