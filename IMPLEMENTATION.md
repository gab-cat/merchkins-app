## Frontend Implementation Plan

This plan maps the existing Convex + Next.js + Clerk backend to a complete
frontend. Tasks are grouped by milestone and include checkboxes you can use
to track progress.

### Assumptions

- [ ] Keep Clerk for auth and Convex as the data layer
- [ ] Use App Router and Tailwind for styling
- [ ] Introduce `src/features/*` for feature code; pages live in `app/*`
- [ ] Public storefront is browseable without auth; checkout/order history
      requires auth

### Early adjustments (do first)

- [x] Update `middleware.ts` public routes to allow unauthenticated access:
      `/`, `/c/(.*)`, `/p/(.*)`, `/search`
- [x] Replace landing content with a storefront home (remove upload example)
- [ ] Ensure required env vars are set: `NEXT_PUBLIC_CONVEX_URL`, Clerk keys,
      any R2 bucket settings

### Directory setup (non-breaking)

- [ ] Create feature folders:
  - [x] `src/features/common` (layout, shell, pagination, filter UI, toasts)
  - [x] `src/features/products` (grid, cards, detail, filters)
  - [x] `src/features/categories` (nav, tree, grid)
  - [x] `src/features/cart` (drawer/page, line items)
  - [x] `src/features/checkout` (review, place order)
  - [x] `src/features/orders` (list, details)
  - [ ] `src/features/account` (profile, preferences)
  - [ ] `src/features/admin` (shell, products, categories, orders, analytics)
  - [ ] `src/features/super-admin` (shell, orgs, users, permissions, logs, analytics)

### Milestone 1: Foundation and shell

- [x] Build shared shell in `app/layout.tsx` using:
  - [x] `SiteHeader` (logo, search, category nav, cart badge, auth menu)
  - [x] `SiteFooter`
  - [ ] Optional `ThemeProvider` and `Toaster`
- [ ] Hook cart badge to `carts.queries.getCartSummary` (or `getCartByUser`)
- [x] Basic SEO metadata per page (title, description)
- [x] Acceptance: App loads with shell; public routes accessible; auth works

### Milestone 2: Products — listing and discovery

- [x] Home `/`:
  - [x] Popular products via `products.queries.getPopularProducts`
  - [x] Featured categories via `categories.queries.getCategories`
- [x] Category `/c/[slug]`:
  - [x] `categories.queries.getCategoryBySlug`
  - [x] `products.queries.getProducts` with filters/sort/pagination
  - [x] Filter UI: price, rating, tags, inventory, sort
- [x] Search `/search` using `products.queries.searchProducts`
- [x] Acceptance: Browse products/categories with loading/error states

### Milestone 3: Product detail (PDP)

- [x] Page `/p/[slug]` using `products.queries.getProductBySlug`
- [x] Image gallery (resolve R2 keys via `files.queries.index.getFileUrl`)
- [x] Variant selector, price, stock, recent reviews
- [x] Add to cart (calls `carts.mutations.addItem`)
- [x] Acceptance: PDP renders with variant selection and add-to-cart works

### Milestone 4: Cart

- [x] Cart page bound to `getCartByUser` (summary derived locally)
- [x] Quantity updates `updateItemQuantity`; selection `setItemSelected`
- [x] Remove item via `updateItemQuantity(quantity=0)`; notes `setItemNote`; clear `clearCart`
- [x] Totals recompute reactively; empty-state handling
- [x] Acceptance: Full cart UX with badge, page parity

### Milestone 5: Checkout and order placement

- [x] `/checkout` review page (load current cart, compute totals)
- [x] Place order via `orders.mutations.createOrder`
- [x] Redirect to `/orders` after placement; inline error handling
- [x] Acceptance: Orders persist; inventory/stats update server-side

### Milestone 6: Customer orders

- [x] `/orders` and `/orders/[id]`
- [x] List current user orders via `orders.queries.getOrders`
- [x] Detail via `orders.queries.getOrderById`
- [x] Acceptance: Users can view history and details

### Milestone 7: Account

- [x] `/account` profile + preferences
- [x] Read via `users.queries.getCurrentUser`; update via `users.mutations`
- [x] Acceptance: Profile updates persist and reflect on next load

### Milestone 8: Admin shell and access control

- [x] `/admin` gated by `isStaff`/`isAdmin` or permissions queries
- [x] Admin sidebar, header, overview widgets
- [x] Acceptance: Only authorized users access; shows real metrics

### Milestone 9: Admin — products management

- [x] List/search/sort products
- [x] Create/edit forms with React Hook Form + Zod
- [x] Variants management via `manageVariants`
- [x] Images via R2 (`api.files.r2`) and `manageProductImages`
- [x] Create/update/delete/restore hooks to mutations provided
- [x] Acceptance: Staff can CRUD products with images/variants

