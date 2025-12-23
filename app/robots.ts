import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/landing',
        '/search',
        '/apply',
        '/code',
        '/p/', // Product pages
        '/c/', // Category pages
        '/o/', // Organization storefronts
        '/terms',
        '/privacy',
        '/returns',
        '/help',
        '/data-processing',
      ],
      disallow: [
        '/admin/',
        '/super-admin/',
        '/sign-in',
        '/sign-up',
        '/account/',
        '/cart/',
        '/checkout/',
        '/orders/',
        '/chats/',
        '/invite/',
        '/user-profile',
        '/api/',
        '/_next/',
        '/tickets/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
