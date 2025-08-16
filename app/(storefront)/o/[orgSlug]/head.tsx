import React from 'react'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export default async function Head ({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug })

  // Resolve logo signed URL if key
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/')
  let logo = organization?.logo as string | undefined
  if (logo && isKey(logo)) {
    try {
      logo = await client.query(api.files.queries.index.getFileUrl, { key: logo })
    } catch {}
  }

  const jsonLd = organization
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: organization.name,
        url: `/${['o', organization.slug].join('/')}`,
        logo: logo || '/favicon.ico',
        description: organization.description || undefined,
        sameAs: organization.website ? [organization.website] : undefined,
      }
    : undefined

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  )
}


