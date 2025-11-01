<!-- 08c5e863-352c-4e27-bfbc-43b3ee954ff5 ee4509c3-54e4-4449-8c98-f26f3efa6b77 -->
# UI Enhancement & Design Cleanup Plan

## Overview

Transform all components and pages into a sleek, minimal, responsive design with compact spacing, smooth micro-interactions, and consistent branding across the entire application.

## Design Principles

- **Compact & Efficient**: Tighter spacing, more content visible without clutter
- **Smooth Animations**: Moderate transitions with cubic-bezier easing
- **Brand Consistency**: Use existing #1d43d8 (primary blue) and #adfc04 (neon accent)
- **Responsive Equality**: Optimized equally for mobile, tablet, and desktop
- **Visual Hierarchy**: Clear information structure without key-value presentation

## Implementation Roadmap

### Phase 1: Core Design System Updates

#### 1.1 Global Styles Enhancement

**File**: `app/globals.css`

- Refine transition timings to be more consistent (200ms cubic-bezier)
- Add utility classes for compact spacing variants
- Enhance card hover effects with subtle lift and shadow
- Add skeleton loading animations with shimmer effect
- Create compact padding utilities (.p-compact, .px-compact, etc.)

#### 1.2 Base UI Components Polish

**Files**: `components/ui/*.tsx`

- **Button**: Reduce height, tighten padding, add pressed state
- **Card**: Reduce default padding from py-6 to py-4, compact gap from 6 to 4
- **Input**: Reduce height, refine focus ring thickness
- **Badge**: Make more compact with smaller text and padding
- **ScrollArea**: Ensure smooth scrolling with momentum

### Phase 2: Layout Components

#### 2.1 Site Header Redesign

**File**: `src/features/common/components/site-header.tsx`

- Reduce header height from h-14 to h-12 for compactness
- Make search bar more prominent with better visual weight
- Streamline navigation with tighter spacing
- Improve cart badge positioning and animation
- Add smooth dropdown animations
- Optimize categories bar with better overflow handling
- Reduce logo size and improve alignment

#### 2.2 Site Footer Enhancement

**File**: `src/features/common/components/site-footer.tsx`

- Create compact footer layout
- Use grid for better organization
- Add subtle separators between sections
- Improve link hover states

#### 2.3 Admin Navigation

**Files**:

- `src/features/admin/components/admin-nav.tsx`
- `src/features/admin/components/admin-header.tsx`
- Compact sidebar with icon-first design
- Add smooth active state transitions
- Reduce padding throughout

### Phase 3: Customer-Facing Pages

#### 3.1 Homepage Optimization

**Files**:

- `app/(main)/page.tsx`
- `src/features/products/components/home-hero.tsx`
- `src/features/products/components/popular-products.tsx`
- `src/features/categories/components/featured-categories.tsx`
- `src/features/organizations/components/popular-organizations.tsx`

**Changes**:

- Hero: Reduce height, make CTA more prominent, add subtle animations
- Product cards: Compact layout, improve image aspect ratios
- Category cards: Tighter spacing, better hover effects
- Organization cards: Streamline presentation

#### 3.2 Product Pages

**Files**:

- `src/features/products/components/product-detail.tsx`
- `app/(main)/p/[slug]/page.tsx`
- `src/features/products/components/search-results.tsx`

**Changes**:

- Reduce gallery height for compactness
- Tighten spacing between product info sections
- Improve variant selector with better visual feedback
- Compact review cards
- Optimize recommended products grid
- Better mobile product detail layout

#### 3.3 Storefront Pages

**Files**:

- `app/(storefront)/o/[orgSlug]/page.tsx`
- `app/(storefront)/o/[orgSlug]/layout.tsx`

**Changes**:

- Reduce banner height
- Make hero card more compact
- Tighten announcement cards
- Improve organization info layout

#### 3.4 Category & Search Pages

**Files**:

- `src/features/categories/components/category-products.tsx`
- `app/(main)/c/[slug]/page.tsx`
- `app/(main)/search/page.tsx`

**Changes**:

- Compact filter sidebar
- Tighter product grid spacing
- Better pagination controls
- Improved empty states

### Phase 4: Shopping Flow

#### 4.1 Cart Sheet Optimization

**File**: `src/features/cart/components/cart-sheet.tsx`

- Reduce item card padding
- Compact quantity controls
- Streamline variant selector
- Better remove button placement
- Tighter totals summary
- Smooth slide-in animation

#### 4.2 Checkout Page Enhancement

**File**: `src/features/checkout/components/checkout-page.tsx`

- More compact item list
- Reduce card padding throughout
- Streamline order summary
- Better mobile layout

#### 4.3 Cart Page

**File**: `src/features/cart/components/cart-page.tsx`

- Apply same compact principles as cart sheet
- Better bulk actions layout
- Tighter spacing between items

### Phase 5: Account & User Pages

#### 5.1 Orders Pages

**Files**:

- `src/features/orders/components/orders-list.tsx`
- `src/features/orders/components/order-detail.tsx`
- `app/(main)/orders/page.tsx`
- `app/(main)/orders/[id]/page.tsx`

**Changes**:

- Compact order cards with better info hierarchy
- Streamline status badges
- Tighter timeline/tracking view
- Better mobile order details

#### 5.2 User Profile Pages

**Files**:

- `src/features/common/components/user-profile-pages/account-page.tsx`
- `src/features/common/components/user-profile-pages/organizations-page.tsx`
- `src/features/common/components/user-profile-pages/chats-page.tsx`
- `src/features/common/components/user-profile-pages/tickets-page.tsx`

**Changes**:

