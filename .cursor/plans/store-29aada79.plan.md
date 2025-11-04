<!-- 29aada79-fad5-4744-8a5e-27589af1798b 4bacc663-668c-4b96-a5f4-aaa6251981cb -->

# Storefront: On-Scroll Entrance Animations + Skeleton Corrections

## Scope

- Animate all major sections on the storefront page (`app/(storefront)/o/[orgSlug]/page.tsx`):
  - Banner/Hero block (logo, title, meta, buttons)
  - Pinned announcements list + items
  - Popular products section (wrap grid)
  - Featured categories section (wrap grid)
- Correct and refine skeleton loaders for these sections (consistent sizes, spacing, shimmer timing, reduced-motion support).
- Trigger animations as elements enter the viewport (on-scroll) using framer-motion’s `whileInView` and `viewport`.
- Use existing helpers from `lib/animations.ts`: `fadeInUp`, `fadeInUpContainer`, `fadeInUpVariants`.
- Respect reduced motion with `prefers-reduced-motion` and avoid excessive motion.

## Key Changes (Files)

1. `app/(storefront)/o/[orgSlug]/page.tsx`
   - Import `motion` from `framer-motion` and variants from `lib/animations`.
   - Wrap sections with `motion.section` / `motion.div` using:
     - `initial="initial"`
     - `whileInView="animate"`
     - `viewport={{ once: true, margin: '0px 0px -80px 0px' }}`
     - Parent containers use `fadeInUpContainer`; children use `fadeInUp`/`fadeInUpVariants.subtle`.
   - Example pattern (non-obvious):

     ```tsx
     <motion.section variants={fadeInUpContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
       <motion.div variants={fadeInUpVariants.subtle}>...</motion.div>
       <motion.div variants={fadeInUp}>...</motion.div>
     </motion.section>
     ```

   - Banner: animate logo, title/description, metadata row, and CTA buttons as staggered children.
   - Announcements: parent uses container; each announcement row is a child with `variants={fadeInUp}`.
   - Popular products and Featured categories: wrap their root section and (optionally) their grids if accessible via wrapper div.

2. Skeleton corrections (where defined)
   - Ensure skeletons mirror final layout dimensions to prevent layout shift.
   - Normalize spacing and border radius to match cards and list items.
   - Use a consistent shimmer animation duration (e.g., 1.2s) and color tokens.
   - Provide reduced-motion fallback (no shimmer; subtle opacity pulse or static blocks).
   - Likely touchpoints if skeletons are defined inside feature components:
     - `src/features/products/components/popular-products.tsx` (skeleton grid)
     - `src/features/categories/components/featured-categories.tsx` (skeleton grid)
     - Announcements list skeleton in `page.tsx` if present; otherwise, add a minimal inline skeleton wrapper.

3. Optional (only if needed for finer control)
   - Add a wrapper `className`/`containerProps` prop to feature components to place a `motion.div` internally if external wrapping isn’t sufficient. Prefer wrapping in page to avoid component edits.

## Accessibility & Motion

- Keep distances small (10–20px) and durations 0.4–0.6s.
- Use `viewport={{ once: true }}` to animate a single time per visit.
- Skeletons: respect `prefers-reduced-motion` by disabling shimmer and using a static or subtle opacity change.

## Visual Tuning

- `fadeInUpVariants.subtle` for dense lists (announcements rows, product/category cards).
- `fadeInUp` for primary elements (headline, CTAs).
- Gentle stagger (0.08–0.12) via `fadeInUpContainer`.

## Validation

- No layout shift: elements reserve space; opacity/translate only.
- No hydration issues: server-render data; motion only affects rendered DOM. If needed, isolate animated parts in tiny client components without moving data fetching.

## Deliverables

- Updated `page.tsx` with motion wrappers and on-scroll triggers for all sections.
- Corrected skeleton loaders that align with final layouts and a11y/reduced-motion requirements

### To-dos

- [ ] Import motion and variants into `page.tsx` and prep helpers
- [ ] Animate banner: logo, text, metadata, and CTAs with staggered entrance
- [ ] Animate announcements section and each row item on scroll
- [ ] Wrap PopularProducts section with on-scroll entrance and stagger
- [ ] Wrap FeaturedCategories section with on-scroll entrance and stagger
- [ ] Ensure subtle durations/offsets and once-per-view for reduced motion
- [ ] Manual pass for layout shifts and consistent timing across sections
