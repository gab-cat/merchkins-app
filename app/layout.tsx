import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { OrgThemeController } from '@/src/features/organizations/components/org-theme-controller';
import { LoadingProvider } from '@/src/components/loading-provider';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Merchkins Storefront',
  description: 'Custom merch made easy — shop, manage, and fulfill with Merchkins',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased font-sans`}>
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
              fontFamily: 'var(--font-poppins)',
            },
            elements: {
              card: '!bg-white !shadow-none !border-0',
              cardBox: '!bg-white !shadow-none !border-0',
              headerTitle: '!text-primary font-bold !font-genty !text-2xl !font-poppins',
              formButtonPrimary: '!bg-primary !text-white !rounded-sm !border-0 !shadow-0 relative transition-all text-sm',
              formButtonSecondary: 'bg-white relative border-0 text-sm',
              footerActionText: ' text-md',
              footerActionLink: '!text-primary hover:text-primary hover:brightness-95 font-semibold text-md',
              buttonPrimary: 'bg-primary relative border-0 shadow-0 relative hover:bg-primary/90 transition-all text-sm',
            },
          }}
        >
          <ConvexClientProvider>
            <LoadingProvider>
              <div className="min-h-dvh flex flex-col">
                <OrgThemeController />
                <main className="flex flex-col bg-white text-black min-h-[80vh] w-full relative">{children}</main>
              </div>
              <Toaster />
            </LoadingProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
