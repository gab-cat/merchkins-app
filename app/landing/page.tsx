import { LandingHeader } from '@/src/components/landing/LandingHeader';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import { HeroSection } from '@/src/components/landing/HeroSection';
import { AboutSection } from '@/src/components/landing/AboutSection';
import { BentoGrid } from '@/src/components/landing/BentoGrid';
import { StatsSection } from '@/src/components/landing/StatsSection';
import { ProcessSection } from '@/src/components/landing/ProcessSection';
import { ServicesSection } from '@/src/components/landing/ServicesSection';
import Head from 'next/head';
import { BUSINESS_NAME, BUSINESS_DESCRIPTION } from '@/src/constants/business-info';

// Always use merchkins.com for landing page, regardless of access domain
const LANDING_BASE_URL = 'https://merchkins.com';

export default function LandingPage() {
  // JSON-LD structured data for SEO
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_NAME,
    url: LANDING_BASE_URL,
    description: BUSINESS_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${LANDING_BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_NAME,
    url: LANDING_BASE_URL,
    logo: `${LANDING_BASE_URL}/favicon.ico`,
    description: BUSINESS_DESCRIPTION,
    sameAs: ['https://www.facebook.com/merchkins', 'https://www.linkedin.com/company/merchkins/'],
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
