import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories'
import { PopularProducts } from '@/src/features/products/components/popular-products'
import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Megaphone, ExternalLink, MessageSquare, Ticket } from 'lucide-react'

interface PageParams {
  params: Promise<{ orgSlug: string }>
}

export async function generateMetadata ({ params }: PageParams): Promise<Metadata> {
  const { orgSlug } = await params
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug })
  if (!organization) {
    return {
      title: 'Organization — Merchkins',
      description: 'Organization storefront',
    }
  }
  // Resolve signed URLs if values are R2 keys
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/')
  let ogImage = (organization.bannerImage as string | undefined) || (organization.logo as string | undefined) || '/favicon.ico'
  if (isKey(ogImage)) {
    try {
      ogImage = await client.query(api.files.queries.index.getFileUrl, { key: ogImage as string })
    } catch {}
  }
  return {
    title: `${organization.name} — Merchkins`,
    description: organization.description || 'Organization storefront',
    alternates: { canonical: `/o/${organization.slug}` },
    openGraph: {
      title: `${organization.name} — Merchkins`,
      description: organization.description || 'Organization storefront',
      url: `/o/${organization.slug}`,
      images: ogImage ? [{ url: ogImage as string }] : undefined,
    },
  }
}

export default async function Page ({ params }: PageParams) {
  const { orgSlug } = await params
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug })
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/')
  let bannerUrl = organization?.bannerImage as string | undefined
  if (bannerUrl && isKey(bannerUrl)) {
    try {
      bannerUrl = await client.query(api.files.queries.index.getFileUrl, { key: bannerUrl })
    } catch {}
  }
  let logoUrl = organization?.logo as string | undefined
  if (logoUrl && isKey(logoUrl)) {
    try {
      logoUrl = await client.query(api.files.queries.index.getFileUrl, { key: logoUrl })
    } catch {}
  }

  if (!organization || organization.isDeleted) return notFound()

  const orgPinned = organization._id
    ? await client.query(api.announcements.queries.index.getPinnedAnnouncements, { organizationId: organization._id })
    : []

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Visual banner with fallback */}
      <section aria-label="Organization banner" className="relative">
        {bannerUrl ? (
          <div className="relative h-48 sm:h-64 md:h-80 lg:h-96">
            <Image
              src={bannerUrl as string}
              alt={`${organization.name} banner`}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 to-black/35" />
          </div>
        ) : (
          <div className="h-40 sm:h-48 md:h-56 lg:h-64 bg-brand-gradient-subtle border-b" />
        )}
      </section>

      {/* Hero card with logo, name, description, and CTAs */}
      <section className="container mx-auto -mt-14 sm:-mt-16 px-3">
        <div 
          className="rounded-xl border shadow-xl backdrop-blur supports-[backdrop-filter]:backdrop-blur"
          style={{
            backgroundColor: 'var(--header-bg)',
            color: 'var(--header-fg)'
          }}
        >
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 overflow-hidden rounded-full ring-1 ring-border bg-background">
                <Image
                  src={logoUrl || '/favicon.ico'}
                  alt={`${organization.name} logo`}
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 128px, (min-width: 768px) 112px, 96px"
                  quality={100}
                  priority
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--header-fg)' }}>
                  {organization.name}
                </h1>
                {organization.description && (
                  <p className="mt-1 max-w-2xl" style={{ color: 'var(--header-fg)' }}>
                    {organization.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--header-fg)' }}>
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline"
                      style={{ color: 'var(--header-fg)' }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Visit website</span>
                    </a>
                  )}
                  {organization.industry && (
                    <span>
                      Industry: <span style={{ opacity: 0.8 }}>{organization.industry}</span>
                    </span>
                  )}
                  <span>
                    Members: <span style={{ opacity: 0.8 }}>{organization.memberCount}</span>
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button asChild>
                    <Link href={`/o/${orgSlug}/search`}>
                      Shop now
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/o/${orgSlug}/chats`}>
                      Chat with us
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned announcements */}
      {orgPinned && orgPinned.length > 0 && (
        <section className="container mx-auto px-3 pt-5 sm:pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>Announcements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orgPinned.map((a) => (
                  <div key={a._id} className="rounded-lg border bg-card p-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                          <span className="truncate max-w-[120px]">{a.category || 'general'}</span>
                        </span>
                        <div className="truncate font-medium" title={a.title}>{a.title}</div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{a.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Featured content */}
      <section className="container mx-auto px-3 py-6">
        <FeaturedCategories orgSlug={orgSlug} />
      </section>
      <section className="container mx-auto px-3 py-6">
        <PopularProducts orgSlug={orgSlug} />
      </section>

      {/* Helpful links */}
      <section className="container mx-auto px-3 pb-8">
        <div className="mt-2 flex gap-3 text-sm">
          <Link
            href={`/o/${orgSlug}/chats`}
            className="inline-flex items-center gap-1.5 text-primary underline"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat with us</span>
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href={`/o/${orgSlug}/tickets/new`}
            className="inline-flex items-center gap-1.5 text-primary underline"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Create a ticket</span>
          </Link>
        </div>
      </section>
    </div>
  )
}