### Milestone 10: Admin — categories management

- [x] List/create/edit categories; manage hierarchy
- [x] Use `categories.mutations.createCategory`, `updateCategory`,
      `deleteCategory`, `restoreCategory`
- [x] Acceptance: Category tree manageable and reflected in storefront

### Milestone 11: Admin — orders management

- [x] List with status filters; detail view
- [x] Update status via `orders.mutations.updateOrder`; cancel/restore
- [x] Acceptance: Staff can process orders end-to-end

### Milestone 12: Content and support (optional)

- [x] Announcements: list/pin/acknowledge
- [x] Tickets: submit, triage
- [x] Chats: room list and messages UI

### Milestone 13: Files and media polish

- [x] Central `R2Image` that resolves keys to URLs via `getFileUrl`
- [x] Placeholders, loading states, error fallbacks

### Milestone 14: Analytics and dashboards

- [x] Product analytics via `products.queries.getProductAnalytics`
- [x] Orders analytics via `orders.queries.getOrderAnalytics`

### Milestone 15: Hardening

- [x] Route-level `loading.tsx` and `error.tsx` where appropriate
- [x] Error boundaries, toasts for recoverable errors
- [ ] Accessibility pass (labels, focus, contrast, keyboard nav)
- [x] Responsive checks and skeletons for key pages
- [ ] Basic tests for add-to-cart, order creation, product form

### Milestone 16: Super admin — shell and access

- [x] `/super-admin` route gated by `isSuperAdmin` or a permission check
      via `permissions.queries.checkEntityPermission` or an equivalent
      global check
- [x] Shell with sections: Organizations, Users, Permissions, Logs,
      Announcements, Analytics
- [x] Acceptance: Only super admins can access; global metrics render

### Milestone 17: Super admin — organizations management

- [x] List/search/sort all organizations
- [x] Create/update/delete/restore organizations
- [x] Manage invite links (create/deactivate), members, and roles
- [x] Acceptance: Org changes propagate to storefront/admin views

Convex APIs: `organizations.queries.*`, `organizations.mutations.*`

### Milestone 18: Super admin — users management

- [x] List users across organizations with filters (role, status, activity)
- [x] Update roles and preferences; manage org memberships
- [x] Assign/revoke user permissions
- [x] Optional: Impersonate as user (dev-only safeguard, log activity)
- [x] Acceptance: Changes persist and affect access immediately

Convex APIs: `users.queries.*`, `users.mutations.*`,
`permissions.mutations.assignUserPermission`,
`permissions.mutations.revokeUserPermission`

### Milestone 19: Super admin — permissions and roles

- [x] View permission catalog and usage summary
- [x] Assign/revoke organization-level permissions
- [x] Assign/revoke global user permissions
- [x] Acceptance: Permission checks enforce correct access

Convex APIs: `permissions.queries.*`, `permissions.mutations.*`

### Milestone 20: Super admin — logs and system events

- [x] Browse, filter, and search logs
- [x] Archive/restore/delete log entries
- [x] View error and usage analytics over time
- [x] Acceptance: Log actions work and analytics update

Convex APIs: `logs.queries.*`, `logs.mutations.*`

### Milestone 21: Super admin — announcements and broadcast

- [x] Create/update/delete/pin announcements
- [x] Manage acknowledgments and delivery stats
- [x] Acceptance: Announcements visible across orgs as configured

Convex APIs: `announcements.queries.*`, `announcements.mutations.*`

### Milestone 22: Super admin — cross-org analytics (optional)

- [x] Cross-organization products and orders analytics dashboards
- [x] CSV export for reports
- [x] Acceptance: Aggregated metrics render; exports download successfully

Convex APIs: `products.queries.getProductAnalytics`,
`orders.queries.getOrderAnalytics`

### Milestone 23: Organization storefront — discovery and routing

- [x] Add public routes for organization storefront:
      `/o/[orgSlug]`, `/o/[orgSlug]/c/[slug]`, `/o/[orgSlug]/p/[slug]`,
      `/o/[orgSlug]/search`
- [x] Update `middleware.ts` public matcher to allow `/o/(.*)`
- [x] Resolve organization by slug via
      `organizations.queries.getOrganizationBySlug`
- [x] 404 with a friendly page if organization is not found or inactive
- [x] Acceptance: Visiting `/o/{slug}` renders an org-scoped shell
      (header/footer) without errors

### Milestone 24: Organization shell and theming

- [x] Org-aware shell (logo, colors, banner) from
      `organizations.themeSettings` (basic org name wired; theme colors TBD)
