<!-- 7e7266dc-cbf9-4883-af99-c4b612d00561 46d1cab7-4b3d-41aa-a9e4-9a37ab511a54 -->
# Implement preloadQuery for SSR Crucial Pages

This plan implements Convex `preloadQuery` for all SSR crucial pages that take URL parameters: home page, categories page, product page, and storefront page.

## Overview

Currently, these pages use client-side `useQuery` hooks which causes loading states and slower initial renders. We'll migrate to server-side `preloadQuery` to:

- Preload data on the server during SSR
- Improve initial page load performance
- Enhance SEO with pre-rendered content
- Maintain reactivity through `usePreloadedQuery` hook

## Implementation Details

### 1. Home Page (`app/(main)/page.tsx`)

**Current state:** Server component that renders client components (`PopularProducts`, `FeaturedCategories`, `PopularOrganizations`) which use `useQuery` hooks.

**Changes needed:**

- Preload queries in server component:
  - `api.products.queries.index.getPopularProducts` (no orgSlug)
  - `api.categories.queries.index.getCategories` (isFeatured: true, isActive: true, limit: 6)
  - `api.organizations.queries.index.getPopularOrganizations` (limit: 8)
- Pass preloaded queries as props to client components
- Update client components to accept and use `usePreloadedQuery` instead of `useQuery`

**Files to modify:**

- `app/(main)/page.tsx` - Add preloadQuery calls
- `src/features/products/components/popular-products.tsx` - Accept preloaded query prop
- `src/features/categories/components/featured-categories.tsx` - Accept preloaded query prop
- `src/features/organizations/components/popular-organizations.tsx` - Accept preloaded query prop

### 2. Categories Page (`app/(main)/c/[slug]/page.tsx`)

**Current state:** Server component that renders `CategoryProducts` client component.

**Changes needed:**

- Preload queries in server component:
  - `api.categories.queries.index.getCategoryBySlug` (slug only, no orgSlug)
  - `api.products.queries.index.getProducts` (with categoryId, default filters)
- Pass preloaded queries to `CategoryProducts`
- Update `CategoryProducts` to accept preloaded queries and use `usePreloadedQuery` for initial data

**Files to modify:**

- `app/(main)/c/[slug]/page.tsx` - Add preloadQuery calls
- `src/features/categories/components/category-products.tsx` - Accept preloaded query props

### 3. Storefront Categories Page (`app/(storefront)/o/[orgSlug]/c/[slug]/page.tsx`)

**Current state:** Server component that validates org and renders `CategoryProducts`.

**Changes needed:**

- Preload queries in server component:
  - `api.organizations.queries.index.getOrganizationBySlug` (already exists for validation)
  - `api.categories.queries.index.getCategoryBySlug` (slug + organizationId)
  - `api.products.queries.index.getProducts` (with categoryId and organizationId, default filters)
- Pass preloaded queries to `CategoryProducts`
- Update `CategoryProducts` to handle preloaded org query

**Files to modify:**

- `app/(storefront)/o/[orgSlug]/c/[slug]/page.tsx` - Add preloadQuery calls
- `src/features/categories/components/category-products.tsx` - Accept preloaded query props (already modified above)

### 4. Product Page (`app/(main)/p/[slug]/page.tsx`)

**Current state:** Server component that renders `ProductDetailBoundary` client component.

**Changes needed:**

- Preload queries in server component:
  - `api.products.queries.index.getProductBySlug` (slug only, no orgSlug)
  - `api.products.queries.index.getProductRecommendations` (with productId, limit: 8)
- Pass preloaded queries to `ProductDetail` component
- Update `ProductDetail` to accept preloaded queries and use `usePreloadedQuery`

**Files to modify:**

- `app/(main)/p/[slug]/page.tsx` - Add preloadQuery calls
- `src/features/products/components/product-detail.tsx` - Accept preloaded query props

### 5. Storefront Product Page (`app/(storefront)/o/[orgSlug]/p/[slug]/page.tsx`)

**Current state:** Server component that validates org and renders `ProductDetailBoundary`.

**Changes needed:**