- Compact forms and settings panels
- Tighter organization cards
- Better chat list layout
- Streamline ticket list

#### 5.3 Organizations Management

**Files**:

- `src/features/organizations/components/organizations-page.tsx`
- `src/features/organizations/components/org-members-manager.tsx`
- `src/features/organizations/components/org-settings-form.tsx`

**Changes**:

- Compact member list
- Streamline settings forms
- Better permission badges
- Tighter invite section

### Phase 6: Communication Features

#### 6.1 Chat Interface

**Files**:

- `src/features/chats/components/chat-layout.tsx`
- `src/features/chats/components/chat-room.tsx`
- `src/features/chats/components/message-bubble.tsx`
- `src/features/chats/components/chat-input.tsx`
- `src/features/chats/components/chats-sidebar-list.tsx`

**Changes**:

- More compact message bubbles
- Tighter chat sidebar
- Better input area
- Smoother message animations
- Improved unread indicators

#### 6.2 Tickets System

**Files**:

- `src/features/tickets/components/tickets-page.tsx`
- `src/features/tickets/components/new-ticket-form.tsx`
- `src/features/tickets/components/consolidated-tickets-page.tsx`

**Changes**:

- Compact ticket cards
- Streamline form fields
- Better status badges
- Tighter spacing throughout

### Phase 7: Admin Dashboard

#### 7.1 Admin Overview

**Files**:

- `app/(admin)/admin/page.tsx`
- `src/features/admin/components/admin-overview-content.tsx`

**Changes**:

- Compact stat cards
- Tighter chart spacing
- Better metric presentation
- Improved dashboard grid

#### 7.2 Admin Management Pages

**Files**:

- `app/(admin)/admin/products/page.tsx`
- `app/(admin)/admin/orders/page.tsx`
- `app/(admin)/admin/categories/page.tsx`
- `app/(admin)/admin/org-members/page.tsx`

**Changes**:

- Compact data tables
- Better filter panels
- Tighter action buttons
- Improved bulk actions

#### 7.3 Admin Communication

**Files**:

- `app/(admin)/admin/chats/page.tsx`
- `app/(admin)/admin/tickets/page.tsx`
- `app/(admin)/admin/announcements/page.tsx`

**Changes**:

- Compact message lists
- Streamline announcement cards
- Better admin chat interface

### Phase 8: Shared Components

#### 8.1 R2 Image Component

**File**: `src/components/ui/r2-image.tsx`

- Add smooth loading transitions
- Better skeleton states
- Optimize image sizing

#### 8.2 Loading & Error States

**Files**: All `loading.tsx` and `error.tsx` files

- Create consistent compact skeletons
- Better error messages
- Unified loading patterns

### Phase 9: Animations & Transitions

#### 9.1 Add Micro-interactions

- Hover lift on cards (2px translateY)
- Button press feedback
- Smooth color transitions
- Badge pulse for notifications
- Shimmer on loading skeletons

#### 9.2 Page Transitions

- Fade-in on route changes
- Smooth scroll restoration
- Loading state transitions

### Phase 10: Responsive Refinements

#### 10.1 Mobile Optimizations

- Ensure all touch targets are adequate (44px min)
- Optimize spacing for smaller screens
- Better sheet/modal behaviors
- Improved bottom navigation if needed

#### 10.2 Tablet Optimizations

- Better use of medium breakpoint
- Optimize grid layouts
- Balance between mobile and desktop spacing

#### 10.3 Desktop Enhancements

- Maximize screen real estate
- Better hover states
- Utilize wider layouts effectively

### Phase 11: Final Polish

#### 11.1 Consistency Audit

- Ensure uniform spacing scale
- Verify color usage consistency
- Check typography hierarchy
- Validate animation timings

#### 11.2 Performance Check

- Verify no layout shifts
- Check animation performance
- Ensure smooth scrolling
- Validate image loading

#### 11.3 Accessibility Verification

- Ensure adequate contrast
- Verify focus states
- Check screen reader support
- Validate keyboard navigation

## Success Criteria

- ✅ All pages load without layout shift
- ✅ Consistent spacing throughout (4/8/12/16/24px scale)
- ✅ Smooth 200ms transitions on all interactions
- ✅ Responsive design works flawlessly on all screen sizes
- ✅ Brand colors used consistently
- ✅ No "key-value" table-like presentations
- ✅ Visual hierarchy is clear and intuitive
- ✅ All animations perform at 60fps

## Key Files to Update

**Total files**: ~80+ files across app/, src/features/, and components/

**Priority order**:

1. Core UI components (buttons, cards, inputs)
2. Global styles and utilities
3. Layout components (header, footer, nav)
4. Customer-facing pages (home, products, storefront)
5. Shopping flow (cart, checkout)
6. Account pages
7. Communication features
8. Admin dashboard
9. Shared utilities and loading states
10. Final polish and consistency

### To-dos

- [ ] Update global styles and base UI components (globals.css, button, card, input, badge)
- [ ] Enhance site header, footer, and admin navigation
- [ ] Optimize homepage components (hero, popular products, categories)
- [ ] Refine product detail, search results, and category pages
- [ ] Enhance organization storefront pages
- [ ] Optimize cart sheet, cart page, and checkout
- [ ] Streamline orders, user profile, and organization management pages
- [ ] Enhance chat interface and tickets system
- [ ] Refine admin overview and management pages
- [ ] Improve R2Image, loading states, and error states
- [ ] Add micro-interactions and smooth transitions throughout
- [ ] Refine mobile, tablet, and desktop responsive behaviors
- [ ] Consistency audit, performance check, and accessibility verification