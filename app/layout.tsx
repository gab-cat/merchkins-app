import type { Metadata } from 'next';
import { Outfit, DM_Sans, Geist, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { OrgThemeController } from '@/src/features/organizations/components/org-theme-controller';
import { LoadingProvider } from '@/src/components/loading-provider';
import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache/provider';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// Admin-specific fonts for professional dashboard UI
const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const genty = localFont({
  src: './fonts/genty.woff',
  variable: '--font-genty',
  display: 'swap',
  weight: '400',
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Merchkins Storefront',
  description: 'Custom merch made easy — shop, manage, and fulfill with Merchkins',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Merchkins — Custom Merch Made Easy',
    description: 'Create, manage, and fulfill custom merchandise for your organization. Join thousands of teams building their brand with Merchkins.',
    url: `${baseUrl}/landing`,
    type: 'website',
    siteName: 'Merchkins',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Merchkins — Custom Merch Made Easy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merchkins — Custom Merch Made Easy',
    description: 'Create, manage, and fulfill custom merchandise for your organization. Join thousands of teams building their brand with Merchkins.',
    site: '@merchkins',
    creator: '@merchkins',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${dmSans.variable} ${geist.variable} ${inter.variable} ${genty.variable} antialiased font-body`}>
        <ClerkProvider
          dynamic
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignOutUrl="https://merchkins.com"
          supportEmail="support@merchkins.com"
          signUpForceRedirectUrl="https://app.merchkins.com"
          signInFallbackRedirectUrl="https://app.merchkins.com"
          signUpFallbackRedirectUrl="https://app.merchkins.com"
          appearance={{
            variables: {
              colorPrimary: '#1d43d8',
              colorBackground: '#FFF',
              borderRadius: '5px',
              fontFamily: 'var(--font-dm-sans)',
            },
            elements: {
              card: '!bg-white !shadow-none !border-0',
              cardBox: '!bg-white !shadow-none !border-0',
              headerTitle: '!text-primary font-bold !font-genty !text-2xl !font-heading',
              formButtonPrimary: '!bg-primary !text-white !rounded-sm !border-0 !shadow-0 relative transition-all text-sm',
              formButtonSecondary: 'bg-white relative border-0 text-sm',
              footerActionText: ' text-md',
              footerActionLink: '!text-primary hover:text-primary hover:brightness-95 font-semibold text-md',
              buttonPrimary: 'bg-primary relative border-0 shadow-0 relative hover:bg-primary/90 transition-all text-sm',
            },
          }}
        >
          <ConvexClientProvider>
            <ConvexQueryCacheProvider>
              <LoadingProvider>
                <div className="min-h-dvh flex flex-col">
                  <OrgThemeController />
                  <main className="flex flex-col bg-white text-black min-h-[80vh] w-full relative">{children}</main>
                </div>
                <Toaster />
              </LoadingProvider>
            </ConvexQueryCacheProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