- Preload queries in server component:
  - `api.organizations.queries.index.getOrganizationBySlug` (already exists for validation)
  - `api.products.queries.index.getProductBySlug` (slug + organizationId)
  - `api.products.queries.index.getProductRecommendations` (with productId, limit: 8)
- Pass preloaded queries to `ProductDetail` component
- Update `ProductDetail` to handle preloaded org query

**Files to modify:**

- `app/(storefront)/o/[orgSlug]/p/[slug]/page.tsx` - Add preloadQuery calls
- `src/features/products/components/product-detail.tsx` - Accept preloaded query props (already modified above)

### 6. Storefront Page (`app/(storefront)/o/[orgSlug]/page.tsx`)

**Current state:** Server component that already queries organization and renders `PopularProducts` and `FeaturedCategories`.

**Changes needed:**

- Preload queries in server component:
  - `api.organizations.queries.index.getOrganizationBySlug` (already exists, reuse result)
  - `api.products.queries.index.getPopularProducts` (with organizationId, limit: 8)
  - `api.categories.queries.index.getCategories` (with organizationId, isFeatured: true, isActive: true, limit: 6)
- Pass preloaded queries to `PopularProducts` and `FeaturedCategories`
- Client components already handle orgSlug prop, update to accept preloaded queries

**Files to modify:**

- `app/(storefront)/o/[orgSlug]/page.tsx` - Add preloadQuery calls for products and categories
- `src/features/products/components/popular-products.tsx` - Accept preloaded query props (already modified above)
- `src/features/categories/components/featured-categories.tsx` - Accept preloaded query props (already modified above)

## Implementation Pattern

For each client component:

1. **Add props for preloaded queries:**
```typescript
import { Preloaded } from "convex/react";

interface Props {
  // ... existing props
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedProducts?: Preloaded<typeof api.products.queries.index.getPopularProducts>;
  // ... etc
}
```

2. **Use conditional hooks:**
```typescript
// Use preloaded query if available, otherwise fall back to useQuery
const organization = preloadedOrganization 
  ? usePreloadedQuery(preloadedOrganization)
  : useQuery(api.organizations.queries.index.getOrganizationBySlug, ...);
```

3. **In server components:**
```typescript
import { preloadQuery } from "convex/nextjs";

const preloadedProducts = await preloadQuery(
  api.products.queries.index.getPopularProducts,
  { limit: 8 }
);
```


## Notes

- Some queries depend on results from other queries (e.g., products depend on organization ID). Handle these dependencies by awaiting the first query before preloading dependent queries.
- Client components should maintain backward compatibility by falling back to `useQuery` if preloaded queries are not provided.
- The `ProductDetailBoundary` error boundary component may need updates to pass preloaded queries through to `ProductDetail`.
- For queries with conditional args (like `'skip'`), handle these appropriately in server components by only preloading when conditions are met.

### To-dos

- [ ] Implement preloadQuery for home page (app/(main)/page.tsx) - preload PopularProducts, FeaturedCategories, PopularOrganizations queries
- [ ] Update PopularProducts, FeaturedCategories, PopularOrganizations components to accept and use preloaded queries
- [ ] Implement preloadQuery for main categories page (app/(main)/c/[slug]/page.tsx) - preload category and products queries
- [ ] Implement preloadQuery for storefront categories page (app/(storefront)/o/[orgSlug]/c/[slug]/page.tsx) - preload org, category, and products queries
- [ ] Update CategoryProducts component to accept and use preloaded queries
- [ ] Implement preloadQuery for main product page (app/(main)/p/[slug]/page.tsx) - preload product and recommendations queries
- [ ] Implement preloadQuery for storefront product page (app/(storefront)/o/[orgSlug]/p/[slug]/page.tsx) - preload org, product, and recommendations queries
- [ ] Update ProductDetail component to accept and use preloaded queries
- [ ] Implement preloadQuery for storefront page (app/(storefront)/o/[orgSlug]/page.tsx) - preload products and categories queries
- [ ] Update ProductDetailBoundary to pass preloaded queries to ProductDetail component