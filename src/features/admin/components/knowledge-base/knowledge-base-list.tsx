'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, ArrowRight } from 'lucide-react';
import { DocumentMetadata, categories } from '@/docs/knowledge-base/index';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KnowledgeBaseListProps {
  documents: DocumentMetadata[];
  searchQuery: string;
  selectedCategory?: string;
  onCategoryChange?: (category: string | undefined) => void;
}

export function KnowledgeBaseList({ documents, searchQuery, selectedCategory, onCategoryChange }: KnowledgeBaseListProps) {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryList = Object.keys(categories) as Array<keyof typeof categories>;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {onCategoryChange && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All
          </button>
          {categoryList.map((categoryKey) => {
            const category = categories[categoryKey];
            const Icon = category.icon;
            const isSelected = selectedCategory === categoryKey;
            return (
              <button
                key={categoryKey}
                onClick={() => onCategoryChange(isSelected ? undefined : categoryKey)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No articles found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc, index) => {
            const category = categories[doc.category];
            const Icon = category.icon;
            return (
              <motion.div key={doc.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Link
                  href={`/admin/knowledge-base/${doc.slug}${suffix}`}
                  className="group block h-full rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('p-2 rounded-lg bg-muted', category.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">{category.label}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{doc.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{doc.readingTime} min read</span>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}



