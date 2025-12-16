import { ImageResponse } from 'next/og';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const runtime = 'edge';
export const alt = 'Storefront Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(59, 130, 246, ${alpha})`; // fallback blue
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

// Helper function to determine if color is light or dark
function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return false;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export default async function Image({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;

  // Fetch organization data
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  if (!organization) {
    // Return a default Merchkins OG image if organization not found
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            Merchkins
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 16,
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Storefront Not Found
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Get theme settings with fallbacks
  const primaryColor = organization.themeSettings?.primaryColor || '#3b82f6';
  const textColor = isLightColor(primaryColor) ? '#0f172a' : '#ffffff';
  const subtextColor = isLightColor(primaryColor) ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)';

  // Resolve image URLs
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

  let bannerUrl = organization.bannerImage as string | undefined;
  if (bannerUrl && isKey(bannerUrl)) {
    try {
      bannerUrl = await client.query(api.files.queries.index.getFileUrl, { key: bannerUrl });
    } catch {
      bannerUrl = undefined;
    }
  }

  let logoUrl = organization.logo as string | undefined;
  if (logoUrl && isKey(logoUrl)) {
    try {
      logoUrl = await client.query(api.files.queries.index.getFileUrl, { key: logoUrl });
    } catch {
      logoUrl = undefined;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Layer - Banner or Gradient */}
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(2px) brightness(0.4)',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.9)} 0%, #0f172a 100%)`,
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.85)} 0%, rgba(15, 23, 42, 0.9) 100%)`,
            display: 'flex',
          }}
        />

        {/* Decorative Elements - Abstract Shapes */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${hexToRgba(primaryColor, 0.3)} 0%, transparent 70%)`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${hexToRgba(primaryColor, 0.2)} 0%, transparent 70%)`,
            display: 'flex',
          }}
        />

        {/* Main Content Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 60,
          }}
        >
          {/* Glassmorphism Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 80px',
              borderRadius: 32,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Logo */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 24,
                  objectFit: 'cover',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${hexToRgba(primaryColor, 0.7)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 800,
                  color: textColor,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
              >
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Organization Name */}
            <div
              style={{
                display: 'flex',
                marginTop: 32,
                fontSize: 52,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {organization.name}
            </div>

            {/* Description or Tagline */}
            {organization.description && (
              <div
                style={{
                  display: 'flex',
                  marginTop: 16,
                  fontSize: 22,
                  color: 'rgba(255, 255, 255, 0.75)',
                  textAlign: 'center',
                  maxWidth: 600,
                  lineHeight: 1.4,
                }}
              >
                {organization.description.length > 80 ? organization.description.slice(0, 80) + '...' : organization.description}
              </div>
            )}
          </div>

          {/* Powered by Merchkins Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 40,
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.6)',
              gap: 8,
            }}
          >
            <span>Powered by</span>
            <span
              style={{
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                padding: '4px 12px',
                borderRadius: 6,
              }}
            >
              Merchkins
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
