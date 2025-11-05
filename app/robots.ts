import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/p/', '/c/', '/search', '/o/'],
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
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
