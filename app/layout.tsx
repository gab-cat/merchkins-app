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
              colorBackground: '#ffffff',
              colorInputBackground: '#f8fafc',
              colorInputText: '#1e293b',
              colorText: '#1e293b',
              colorTextSecondary: '#64748b',
              colorTextOnPrimaryBackground: '#ffffff',
              colorSuccess: '#10b981',
              colorDanger: '#ef4444',
              colorWarning: '#f59e0b',
              colorNeutral: '#6b7280',
              borderRadius: '0.75rem',
              fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              fontWeight: {
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
              },
              spacingUnit: '4px',
            },
            elements: {
              formButtonPrimary: {
                backgroundColor: '#1d43d8',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '0.75rem',
                border: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              card: {
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              },
              headerTitle: {
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              headerSubtitle: {
                fontSize: '16px',
                color: '#64748b',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              formFieldInput: {
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '14px',
                padding: '12px 16px',
                color: '#1e293b',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              formFieldLabel: {
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              dividerLine: {
                backgroundColor: '#e5e7eb',
              },
              dividerText: {
                fontSize: '14px',
                color: '#6b7280',
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              },
              socialButtonsBlockButton: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                color: '#374151',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              footerActionLink: {
                color: '#1d43d8',
                fontSize: '14px',
                fontWeight: '500',
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
