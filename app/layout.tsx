import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { SiteHeader } from '@/src/features/common/components/site-header'
import { SiteFooter } from '@/src/features/common/components/site-footer'

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: 'Merchkins Storefront',
  description: 'Custom merch made easy — shop, manage, and fulfill with Merchkins',
  icons: {
    icon: '/convex.svg',
  },
}

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ClerkProvider dynamic signInUrl="/sign-in" signUpUrl="/sign-up">
          <ConvexClientProvider>
            <div className="min-h-dvh flex flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
