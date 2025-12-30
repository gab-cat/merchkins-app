'use client';

import React, { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUploadFile } from '@convex-dev/r2/react';
import { compressToWebP } from '@/lib/compress';
import { buildR2PublicUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const INDUSTRIES: Array<string> = [
  'Retail',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Hospitality',
  'Non-profit',
  'Media',
  'Real Estate',
];

const SIZES: Array<string> = ['1-10', '11-50', '51-200', '201-500', '501-1,000', '1,001-5,000', '5,001-10,000', '10,000+'];

const FONT_STACKS: Array<{ label: string; value: string }> = [
  { label: 'Poppins', value: 'Poppins, system-ui, -apple-system, sans-serif' },
  { label: 'Inter', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { label: 'Roboto', value: 'Roboto, system-ui, -apple-system, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, system-ui, -apple-system, sans-serif' },
  { label: 'Lato', value: 'Lato, system-ui, -apple-system, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, system-ui, -apple-system, sans-serif' },
  { label: 'Nunito', value: 'Nunito, system-ui, -apple-system, sans-serif' },
  { label: 'Source Sans 3', value: 'Source Sans 3, system-ui, -apple-system, sans-serif' },
  { label: 'Manrope', value: 'Manrope, system-ui, -apple-system, sans-serif' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif' },
  { label: 'Urbanist', value: 'Urbanist, system-ui, -apple-system, sans-serif' },
  { label: 'Work Sans', value: 'Work Sans, system-ui, -apple-system, sans-serif' },
  { label: 'DM Sans', value: 'DM Sans, system-ui, -apple-system, sans-serif' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
];

interface OrganizationDoc {
  _id: Id<'organizations'>;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  website?: string;
  industry?: string;
  size?: string;
  organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  themeSettings?: {
    primaryColor: string;
    secondaryColor?: string;
    headerBackgroundColor?: string;
    headerForegroundColor?: string;
    headerTitleColor?: string;
    footerBackgroundColor?: string;
    footerForegroundColor?: string;
    mode?: 'light' | 'dark' | 'auto';
    fontFamily?: string;
    borderRadius?: 'none' | 'small' | 'medium' | 'large';
  };
}

export function OrgSettingsForm({ organization }: { organization: OrganizationDoc }) {
  const updateOrganization = useMutation(api.organizations.mutations.index.updateOrganization);
  const router = useRouter();

  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [description, setDescription] = useState(organization.description || '');
  const [logo, setLogo] = useState(organization.logo || '');
  const [bannerImage, setBannerImage] = useState(organization.bannerImage || '');
  const [website, setWebsite] = useState(organization.website || '');
  const [industry, setIndustry] = useState(organization.industry || '');
  const [size, setSize] = useState(organization.size || '');
  const [primaryColor, setPrimaryColor] = useState(organization.themeSettings?.primaryColor || '');
  const [secondaryColor, setSecondaryColor] = useState(organization.themeSettings?.secondaryColor || '');
  const [headerBg, setHeaderBg] = useState(organization.themeSettings?.headerBackgroundColor || '');
  const [headerFg, setHeaderFg] = useState(organization.themeSettings?.headerForegroundColor || '');
  const [headerTitle, setHeaderTitle] = useState(organization.themeSettings?.headerTitleColor || '');
  const [footerBg, setFooterBg] = useState(organization.themeSettings?.footerBackgroundColor || '');
  const [footerFg, setFooterFg] = useState(organization.themeSettings?.footerForegroundColor || '');
  const [mode, setMode] = useState<'light' | 'dark' | 'auto'>(organization.themeSettings?.mode || 'auto');
  const [fontFamily, setFontFamily] = useState(organization.themeSettings?.fontFamily || '');
  const [borderRadius, setBorderRadius] = useState<'none' | 'small' | 'medium' | 'large'>(organization.themeSettings?.borderRadius || 'medium');
  const [organizationType, setOrganizationType] = useState<'PUBLIC' | 'PRIVATE' | 'SECRET'>(organization.organizationType);
  const [saving, setSaving] = useState(false);
  const uploadFile = useUploadFile(api.files.r2);
  const deleteFile = useMutation(api.files.mutations.index.deleteFile);
  const [pendingDeleteKeys, setPendingDeleteKeys] = useState<string[]>([]);

  function scheduleDeleteKey(key?: string) {
    if (!key) return;
    if (!isKey(key)) return;
    setPendingDeleteKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  function toSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const canSubmit = useMemo(() => {
    const s = toSlug(slug);
    return name.trim().length >= 2 && s.length >= 2;
  }, [name, slug]);

  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

  // Use public URL builder for previews
  const logoSrc = buildR2PublicUrl(logo || null) || undefined;
  const bannerSrc = buildR2PublicUrl(bannerImage || null) || undefined;

  async function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const old = logo;
      const compressed = await compressToWebP(file);
      const key = await uploadFile(compressed);
      setLogo(key);
      if (old && old !== key) scheduleDeleteKey(old);
      e.target.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to upload logo');
    }
  }

  async function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const old = bannerImage;
      const compressed = await compressToWebP(file);
      const key = await uploadFile(compressed);
      setBannerImage(key);
      if (old && old !== key) scheduleDeleteKey(old);
      e.target.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to upload banner image');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const normalizedSlug = toSlug(slug);
      await updateOrganization({
        organizationId: organization._id,
        name: name.trim(),
        slug: normalizedSlug,
        description: description.trim() || undefined,
        logo: logo.trim() || undefined,
        bannerImage: bannerImage.trim() || undefined,
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        size: size.trim() || undefined,
        themeSettings: {
          primaryColor: primaryColor.trim() || '#1d43d8',
          secondaryColor: secondaryColor.trim() || undefined,
          headerBackgroundColor: headerBg.trim() || undefined,
          headerForegroundColor: headerFg.trim() || undefined,
          headerTitleColor: headerTitle.trim() || undefined,
          footerBackgroundColor: footerBg.trim() || undefined,
          footerForegroundColor: footerFg.trim() || undefined,
          mode,
          fontFamily: fontFamily.trim() || undefined,
          borderRadius,
        },
        organizationType,
      });
      if (normalizedSlug && normalizedSlug !== organization.slug) {
        try {
          router.replace(`/admin/org-settings?org=${normalizedSlug}`);
        } catch {}
      }
      // After a successful update, delete any keys scheduled for removal
      const uniqueKeys = Array.from(new Set(pendingDeleteKeys)).filter((k) => k !== logo && k !== bannerImage);
      if (uniqueKeys.length > 0) {
        try {
          await Promise.all(uniqueKeys.map((k) => deleteFile({ key: k })));
        } catch (err) {
          console.error('Failed deleting old files', err);
        }
      }
      setPendingDeleteKeys([]);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4 animate-in fade-in slide-in-from-bottom-2" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-name">
            Name
          </label>
          <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-slug">
            Slug
          </label>
          <Input id="org-slug" value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} placeholder="your-org" />
          <p className="mt-1 text-xs text-muted-foreground">Used in URLs like /o/{slug || 'your-org'}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-website">
            Website
          </label>
          <Input id="org-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-industry">
            Industry
          </label>
          <select
            id="org-industry"
            className="h-9 w-full rounded-md border px-3 text-sm"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            {industry && !INDUSTRIES.includes(industry) && <option value={industry}>{industry}</option>}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-size">
            Size
          </label>
          <select id="org-size" className="h-9 w-full rounded-md border  px-3 text-sm" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Select size</option>
            {SIZES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            {size && !SIZES.includes(size) && <option value={size}>{size}</option>}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="org-desc">
          Description
        </label>
        <textarea
          id="org-desc"
          className="h-24 w-full rounded-md border  px-3 py-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Visibility Settings */}
      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Organization Visibility</label>
          <p className="text-xs text-muted-foreground mb-3">Control how users can discover and join your organization</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <label
            className={`flex cursor-pointer flex-col rounded-lg border-2 p-3 transition-all ${
              organizationType === 'PUBLIC' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="orgType"
              value="PUBLIC"
              checked={organizationType === 'PUBLIC'}
              onChange={() => setOrganizationType('PUBLIC')}
              className="sr-only"
            />
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${organizationType === 'PUBLIC' ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
              <span className="font-medium text-sm">Public</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Anyone can find and join directly</p>
          </label>
          <label
            className={`flex cursor-pointer flex-col rounded-lg border-2 p-3 transition-all ${
              organizationType === 'PRIVATE' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="orgType"
              value="PRIVATE"
              checked={organizationType === 'PRIVATE'}
              onChange={() => setOrganizationType('PRIVATE')}
              className="sr-only"
            />
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${organizationType === 'PRIVATE' ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
              <span className="font-medium text-sm">Private</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Searchable, but joining requires approval</p>
          </label>
          <label
            className={`flex cursor-pointer flex-col rounded-lg border-2 p-3 transition-all ${
              organizationType === 'SECRET' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="orgType"
              value="SECRET"
              checked={organizationType === 'SECRET'}
              onChange={() => setOrganizationType('SECRET')}
              className="sr-only"
            />
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${organizationType === 'SECRET' ? 'bg-red-500' : 'bg-muted-foreground/30'}`} />
              <span className="font-medium text-sm">Secret</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Hidden from search, invite links only</p>
          </label>
        </div>
        {organizationType === 'SECRET' && (
          <div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Secret organizations cannot be found via search. Users can only join through invite links.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-logo">
            Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-secondary shadow-modern">
              {logoSrc ? (
                <Image src={logoSrc} alt="Logo preview" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No logo</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex gap-2">
                <Input id="org-logo" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="Key or https://..." />
                <Button type="button" variant="secondary" onClick={() => (document.getElementById('org-logo-file') as HTMLInputElement)?.click()}>
                  Change
                </Button>
              </div>
              <input id="org-logo-file" className="sr-only" type="file" accept="image/*" onChange={handleLogoFileChange} />
              <p className="text-xs text-muted-foreground">Recommended: square PNG/JPG/WebP. We compress to WebP (80%).</p>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="org-banner">
            Banner
          </label>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-44 overflow-hidden rounded-lg border bg-secondary shadow-modern">
              {bannerSrc ? (
                <Image src={bannerSrc} alt="Banner preview" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No banner</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex gap-2">
                <Input id="org-banner" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} placeholder="Key or https://..." />
                <Button type="button" variant="secondary" onClick={() => (document.getElementById('org-banner-file') as HTMLInputElement)?.click()}>
                  Change
                </Button>
              </div>
              <input id="org-banner-file" className="sr-only" type="file" accept="image/*" onChange={handleBannerFileChange} />
              <p className="text-xs text-muted-foreground">Recommended: 1600×600 JPG/PNG/WebP. We compress to WebP (80%).</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="primary">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="primary"
              type="color"
              className="h-9 w-12 cursor-pointer rounded border "
              value={primaryColor || '#1d43d8'}
              onChange={(e) => setPrimaryColor(e.target.value)}
              aria-label="Primary color"
            />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#1d43d8" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="secondary">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="secondary"
              type="color"
              className="h-9 w-12 cursor-pointer rounded border "
              value={secondaryColor || '#1d43d8'}
              onChange={(e) => setSecondaryColor(e.target.value)}
              aria-label="Secondary color"
            />
            <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} placeholder="#1d43d8" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="font">
            Font
          </label>
          <select id="font" className="h-9 w-full rounded-md border  px-3 text-sm" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            {FONT_STACKS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
            {fontFamily && !FONT_STACKS.some((f) => f.value === fontFamily) && <option value={fontFamily}>{fontFamily}</option>}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="mode">
            Mode
          </label>
          <select
            id="mode"
            className="h-9 w-full rounded-md border  px-3 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'auto')}
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="radius">
            Border Radius
          </label>
          <select
            id="radius"
            className="h-9 w-full rounded-md border  px-3 text-sm"
            value={borderRadius}
            onChange={(e) => setBorderRadius(e.target.value as 'none' | 'small' | 'medium' | 'large')}
          >
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="header-bg">
              Header Background
            </label>
            <div className="flex items-center gap-2">
              <input
                id="header-bg"
                type="color"
                className="h-9 w-12 cursor-pointer rounded border "
                value={headerBg || '#ffffff'}
                onChange={(e) => setHeaderBg(e.target.value)}
                aria-label="Header background color"
              />
              <Input value={headerBg} onChange={(e) => setHeaderBg(e.target.value)} placeholder="#ffffff" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="header-fg">
              Header Text
            </label>
            <div className="flex items-center gap-2">
              <input
                id="header-fg"
                type="color"
                className="h-9 w-12 cursor-pointer rounded border "
                value={headerFg || '#111111'}
                onChange={(e) => setHeaderFg(e.target.value)}
                aria-label="Header text color"
              />
              <Input value={headerFg} onChange={(e) => setHeaderFg(e.target.value)} placeholder="#111111" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="header-title">
              Header Title Text
            </label>
            <div className="flex items-center gap-2">
              <input
                id="header-title"
                type="color"
                className="h-9 w-12 cursor-pointer rounded border "
                value={headerTitle || headerFg || '#111111'}
                onChange={(e) => setHeaderTitle(e.target.value)}
                aria-label="Header title color"
              />
              <Input value={headerTitle} onChange={(e) => setHeaderTitle(e.target.value)} placeholder="#111111" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="footer-bg">
              Footer Background
            </label>
            <div className="flex items-center gap-2">
              <input
                id="footer-bg"
                type="color"
                className="h-9 w-12 cursor-pointer rounded border "
                value={footerBg || '#ffffff'}
                onChange={(e) => setFooterBg(e.target.value)}
                aria-label="Footer background color"
              />
              <Input value={footerBg} onChange={(e) => setFooterBg(e.target.value)} placeholder="#ffffff" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="footer-fg">
              Footer Text
            </label>
            <div className="flex items-center gap-2">
              <input
                id="footer-fg"
                type="color"
                className="h-9 w-12 cursor-pointer rounded border "
                value={footerFg || '#111111'}
                onChange={(e) => setFooterFg(e.target.value)}
                aria-label="Footer text color"
              />
              <Input value={footerFg} onChange={(e) => setFooterFg(e.target.value)} placeholder="#111111" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
