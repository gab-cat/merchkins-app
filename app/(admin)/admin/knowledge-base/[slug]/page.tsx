import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import matter from 'gray-matter';
import { Suspense } from 'react';
import { KnowledgeBaseArticle } from '@/src/features/admin/components/knowledge-base/knowledge-base-article';
import { getDocumentBySlug } from '@/docs/knowledge-base/index';

interface KnowledgeBaseArticlePageProps {
  params: Promise<{ slug: string }>;
}

function getMarkdownContent(slug: string): { content: string; data: Record<string, any> } | null {
  try {
    const filePath = join(process.cwd(), 'docs', 'knowledge-base', `${slug}.md`);
    const fileContents = readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContents);
    return { content, data };
  } catch (error) {
    console.error('KB fetch error:', error);
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
      <div className="h-8 w-full rounded-lg bg-muted animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function KnowledgeBaseArticlePage({ params }: KnowledgeBaseArticlePageProps) {
  const { slug } = await params;
  const doc = getDocumentBySlug(slug);

  if (!doc) {
    notFound();
  }

  const markdownData = getMarkdownContent(slug);
  if (!markdownData) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <KnowledgeBaseArticle slug={slug} content={markdownData.content} />
    </Suspense>
  );
}
