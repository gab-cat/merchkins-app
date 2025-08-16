import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import { OrgThemeController } from '@/src/features/organizations/components/org-theme-controller'

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
      <body className={`${poppins.variable} antialiased font-sans`}>
        <ClerkProvider dynamic signInUrl="/sign-in" signUpUrl="/sign-up">
          <ConvexClientProvider>
            <div className="min-h-dvh flex flex-col">
              <OrgThemeController />
              <main className="flex-1 bg-white">{children}</main>
            </div>
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
