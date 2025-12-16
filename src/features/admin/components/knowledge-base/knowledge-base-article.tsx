'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { DocumentMetadata, categories, getDocumentBySlug } from '@/docs/knowledge-base/index';
import { MarkdownRenderer } from './markdown-renderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KnowledgeBaseArticleProps {
  slug: string;
  content: string;
}

export function KnowledgeBaseArticle({ slug, content }: KnowledgeBaseArticleProps) {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  const doc = getDocumentBySlug(slug);
  if (!doc) {
    return <div>Article not found</div>;
  }

  const category = categories[doc.category];
  const Icon = category.icon;

  // Extract related articles
  const relatedDocs =
    doc.relatedSlugs?.map((relatedSlug) => getDocumentBySlug(relatedSlug)).filter((d): d is DocumentMetadata => d !== undefined) || [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/admin/knowledge-base${suffix}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Knowledge Base
        </Button>
      </Link>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-muted', category.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">{category.label}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{doc.title}</h1>
        <p className="text-lg text-muted-foreground">{doc.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{doc.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Updated {new Date(doc.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose-wrapper rounded-xl border bg-card p-6 md:p-8">
        <MarkdownRenderer content={content} />
      </div>

      {/* Related Articles */}
      {relatedDocs.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Related Articles</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedDocs.map((relatedDoc) => {
              const relatedCategory = categories[relatedDoc.category];
              const RelatedIcon = relatedCategory.icon;
              return (
                <Link
                  key={relatedDoc.slug}
                  href={`/admin/knowledge-base/${relatedDoc.slug}${suffix}`}
                  className="group flex items-start gap-3 p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('p-2 rounded-lg bg-muted shrink-0', relatedCategory.color)}>
                    <RelatedIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {relatedDoc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{relatedDoc.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}



