<!-- b88ebd68-24a6-42e7-a8d7-6a862cd07442 aa064eb9-89da-4346-834b-976993ef28f2 -->

# Add Framer Motion Animations to Index Page

## Overview

Add subtle fade-in and upward slide animations to all items on the index page using Framer Motion. Create a reusable utility function for animations and apply them consistently across components.

## Implementation Steps

### 1. Install Framer Motion

- Add `framer-motion` package using `bun add framer-motion`

### 2. Create Animation Utility Function

- Create `lib/animations.ts` with reusable animation variants:
- `fadeInUp`: Basic fade-in + slide-up variant (configurable delay, duration, distance)
- `fadeInUpContainer`: Container variant for staggered children animations
- `createFadeInUpVariant`: Helper function to create custom variants with parameters
- Default values: opacity 0→1, y: 20→0, duration 0.6s, easing cubic-bezier(0.16, 1, 0.3, 1)

### 3. Update HomeHero Component

- Convert `src/features/products/components/home-hero.tsx` to client component (add "use client")
- Wrap hero elements with `motion.div`:
- Animate "Custom Merch" label with delay 0.1s
- Animate headline with delay 0.2s
- Animate description with delay 0.3s
- Animate button container with delay 0.4s
- Animate right-side card with delay 0.5s

### 4. Update PopularProducts Component

- Wrap grid container with `motion.div` using `fadeInUpContainer` variant
- Update `src/features/products/components/product-card.tsx`:
- Wrap Card with `motion.div` using `fadeInUp` variant
- Remove CSS animation classes (`card-enter`, `card-enter-delay-*`)
- Use `layoutId` or index-based animation for stagger

### 5. Update FeaturedCategories Component

- Wrap badges container with `motion.div` using `fadeInUpContainer` variant
- Wrap each category badge Link with `motion.div` using `fadeInUp` variant

### 6. Update PopularOrganizations Component

- Wrap grid container with `motion.div` using `fadeInUpContainer` variant
- Wrap each organization Card with `motion.div` using `fadeInUp` variant
- Remove CSS animation classes

### 7. Clean Up CSS Animations (Optional)

- Remove or comment out `card-enter` and `card-enter-delay-*` CSS animations from `app/globals.css` since we're using Framer Motion

## Files to Modify

- `package.json` - Add framer-motion dependency
- `lib/animations.ts` - Create new file with animation utilities
- `src/features/products/components/home-hero.tsx` - Convert to client component, add animations
- `src/features/products/components/popular-products.tsx` - Add motion wrapper
- `src/features/products/components/product-card.tsx` - Add motion wrapper, remove CSS classes
- `src/features/categories/components/featured-categories.tsx` - Add motion wrappers
- `src/features/organizations/components/popular-organizations.tsx` - Add motion wrappers, remove CSS classes
- `app/globals.css` - Remove CSS card-enter animations (optional)

## Animation Specifications

- Fade-in: opacity 0 → 1
- Slide-up: translateY(20px) → translateY(0)
- Duration: 0.6s per item
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Stagger delay: 0.1s between items
- Initial delays: Hero elements staggered 0.1s, list items use container stagger

### To-dos

- [ ] Install framer-motion package using bun
- [ ] Create lib/animations.ts with fadeInUp variants and helper functions
- [ ] Convert HomeHero to client component and add motion animations to all elements
- [ ] Add motion wrapper to PopularProducts grid container
- [ ] Add motion wrapper to ProductCard and remove CSS animation classes
- [ ] Add motion wrappers to FeaturedCategories badges
- [ ] Add motion wrappers to PopularOrganizations cards and remove CSS classes
- [ ] Remove CSS card-enter animations from globals.css (optional)
