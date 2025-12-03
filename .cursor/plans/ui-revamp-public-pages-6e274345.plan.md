<!-- 6e274345-3a40-41e3-8a1b-a72253dedd7f 916ecec2-0935-46fe-a352-6ee8bf85e5a2 -->
# UI Revamp Plan: Public-Facing Pages

## Overview

Transform the platform and storefront pages from blocky card-based layouts to engaging, modern interfaces using ReactBits and Aceternity UI components, while maintaining the current theme colors (#1d43d8 primary, #adfc04 neon) and keeping Genty font exclusively for the logo.

## Phase 1: Setup and Dependencies

### 1.1 Install Required Libraries

- Install ReactBits components library (via npm/github)
- Install Aceternity UI CLI and components
- Verify Framer Motion is properly configured (already installed)

### 1.2 Add New Fonts

- Add distinctive heading font: **Outfit** or **Sora** (modern, geometric)
- Add body font: **DM Sans** or **Inter** (clean, readable)
- Update `app/layout.tsx` to load new fonts via Next.js font optimization
- Update `app/globals.css` with font variables
- Ensure Genty remains only for logo usage

## Phase 2: Component Library Integration

### 2.1 Create Component Wrapper Directory

- Create `src/components/ui/reactbits/` for ReactBits components
- Create `src/components/ui/aceternity/` for Aceternity UI components
- Set up utility functions for component customization

### 2.2 Integrate Key Components

From **Aceternity UI**:

- Bento Grid (for product/category layouts)
- Animated Tooltip
- Background Beams
- Border Beam
- Card Hover Effect
- Text Generate Effect
- Typewriter Effect
- 3D Card Effect

From **ReactBits**:

- Animated Text components
- Gradient backgrounds
- Interactive hover effects
- Scroll animations
- Parallax effects

## Phase 3: Homepage Revamp (`app/(main)/page.tsx`)

### 3.1 Hero Section Enhancement

- Replace current `HomeHero` with Aceternity UI hero components
- Add animated text effects (Typewriter or Text Generate)
- Implement gradient backgrounds with animated beams
- Add 3D card effects for CTA buttons
- Use new heading font for hero text

### 3.2 Product Grid Transformation

- Replace blocky `PopularProducts` grid with Bento Grid layout
- Add hover effects and animations to product cards
- Implement border beam effects on cards
- Add staggered scroll animations
- Create more dynamic card layouts (varying sizes, overlays)

### 3.3 Category Display Enhancement

- Transform `FeaturedCategories` with animated badges/chips
- Add gradient backgrounds and hover effects
- Implement interactive hover states with ReactBits animations
- Use border beam effects for category cards

### 3.4 Organization Cards Redesign

- Replace `PopularOrganizations` cards with 3D card effects
- Add animated backgrounds and overlays
- Implement card hover effects from Aceternity UI
- Create more engaging visual hierarchy

## Phase 4: Storefront Pages Revamp (`app/(storefront)/o/[orgSlug]/page.tsx`)

### 4.1 Banner Enhancement

- Enhance `AnimatedBanner` with gradient overlays
- Add animated background beams
- Implement border beam effects
- Add text animations for organization name

### 4.2 Product and Category Sections

- Apply same improvements as homepage
- Ensure organization theming works with new components
- Maintain responsive design

## Phase 5: Supporting Components

### 5.1 Product Card Redesign (`src/features/products/components/product-card.tsx`)

- Replace blocky card with Aceternity UI card hover effects
- Add 3D transform effects on hover
- Implement border beam animations
- Add gradient overlays
- Enhance image presentation with parallax effects

### 5.2 Category Cards (`src/features/categories/components/featured-categories.tsx`)

- Add animated backgrounds
- Implement interactive hover states
- Use ReactBits text animations

## Phase 6: Typography and Spacing

### 6.1 Typography System

- Define heading hierarchy with new fonts
- Update all heading components to use new heading font
- Ensure body text uses new body font
- Maintain Genty only for logo/branding

### 6.2 Spacing and Layout

- Reduce blocky appearance with:
- More generous spacing
- Rounded corners (increase border radius)
- Gradient overlays instead of solid backgrounds
- Asymmetric layouts where appropriate
- Better visual flow

## Phase 7: Animations and Micro-interactions

### 7.1 Page Load Animations

- Implement staggered fade-in animations
- Add scroll-triggered animations
- Create smooth transitions between sections

### 7.2 Interactive Elements

- Add hover effects to all interactive elements
- Implement micro-animations for buttons
- Add loading states with animated skeletons
- Create smooth page transitions

## Phase 8: Color and Theme Integration

### 8.1 Maintain Theme Colors

- Ensure #1d43d8 primary color is used consistently
- Use #adfc04 neon for accents and highlights
- Create gradient variations using theme colors
- Add subtle color transitions

### 8.2 Background Enhancements

- Replace solid backgrounds with gradients
- Add animated background effects (beams, particles)
- Implement glass morphism effects where appropriate

## Phase 9: Responsive Design

### 9.1 Mobile Optimization

- Ensure all new components are mobile-responsive
- Test animations on mobile devices
- Optimize performance for mobile
- Maintain touch-friendly interactions

## Phase 10: Testing and Refinement

### 10.1 Visual Testing

- Test all pages across different screen sizes
- Verify animations perform smoothly
- Check color contrast and accessibility
- Ensure fonts load correctly

### 10.2 Performance Optimization

- Optimize animation performance
- Lazy load heavy components
- Ensure fast page loads
- Test with slow connections

## Files to Modify

### Core Files

- `app/layout.tsx` - Add new fonts
- `app/globals.css` - Update font variables and add new styles
- `package.json` - Add ReactBits and Aceternity UI dependencies

### Component Files

- `src/features/products/components/home-hero.tsx` - Complete redesign
- `src/features/products/components/popular-products.tsx` - Grid transformation
- `src/features/products/components/product-card.tsx` - Card redesign
- `src/features/categories/components/featured-categories.tsx` - Category display enhancement
- `src/features/organizations/components/popular-organizations.tsx` - Card redesign
- `src/components/animated-banner.tsx` - Banner enhancement
- `app/(main)/page.tsx` - Layout updates
- `app/(storefront)/o/[orgSlug]/page.tsx` - Storefront updates

### New Component Files

- `src/components/ui/reactbits/` - ReactBits component wrappers
- `src/components/ui/aceternity/` - Aceternity UI component wrappers
- `src/lib/reactbits-utils.ts` - Utility functions for ReactBits
- `src/lib/aceternity-utils.ts` - Utility functions for Aceternity UI

## Design Principles

1. **Less Blocky**: Use gradients, overlays, and shapes instead of solid blocks
2. **More Personality**: Add animations, unique layouts, and visual interest
3. **Better UX**: Improve visual hierarchy, spacing, and flow
4. **Theme Consistency**: Maintain #1d43d8 and #adfc04 colors throughout
5. **Performance**: Ensure smooth animations and fast load times
6. **Accessibility**: Maintain WCAG compliance with new components

## Success Criteria

- Homepage feels more engaging and less blocky
- Product cards have dynamic hover effects and better visual appeal
- Storefront pages match the improved design language
- Animations are smooth and performant
- Typography hierarchy is clear and engaging
- All components are responsive and accessible
- Theme colors are consistently applied
- Genty font remains only in logo

### To-dos

- [ ] Install ReactBits and Aceternity UI libraries and verify dependencies
- [ ] Add Outfit/Sora for headings and DM Sans/Inter for body text to layout.tsx and globals.css
- [ ] Create src/components/ui/reactbits/ and src/components/ui/aceternity/ directories with utility files
- [ ] Integrate key Aceternity UI components (Bento Grid, Card Hover, Border Beam, Text Effects, 3D Cards)
- [ ] Integrate ReactBits components (Animated Text, Gradients, Hover Effects, Scroll Animations)
- [ ] Redesign HomeHero component with Aceternity UI hero, animated text, and gradient backgrounds
- [ ] Replace PopularProducts grid with Bento Grid layout and add hover effects
- [ ] Redesign ProductCard with 3D effects, border beams, and enhanced hover states
- [ ] Transform FeaturedCategories with animated badges and interactive hover states
- [ ] Redesign PopularOrganizations cards with 3D effects and animated backgrounds
- [ ] Enhance AnimatedBanner with gradient overlays, animated beams, and text animations
- [ ] Update all headings to use new heading font and body text to use new body font
- [ ] Reduce blocky appearance with better spacing, rounded corners, and gradient overlays
- [ ] Implement staggered fade-in and scroll-triggered animations across all pages
- [ ] Add hover effects, button animations, and smooth transitions to interactive elements
- [ ] Ensure all new components are mobile-responsive and performant
- [ ] Test all pages across screen sizes, verify animations, check accessibility, and optimize performance