- [x] Scoped `SiteHeader` with org logo and category nav filtered by org
- [x] Scoped `SiteFooter` with organization links and contact details
- [x] Accessibility: color contrast, ARIA, focus order maintained
- [x] Acceptance: Theme applies consistently across all `/o/{slug}` pages

### Milestone 25: Organization home and discovery

- [x] Featured categories via
      `categories.queries.getCategories({ organizationId, isFeatured: true })`
- [x] Popular products via
      `products.queries.getPopularProducts({ organizationId })`
- [x] Optional: org hero (bannerImage, tagline), breadcrumbs
- [x] Acceptance: Home shows only org data; pagination and loading states
      work

### Milestone 26: Organization category listing

- [x] Route `/o/[orgSlug]/c/[slug]` resolves category via
      `categories.queries.getCategoryBySlug({ organizationId, slug })`
- [x] Product grid via
      `products.queries.getProducts({ organizationId, categoryId, ... })`
- [x] Filters: price, rating, tags, inventory, sort (scoped to org)
- [x] Acceptance: Filtering/sorting works and remains org-scoped

### Milestone 27: Organization product detail (PDP)

- [x] Route `/o/[orgSlug]/p/[slug]` uses
      `products.queries.getProductBySlug({ organizationId, slug })`
- [x] Image gallery using R2 resolver (`files.queries.index.getFileUrl`)
- [x] Variant selector, price, inventory, recent reviews (org-scoped)
- [x] Add to cart flows remain as-is (cart is global for now)
- [x] Acceptance: PDP shows only org product; 404 for cross-org slug

### Milestone 28: Organization search

- [x] Route `/o/[orgSlug]/search` uses
      `products.queries.searchProducts({ organizationId, query })`
- [x] Show category chips and tags filtered by org
- [x] Acceptance: Results are org-limited; empty and error states handled

### Milestone 29: Organization SEO and metadata

- [x] Per-org metadata (title, description, OpenGraph) and canonical URLs (basic titles wired)
- [ ] Structured data (Organization, Product) with org branding
- [x] Acceptance: View source shows correct tags per org page

### Milestone 30: Organization storefront hardening

- [x] Route-level loading and error boundaries for `/o/*`
- [ ] Visual/interaction regression checks for org theming
- [ ] Optional: sitemap per org; org-level analytics widgets later
- [x] Acceptance: Smooth, accessible experience across `/o/*`

### Route map

- [x] `/` landing
- [x] `/c/[slug]` category
- [x] `/p/[slug]` product detail
- [x] `/search` global search
- [x] `/cart` cart page (or drawer from header)
- [x] `/checkout` review and place order
- [x] `/orders`, `/orders/[id]` order history/details
- [ ] `/account` profile and preferences
- [ ] `/admin` dashboard with nested: `products`, `categories`, `orders`,
      `analytics`
- [ ] `/super-admin` dashboard with nested: `organizations`, `users`,
      `permissions`, `logs`, `announcements`, `analytics`

### Data/reference mapping (Convex APIs to use)

- [ ] Products: `getProducts`, `getProductBySlug`, `getPopularProducts`,
      `searchProducts`, `createProduct`, `updateProduct`, `deleteProduct`,
      `restoreProduct`, `manageVariants`, `manageProductImages`
- [ ] Categories: `getCategories`, `getCategoryBySlug`, `getCategoryHierarchy`,
      `createCategory`, `updateCategory`, `deleteCategory`, `restoreCategory`
- [ ] Cart: `createOrGetCart`, `addItem`, `removeItem`, `updateItemQuantity`,
      `setItemSelected`, `setItemNote`, `clearCart`, `getCartByUser`,
      `getCartSummary`
- [ ] Orders: `createOrder`, `getOrders`, `getOrderById`, `updateOrder`,
      `cancelOrder`, `restoreOrder`
- [ ] Files/R2: `api.files.r2` (upload), `files.queries.index.getFileUrl`
- [ ] Users: `users.queries.getCurrentUser`, profile/preferences mutations
- [ ] Super admin: `organizations.queries.*`, `organizations.mutations.*`,
      `users.queries.*`, `users.mutations.*`, `permissions.queries.*`,
      `permissions.mutations.*`, `logs.queries.*`, `logs.mutations.*`,
      `announcements.queries.*`, `announcements.mutations.*`,
      `products.queries.getProductAnalytics`,
      `orders.queries.getOrderAnalytics`

### Shared UI checklist

- [ ] ProductCard, ProductGrid, ProductFilters, Pagination
- [ ] CategoryNav, Breadcrumbs
- [ ] CartDrawer, CartLineItem, CartSummary
- [ ] Form primitives with RHF + Zod and consistent error display
- [ ] Skeletons and EmptyState components
