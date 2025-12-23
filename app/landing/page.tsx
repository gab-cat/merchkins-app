import { LandingHeader } from '@/src/components/landing/LandingHeader';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import { HeroSection } from '@/src/components/landing/HeroSection';
import { AboutSection } from '@/src/components/landing/AboutSection';
import { BentoGrid } from '@/src/components/landing/BentoGrid';
import { StatsSection } from '@/src/components/landing/StatsSection';
import { ProcessSection } from '@/src/components/landing/ProcessSection';
import { ServicesSection } from '@/src/components/landing/ServicesSection';
import Head from 'next/head';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://merchkins.com';

export default function LandingPage() {
  // JSON-LD structured data for SEO
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Merchkins',
    url: baseUrl,
    description: 'Create, manage, and fulfill custom merchandise for your organization.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Merchkins',
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description: 'Custom merch made easy — create, manage, and fulfill merchandise for your organization.',
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@merchkins.com',
      contactType: 'customer service',
    },
  };

  return (
    <>
      {/* Manually set favicon */}
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <BentoGrid />
        <StatsSection />
        <ProcessSection />
        <ServicesSection />
      </main>
      <SiteFooter />
    </>
  );
}
