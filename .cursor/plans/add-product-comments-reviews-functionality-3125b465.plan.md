<!-- 3125b465-0dd6-41f1-9783-44b6046ce881 1f467a69-23f9-4691-a631-bc5120c7cbf4 -->
# Add Product Comments/Reviews Functionality

## Overview

Add the ability for users to write comments/reviews on product pages. This will include backend mutations/queries for creating and fetching reviews, a UI component for submitting reviews, and integration with the product detail page.

## Implementation Plan

### 1. Backend: Create Reviews Mutations and Queries

**Create `convex/reviews/` directory structure:**

- `mutations/index.ts` - Export review mutations
- `mutations/createReview.ts` - Create new review with rating and comment
- `queries/index.ts` - Export review queries  
- `queries/getReviewsByProduct.ts` - Fetch reviews for a product with pagination
- `queries/getUserReview.ts` - Check if user has already reviewed a product

**Key features:**

- Validate user is authenticated
- Check for duplicate reviews (one review per user per product)
- Validate rating (1-5) and comment length
- Embed user info and product info in review document
- Update product stats (reviewsCount, rating) via `updateProductStats` mutation
- Include `isVerifiedPurchase` flag if user has purchased the product

### 2. Backend: Update Product Query

**Modify `convex/products/queries/getProductBySlug.ts`:**

- Add query to fetch recent reviews for the product
- Include reviews in product response or create separate query
- Consider pagination for reviews

**Alternative approach:** Create separate `getProductReviews` query that the frontend can call independently

### 3. Frontend: Create Review Form Component

**Create `src/features/products/components/product-review-form.tsx`:**

- Form with rating selector (1-5 stars) using Star icons
- Textarea for comment input
- Submit button with loading state
- Error handling and success feedback
- Disable form if user already reviewed or not authenticated
- Use React Hook Form with Zod validation

**Zod schema:**

- `rating`: number between 1-5 (required)
- `comment`: string optional, max length validation

### 4. Frontend: Create Reviews List Component

**Create `src/features/products/components/product-reviews-list.tsx`:**

- Display all reviews with pagination
- Show user avatar, name, rating, comment, and date
- Support "Load more" or pagination
- Show "Verified Purchase" badge if applicable
- Display merchant responses if any

### 5. Frontend: Integrate with Product Detail Page

**Modify `src/features/products/components/product-detail.tsx`:**

- Add review form section below product details
- Replace or enhance existing "Recent reviews" section with full reviews list
- Add "Write a review" button/CTA
- Show review form conditionally (when user clicks button or when authenticated)
- Handle authentication state (show sign-in prompt if not authenticated)

### 6. Schema and Type Updates

**Ensure types are properly defined:**

- Review type in `convex/_generated/dataModel.d.ts` will be auto-generated
- Create TypeScript types for review form values
- Update product query return types to include reviews

### 7. Testing Considerations

- Test authenticated user can submit review
- Test duplicate review prevention
- Test unauthenticated user sees appropriate message
- Test review display and pagination
- Test product stats update after review submission

## File Changes

**New files:**

- `convex/reviews/mutations/index.ts`
- `convex/reviews/mutations/createReview.ts`
- `convex/reviews/queries/index.ts`
- `convex/reviews/queries/getReviewsByProduct.ts`
- `convex/reviews/queries/getUserReview.ts`
- `src/features/products/components/product-review-form.tsx`
- `src/features/products/components/product-reviews-list.tsx`

**Modified files:**

- `src/features/products/components/product-detail.tsx` - Add review form and enhance reviews display
- `convex/products/queries/getProductBySlug.ts` - Optionally include reviews or create separate query
- `convex/products/mutations/updateProductStats.ts` - Already exists, will be called from createReview

## Key Implementation Details

- Reviews require authentication
- One review per user per product (prevent duplicates)
- Rating is required (1-5), comment is optional
- Reviews include embedded user and product info for performance
- Product stats (rating, reviewsCount) update automatically
- Reviews are displayed with user info, date, and optional merchant response