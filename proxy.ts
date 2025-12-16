import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  // Handle subdomain redirects before auth
  const hostname = req.headers.get('host');

  // If going to merchkins.com only, then redirect to landing
  if (hostname && (hostname === 'merchkins.com' || hostname === 'www.merchkins.com')) {
    const newUrl = new URL('/landing', req.url);
    return NextResponse.rewrite(newUrl);
  }

  // Only process subdomains on production domains
  if (hostname && hostname.endsWith('.merchkins.com')) {
    const subdomain = hostname.split('.')[0];

    // Skip if subdomain is app, staging, or starts with preview
    // Only redirect when accessing the root path to avoid redirect loops
    if (subdomain !== 'app' && subdomain !== 'staging' && !subdomain.startsWith('preview') && req.nextUrl.pathname === '/') {
      try {
        // Replace the .cloud at the end to .site
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace('.cloud', '.site');
        if (!convexUrl) {
          console.error('NEXT_PUBLIC_CONVEX_URL not configured');
        } else {
          // Check if organization exists
          const resolverResponse = await fetch(`${convexUrl}/resolve-org?slug=${subdomain}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'force-cache',
          });

          if (resolverResponse.ok) {
            // Organization exists, rewrite to storefront
            console.log('Organization found for subdomain:', subdomain, '- rewriting to /o/' + subdomain);
            const newUrl = new URL(`/o/${subdomain}`, req.url);
            return NextResponse.rewrite(newUrl);
          } else {
            console.log('Organization not found for subdomain:', subdomain, '- status:', resolverResponse.status);
          }
        }
      } catch (error) {
        console.error('Error checking organization:', error);
        // Continue normally if resolver fails
      }
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

const isPublicRoute = createRouteMatcher([
  '/',
  '/c/(.*)',
  '/p/(.*)',
  '/o/(.*)',
  '/invite/(.*)',
  '/search',
  '/cart',
  '/checkout',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/webhooks(.*)',
  '/monitoring(.*)',
  '/landing(.*)',
  '/sitemap.xml',
  '/robots.txt',
]);
