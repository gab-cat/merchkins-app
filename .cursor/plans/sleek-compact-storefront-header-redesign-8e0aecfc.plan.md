<!-- 8e0aecfc-3fe9-48ab-961d-cdf1c0e42776 7e77d835-aa75-442a-86bc-e6b2e980fdec -->

# Sleek Compact Storefront Header Redesign

## Overview

Redesign the storefront page header to be more compact and sleek by reducing vertical space, overlaying organization information directly on the banner image, tightening spacing throughout, and improving visual hierarchy.

## Files to Modify

### 1. `app/(storefront)/o/[orgSlug]/page.tsx`

**Changes:**

- Reduce banner height from `h-48 sm:h-64 md:h-80 lg:h-96` to `h-32 sm:h-40 md:h-48` (approximately 50% reduction)
- Overlay organization info directly on banner instead of separate overlapping card
- Reduce logo size from `h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32` to `h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24`
- Reduce organization title from `text-3xl sm:text-4xl md:text-5xl` to `text-2xl sm:text-3xl md:text-4xl`
- Tighten spacing: reduce padding from `px-4 sm:px-6 py-6 sm:py-8` to `px-4 sm:px-5 py-4 sm:py-5`
- Make metadata line more compact (single line with separators instead of wrap)
- Reduce negative margin overlap from `-mt-14 sm:-mt-16` to `-mt-8 sm:-mt-10`
- Improve gradient overlay for better text readability on banner
- Position organization card content absolutely over banner with better contrast

### 2. `src/features/common/components/site-header.tsx`

**Changes:**

- Reduce header height from `h-12` to `h-10` for main container
- Tighten logo size from `text-base md:text-2xl` to `text-sm md:text-xl`
- Reduce search bar height from `h-8` to `h-7`
- Reduce categories bar padding from `py-1.5` to `py-1`
- Reduce button sizes from `h-8` to `h-7` where appropriate
- Tighten gap spacing throughout (reduce `gap-3` to `gap-2` where appropriate)
- Improve visual compactness of support dropdown and cart button

## Implementation Details

### Banner Section

- Maximum height: `h-48` (down from `h-96`)
- Add stronger gradient overlay: `bg-gradient-to-b from-black/20 via-black/40 to-black/60`
- Position organization info absolutely within banner with proper contrast

### Organization Card/Overlay

- Use backdrop blur and semi-transparent background for better readability
- Reduce logo size by ~30%
- Tighten typography scale
- Single-line metadata with bullet separators
- Compact CTA buttons (smaller padding)
- Remove excessive white space

### Header Component

- Reduce all vertical spacing by ~15-20%
- Make search bar more compact
- Reduce icon sizes slightly
- Tighten categories navigation

## Visual Hierarchy Improvements

- Organization name: Larger but not overwhelming
- Description: Smaller, subtle
- Metadata: Very compact, single line
- CTAs: Prominent but not oversized
- Logo: Balanced size relative to text

## Responsive Considerations

- Maintain compactness across all breakpoints
- Ensure readability on mobile with proper contrast
- Touch targets remain accessible despite smaller sizes
