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
  - [ ] `src/features/cart` (drawer/page, line items)
  - [ ] `src/features/checkout` (review, place order)
  - [ ] `src/features/orders` (list, details)
  - [ ] `src/features/account` (profile, preferences)
  - [ ] `src/features/admin` (shell, products, categories, orders, analytics)

### Milestone 1: Foundation and shell
- [x] Build shared shell in `app/layout.tsx` using:
  - [x] `SiteHeader` (logo, search, category nav, cart badge, auth menu)
  - [x] `SiteFooter`
  - [ ] Optional `ThemeProvider` and `Toaster`
- [ ] Hook cart badge to `carts.queries.getCartSummary` (or `getCartByUser`)
- [x] Basic SEO metadata per page (title, description)
- [x] Acceptance: App loads with shell; public routes accessible; auth works

### Milestone 2: Products — listing and discovery
- [ ] Home `/`:
  - [ ] Popular products via `products.queries.getPopularProducts`
  - [ ] Featured categories via `categories.queries.getCategories`
- [ ] Category `/c/[slug]`:
  - [ ] `categories.queries.getCategoryBySlug`
  - [ ] `products.queries.getProducts` with filters/sort/pagination
  - [ ] Filter UI: price, rating, tags, inventory, sort
- [ ] Search `/search` using `products.queries.searchProducts`
- [ ] Acceptance: Browse products/categories with loading/error states

### Milestone 3: Product detail (PDP)
- [ ] Page `/p/[slug]` using `products.queries.getProductBySlug`
- [ ] Image gallery (resolve R2 keys via `files.queries.index.getFileUrl`)
- [ ] Variant selector, price, stock, recent reviews
- [ ] Add to cart (calls `carts.mutations.addItem`)
- [ ] Acceptance: PDP renders with variant selection and add-to-cart works

### Milestone 4: Cart
- [ ] Cart drawer/page bound to `getCartByUser` and `getCartSummary`
- [ ] Quantity updates `updateItemQuantity`; selection `setItemSelected`
- [ ] Remove item `removeItem`; notes `setItemNote`; clear `clearCart`
- [ ] Totals recompute reactively; empty-state handling
- [ ] Acceptance: Full cart UX with badge, drawer/page parity

### Milestone 5: Checkout and order placement
- [ ] `/checkout` review page (load current cart, compute totals)
- [ ] Place order via `orders.mutations.createOrder`
- [ ] Success page with order number; error handling and retry
- [ ] Acceptance: Orders persist; inventory/stats update server-side

### Milestone 6: Customer orders
- [ ] `/orders` and `/orders/[id]`
- [ ] List current user orders via `orders.queries.getOrders`
- [ ] Detail via `orders.queries.getOrderById`
- [ ] Acceptance: Users can view history and details

### Milestone 7: Account
- [ ] `/account` profile + preferences
- [ ] Read via `users.queries.getCurrentUser`; update via `users.mutations`
- [ ] Acceptance: Profile updates persist and reflect on next load

### Milestone 8: Admin shell and access control
- [ ] `/admin` gated by `isStaff`/`isAdmin` or permissions queries
- [ ] Admin sidebar, header, overview widgets
- [ ] Acceptance: Only authorized users access; shows real metrics

### Milestone 9: Admin — products management
- [ ] List/search/sort products
- [ ] Create/edit forms with React Hook Form + Zod
- [ ] Variants management via `manageVariants`
- [ ] Images via R2 (`api.files.r2`) and `manageProductImages`
- [ ] Create/update/delete/restore hooks to mutations provided
- [ ] Acceptance: Staff can CRUD products with images/variants

### Milestone 10: Admin — categories management
- [ ] List/create/edit categories; manage hierarchy
- [ ] Use `categories.mutations.createCategory`, `updateCategory`,
      `deleteCategory`, `restoreCategory`
- [ ] Acceptance: Category tree manageable and reflected in storefront

### Milestone 11: Admin — orders management
- [ ] List with status filters; detail view
- [ ] Update status via `orders.mutations.updateOrder`; cancel/restore
- [ ] Acceptance: Staff can process orders end-to-end

### Milestone 12: Content and support (optional)
- [ ] Announcements: list/pin/acknowledge
- [ ] Tickets: submit, triage
- [ ] Chats: room list and messages UI

### Milestone 13: Files and media polish
- [ ] Central `R2Image` that resolves keys to URLs via `getFileUrl`
- [ ] Placeholders, loading states, error fallbacks

### Milestone 14: Analytics and dashboards
- [ ] Product analytics via `products.queries.getProductAnalytics`
- [ ] Orders analytics via `orders.queries.getOrderAnalytics`

### Milestone 15: Hardening
- [ ] Route-level `loading.tsx` and `error.tsx` where appropriate
- [ ] Error boundaries, toasts for recoverable errors
- [ ] Accessibility pass (labels, focus, contrast, keyboard nav)
- [ ] Responsive checks and skeletons for key pages
- [ ] Basic tests for add-to-cart, order creation, product form

### Route map
- [ ] `/` landing
- [ ] `/c/[slug]` category
- [ ] `/p/[slug]` product detail
- [ ] `/search` global search
- [ ] `/cart` cart page (or drawer from header)
- [ ] `/checkout` review and place order
- [ ] `/orders`, `/orders/[id]` order history/details
- [ ] `/account` profile and preferences
- [ ] `/admin` dashboard with nested: `products`, `categories`, `orders`,
      `analytics`

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

### Shared UI checklist
- [ ] ProductCard, ProductGrid, ProductFilters, Pagination
- [ ] CategoryNav, Breadcrumbs
- [ ] CartDrawer, CartLineItem, CartSummary
- [ ] Form primitives with RHF + Zod and consistent error display
- [ ] Skeletons and EmptyState components


