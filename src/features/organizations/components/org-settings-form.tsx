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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Save, Upload, Palette, Globe, Layout, MousePointerClick, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [primaryColor, setPrimaryColor] = useState(organization.themeSettings?.primaryColor || '#1d43d8');
  const [secondaryColor, setSecondaryColor] = useState(organization.themeSettings?.secondaryColor || '#1d43d8');
  const [headerBg, setHeaderBg] = useState(organization.themeSettings?.headerBackgroundColor || '#ffffff');
  const [headerFg, setHeaderFg] = useState(organization.themeSettings?.headerForegroundColor || '#111111');
  const [headerTitle, setHeaderTitle] = useState(organization.themeSettings?.headerTitleColor || '#111111');
  const [footerBg, setFooterBg] = useState(organization.themeSettings?.footerBackgroundColor || '#ffffff');
  const [footerFg, setFooterFg] = useState(organization.themeSettings?.footerForegroundColor || '#111111');
  const [mode] = useState<'light' | 'dark' | 'auto'>(organization.themeSettings?.mode || 'auto');
  const [fontFamily, setFontFamily] = useState(organization.themeSettings?.fontFamily || FONT_STACKS[1].value);
  const [borderRadius, setBorderRadius] = useState<'none' | 'small' | 'medium' | 'large'>(organization.themeSettings?.borderRadius || 'medium');
  const [organizationType, setOrganizationType] = useState<'PUBLIC' | 'PRIVATE' | 'SECRET'>(organization.organizationType);
  const [saving, setSaving] = useState(false);
  const uploadFile = useUploadFile(api.files.r2);
  const deleteFile = useMutation(api.files.mutations.index.deleteFile);
  const [pendingDeleteKeys, setPendingDeleteKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('general');

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
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit || saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 border rounded-xl mb-4 flex-wrap">
          <TabsTrigger
            value="general"
            className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
          >
            <Globe className="h-4 w-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
          >
            <Palette className="h-4 w-4" />
            Branding & Theme
          </TabsTrigger>
          <TabsTrigger
            value="visibility"
            className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
          >
            <Layout className="h-4 w-4" />
            Visibility
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 focus-visible:outline-none">
          <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-muted/10 border-b border-border/50 pb-3">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about your organization.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">URL Slug</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">/o/</span>
                  <Input
                    id="org-slug"
                    value={slug}
                    onChange={(e) => setSlug(toSlug(e.target.value))}
                    className="pl-9 h-10 bg-background/50 font-mono"
                    placeholder="your-org"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Public URL: merchkins.com/o/{slug || 'your-org'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-website">Website URL</Label>
                <Input
                  id="org-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="h-10 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="org-industry" className="h-10 bg-background/50">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-size">Company Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger id="org-size" className="h-10 bg-background/50">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="org-desc">Description</Label>
                <Textarea
                  id="org-desc"
                  className="min-h-[120px] bg-background/50 resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your organization..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-muted/10 border-b border-border/50 pb-3">
                  <CardTitle>Logos & Assets</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label>Organization Logo</Label>
                      <div className="group relative h-32 w-32 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all hover:border-primary/50 hover:bg-muted/10">
                        {logoSrc ? (
                          <Image src={logoSrc} alt="Logo" fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Upload className="h-6 w-6" />
                            <span className="text-xs font-medium">Upload Logo</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity flex items-center justify-center group-hover:opacity-100">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => (document.getElementById('org-logo-file') as HTMLInputElement)?.click()}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                      <input id="org-logo-file" className="hidden" type="file" accept="image/*" onChange={handleLogoFileChange} />
                      <p className="text-[11px] text-muted-foreground">Square image, PNG/JPG</p>
                    </div>
                    <div className="space-y-3">
                      <Label>Banner Image</Label>
                      <div className="group relative h-32 w-full overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all hover:border-primary/50 hover:bg-muted/10">
                        {bannerSrc ? (
                          <Image src={bannerSrc} alt="Banner" fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Upload className="h-6 w-6" />
                            <span className="text-xs font-medium">Upload Banner</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity flex items-center justify-center group-hover:opacity-100">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => (document.getElementById('org-banner-file') as HTMLInputElement)?.click()}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                      <input id="org-banner-file" className="hidden" type="file" accept="image/*" onChange={handleBannerFileChange} />
                      <p className="text-[11px] text-muted-foreground">Recommended 1600x400px</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-muted/10 border-b border-border/50 pb-3">
                  <CardTitle>Colors & Typography</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base">Brand Colors</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ColorPicker label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
                      <ColorPicker label="Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Header Colors</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ColorPicker label="Header Background" value={headerBg} onChange={setHeaderBg} />
                      <ColorPicker label="Header Text" value={headerFg} onChange={setHeaderFg} />
                      <ColorPicker label="Header Title" value={headerTitle} onChange={setHeaderTitle} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Footer Colors</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ColorPicker label="Footer Background" value={footerBg} onChange={setFooterBg} />
                      <ColorPicker label="Footer Text" value={footerFg} onChange={setFooterFg} />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="w-full bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_STACKS.map((f) => (
                            <SelectItem key={f.label} value={f.value} style={{ fontFamily: f.value }}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Border Radius</Label>
                      <Select value={borderRadius} onValueChange={(v: any) => setBorderRadius(v)}>
                        <SelectTrigger className="w-full bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (0px)</SelectItem>
                          <SelectItem value="small">Small (6px)</SelectItem>
                          <SelectItem value="medium">Medium (12px)</SelectItem>
                          <SelectItem value="large">Large (16px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-6">
                <Card className="overflow-hidden border-border shadow-lg">
                  <CardHeader className="bg-muted/20 border-b py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4" /> Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ThemePreview
                      config={{
                        name: name || 'Your Organization',
                        logo: logoSrc,
                        primaryColor,
                        secondaryColor,
                        headerBg,
                        headerFg,
                        footerBg,
                        footerFg,
                        fontFamily,
                        borderRadius,
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Visibility Settings */}
        <TabsContent value="visibility" className="focus-visible:outline-none">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Visibility & Access</CardTitle>
              <CardDescription>Control who can see and join your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={organizationType}
                onValueChange={(v: any) => setOrganizationType(v)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Label
                  className={cn(
                    'cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-accent/50',
                    organizationType === 'PUBLIC' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                  )}
                >
                  <RadioGroupItem value="PUBLIC" className="sr-only" />
                  <div className="flex flex-col gap-2">
                    <div className="p-2 w-fit rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold block">Public</span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        Visible to everyone. Anyone can find and join your organization directly.
                      </span>
                    </div>
                  </div>
                </Label>
                <Label
                  className={cn(
                    'cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-accent/50',
                    organizationType === 'PRIVATE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                  )}
                >
                  <RadioGroupItem value="PRIVATE" className="sr-only" />
                  <div className="flex flex-col gap-2">
                    <div className="p-2 w-fit rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold block">Private</span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        Visible in search, but new members must request access or be invited.
                      </span>
                    </div>
                  </div>
                </Label>
                <Label
                  className={cn(
                    'cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-accent/50',
                    organizationType === 'SECRET' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                  )}
                >
                  <RadioGroupItem value="SECRET" className="sr-only" />
                  <div className="flex flex-col gap-2">
                    <div className="p-2 w-fit rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold block">Secret</span>
                      <span className="text-xs text-muted-foreground leading-snug">Hidden from everything. Invite-only access.</span>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground font-normal">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 overflow-hidden rounded-md border shadow-sm transition-transform hover:scale-105">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer p-0 border-0"
          />
        </div>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 font-mono text-xs uppercase" maxLength={7} />
      </div>
    </div>
  );
}

function ThemePreview({ config }: { config: any }) {
  const radiusMap: Record<string, string> = {
    none: '0rem',
    small: '0.375rem',
    medium: '0.75rem',
    large: '1rem',
  };
  const radius = radiusMap[config.borderRadius] || '0.75rem';

  // Simulated style object
  const previewStyle = {
    '--preview-primary': config.primaryColor,
    '--preview-secondary': config.secondaryColor,
    '--preview-header-bg': config.headerBg,
    '--preview-header-fg': config.headerFg,
    '--preview-footer-bg': config.footerBg,
    '--preview-footer-fg': config.footerFg,
    '--preview-font': config.fontFamily.split(',')[0],
    '--preview-radius': radius,
  } as React.CSSProperties;

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#0f0f0f] border-x border-b overflow-hidden text-sm" style={previewStyle}>
      {/* Preview Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ backgroundColor: 'var(--preview-header-bg)', color: 'var(--preview-header-fg)' }}
      >
        <div className="flex items-center gap-2 font-bold">
          <div className="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center overflow-hidden">
            {config.logo ? (
              <Image src={config.logo} width={24} height={24} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-current opacity-20" />
            )}
          </div>
          <span style={{ fontFamily: 'var(--preview-font)' }}>{config.name}</span>
        </div>
        <div className="flex gap-2 text-[10px] opacity-80">
          <div className="h-2 w-12 rounded-full bg-current opacity-20" />
          <div className="h-2 w-8 rounded-full bg-current opacity-20" />
        </div>
      </div>

      {/* Preview Body */}
      <div className="p-4 space-y-4 min-h-[200px]" style={{ fontFamily: 'var(--preview-font)' }}>
        <div
          className="h-32 rounded-lg bg-gray-200 dark:bg-gray-800 w-full overflow-hidden flex items-center justify-center text-muted-foreground/50 relative"
          style={{ borderRadius: 'var(--preview-radius)' }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-(--preview-primary) to-(--preview-secondary) opacity-10" />
          <span className="text-xs">Banner Area</span>
        </div>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-md font-medium text-white text-xs shadow-sm"
            style={{ backgroundColor: 'var(--preview-primary)', borderRadius: 'var(--preview-radius)' }}
          >
            Primary Action
          </button>
          <button
            className="px-4 py-2 rounded-md font-medium border text-xs bg-background"
            style={{ borderColor: 'var(--preview-primary)', color: 'var(--preview-primary)', borderRadius: 'var(--preview-radius)' }}
          >
            Secondary
          </button>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-6 border-t mt-auto" style={{ backgroundColor: 'var(--preview-footer-bg)', color: 'var(--preview-footer-fg)' }}>
        <div className="flex justify-between items-center opacity-80">
          <span className="font-bold text-xs" style={{ fontFamily: 'var(--preview-font)' }}>
            {config.name}
          </span>
          <div className="text-[10px]">&copy; 2024</div>
        </div>
      </div>
    </div>
  );
}
