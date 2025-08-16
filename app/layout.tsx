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
    icon: '/favicon.ico',
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
        <ClerkProvider 
          dynamic 
          signInUrl="/sign-in" 
          signUpUrl="/sign-up"
          appearance={{
            variables: {
              colorPrimary: '#1d43d8',
              colorText: '#000000',
              colorTextSecondary: '#6b7280',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#000000',
              colorNeutral: '#f3f4f6',
              colorSuccess: '#10b981',
              colorDanger: '#ef4444',
              colorWarning: '#f59e0b',
              borderRadius: '0.75rem',
              fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
            },
            elements: {
              formButtonPrimary: {
                backgroundColor: '#1d43d8',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#1a3bb8',
                },
              },
              card: {
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              },
              headerTitle: {
                color: '#000000',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              headerSubtitle: {
                color: '#6b7280',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              formFieldLabel: {
                color: '#374151',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              formFieldInput: {
                backgroundColor: '#ffffff',
                color: '#000000',
                borderColor: '#d1d5db',
                '&:focus': {
                  borderColor: '#1d43d8',
                  boxShadow: '0 0 0 1px #1d43d8',
                },
              },
              formFieldInputShowPasswordButton: {
                color: '#6b7280',
              },
              dividerLine: {
                backgroundColor: '#e5e7eb',
              },
              dividerText: {
                color: '#6b7280',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              socialButtonsBlockButton: {
                backgroundColor: '#ffffff',
                color: '#374151',
                borderColor: '#d1d5db',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                },
              },
              socialButtonsBlockButtonText: {
                color: '#374151',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              formResendCodeLink: {
                color: '#1d43d8',
                '&:hover': {
                  color: '#1a3bb8',
                },
              },
              footerActionLink: {
                color: '#1d43d8',
                '&:hover': {
                  color: '#1a3bb8',
                },
              },
              identityPreviewText: {
                color: '#374151',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              identityPreviewEditButton: {
                color: '#1d43d8',
                '&:hover': {
                  color: '#1a3bb8',
                },
              },
              profileSectionTitleText: {
                color: '#111827',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              profileSectionContentText: {
                color: '#374151',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              navbar: {
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
              },
              navbarButton: {
                color: '#374151',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
              },
              userPreviewMainIdentifier: {
                color: '#111827',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              userPreviewSecondaryIdentifier: {
                color: '#6b7280',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              userButtonPopoverCard: {
                backgroundColor: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              userButtonPopoverActionButton: {
                color: '#374151',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
              },
              userButtonPopoverActionButtonText: {
                color: '#374151',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              userButtonPopoverActionButtonDanger: {
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: '#fef2f2',
                },
              },
              userButtonPopoverActionButtonDangerText: {
                color: '#ef4444',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
            },
          }}
        >
          <ConvexClientProvider>
            <div className="min-h-dvh flex flex-col">
              <OrgThemeController />
              <main className="flex-1 bg-white text-black">{children}</main>
            </div>
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
