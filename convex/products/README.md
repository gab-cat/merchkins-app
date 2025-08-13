# Products Domain

This module handles all product-related functionality including product management, analytics, and searching.

## Overview

The products domain manages product information, variants, inventory, and analytics. It supports both organization-specific and global products with comprehensive filtering, searching, and statistical capabilities.

## Features

### Product Management
- Create, update, delete, and restore products
- Support for multiple product variants with individual pricing and inventory
- Category assignment and organization scoping
- Rich product information including images, descriptions, tags
- Inventory management with PREORDER and STOCK types
- Automatic slug generation and uniqueness validation

### Product Analytics
- View counts and order tracking
- Revenue calculations per product and variant
- Rating and review aggregation
- Popular product identification
- Category-wise breakdowns
- Time-based filtering for analytics

### Search & Discovery
- Full-text search across titles, descriptions, and tags
- Advanced filtering by price, rating, category, organization
- Popular products with configurable timeframes
- Sort by various criteria (newest, rating, price, popularity)
- Pagination support for all queries

## Data Model

### Products Table
```typescript
{
  // Basic Info
  isDeleted: boolean,
  categoryId?: Id<"categories">,
  postedById: Id<"users">,
  organizationId?: Id<"organizations">,
  
  // Embedded Information
  categoryInfo?: { name: string, description?: string },
  creatorInfo: { firstName?: string, lastName?: string, email: string, imageUrl?: string },
  organizationInfo?: { name: string, slug: string, logo?: string },
  
  // Product Details
  slug: string,
  title: string,
  description?: string,
  discountLabel?: string,
  supposedPrice?: number,
  rating: number,
  reviewsCount: number,
  imageUrl: string[],
  tags: string[],
  isBestPrice: boolean,
  inventory: number,
  inventoryType: "PREORDER" | "STOCK",
  
  // Variants
  variants: Array<{
    variantId: string,
    variantName: string,
    price: number,
    inventory: number,
    orderCount: number,
    inCartCount: number,
    isPopular: boolean,
    createdAt: number,
    updatedAt: number,
  }>,
  
  // Analytics
  totalVariants: number,
  minPrice?: number,
  maxPrice?: number,
  totalOrders: number,
  viewCount: number,
  
  // Recent Reviews (embedded for quick access)
  recentReviews: Array<{
    reviewId: Id<"reviews">,
    userId: Id<"users">,
    userName: string,
    userImage?: string,
    rating: number,
    comment?: string,
    createdAt: number,
  }>,
  
  createdAt: number,
  updatedAt: number,
}
```

## Mutations

### createProduct
Creates a new product with variants.

**Parameters:**
- `organizationId?: Id<"organizations">` - Organization context (optional for global products)
- `categoryId?: Id<"categories">` - Product category
- `title: string` - Product title (2-200 chars)
- `description?: string` - Product description (max 2000 chars)
- `slug?: string` - URL slug (auto-generated if not provided)
- `discountLabel?: string` - Discount label (max 50 chars)
- `supposedPrice?: number` - Original price before discount
- `imageUrl: string[]` - Product images (required, at least 1)
- `tags?: string[]` - Product tags
- `isBestPrice?: boolean` - Best price indicator
- `inventory: number` - Total inventory count
- `inventoryType: "PREORDER" | "STOCK"` - Inventory type
- `variants: Array<{ variantName: string, price: number, inventory: number }>` - Product variants (required, at least 1)

**Permissions:**
- Organization products: Requires `MANAGE_PRODUCTS` permission
- Global products: System admin only

**Validations:**
- Unique slug within organization/global scope
- Unique variant names
- Positive prices and non-negative inventory
- Category belongs to same organization

### updateProduct
Updates an existing product.

**Parameters:**
- `productId: Id<"products">` - Product to update
- All create parameters as optional updates

**Permissions:**
- Organization products: Requires `MANAGE_PRODUCTS` permission
- Own products: Creator can update
- Global products: System admin only

### deleteProduct
Soft deletes a product.

**Parameters:**
- `productId: Id<"products">` - Product to delete

**Effects:**
- Updates category product counts
- Sets `isDeleted: true`

### restoreProduct
Restores a soft-deleted product.

**Parameters:**
- `productId: Id<"products">` - Product to restore

### updateProductStats
Updates product statistics (typically called by system).

**Parameters:**
- `productId: Id<"products">` - Product to update
- `incrementViews?: number` - Views to add
- `incrementOrders?: number` - Orders to add
- `newRating?: number` - New average rating
- `newReviewsCount?: number` - New review count
- `variantUpdates?: Array<{ variantId: string, incrementOrders?: number, incrementInCart?: number, newInventory?: number }>` - Variant-specific updates

## Queries

### getProducts
Retrieves products with comprehensive filtering and pagination.

**Parameters:**
- `organizationId?: Id<"organizations">` - Filter by organization
- `categoryId?: Id<"categories">` - Filter by category
- `postedById?: Id<"users">` - Filter by creator
- `inventoryType?: "PREORDER" | "STOCK"` - Filter by inventory type
- `isBestPrice?: boolean` - Filter by best price flag
- `tags?: string[]` - Filter by tags (any match)
- `minRating?: number` - Minimum rating filter
- `maxRating?: number` - Maximum rating filter
- `minPrice?: number` - Minimum price filter (uses variant min price)
- `maxPrice?: number` - Maximum price filter (uses variant max price)
- `hasInventory?: boolean` - Filter by inventory availability
- `includeDeleted?: boolean` - Include soft-deleted products
- `sortBy?: "newest" | "oldest" | "rating" | "price_low" | "price_high" | "popular" | "orders" | "views"` - Sort order
- `limit?: number` - Page size (default: 50)
- `offset?: number` - Page offset

**Returns:**
```typescript
{
  products: Doc<"products">[],
  total: number,
  offset: number,
  limit: number,
  hasMore: boolean,
}
```

### getProductById
Retrieves a product by ID.

**Parameters:**
- `productId: Id<"products">` - Product ID
- `includeDeleted?: boolean` - Include if soft-deleted

### getProductBySlug
Retrieves a product by slug within organization or global scope.

**Parameters:**
- `slug: string` - Product slug
- `organizationId?: Id<"organizations">` - Organization context
- `includeDeleted?: boolean` - Include if soft-deleted

### searchProducts
Full-text search across products.

**Parameters:**
- `query: string` - Search query (required)
- `organizationId?: Id<"organizations">` - Scope to organization
- `categoryId?: Id<"categories">` - Scope to category
- `includeDeleted?: boolean` - Include soft-deleted
- `limit?: number` - Page size (default: 50)
- `offset?: number` - Page offset

**Search Fields:**
- Product title
- Product description
- Tags
- Creator name
- Organization name
- Category name

**Returns:**
```typescript
{
  products: Doc<"products">[],
  total: number,
  offset: number,
  limit: number,
  hasMore: boolean,
  query: string,
}
```

### getPopularProducts
Retrieves popular products based on weighted scoring.

**Parameters:**
- `organizationId?: Id<"organizations">` - Scope to organization
- `categoryId?: Id<"categories">` - Scope to category
- `timeframe?: "day" | "week" | "month" | "all"` - Time-based filtering
- `limit?: number` - Page size (default: 20)
- `offset?: number` - Page offset

**Popularity Scoring:**
- Orders: 40% weight
- Rating × Reviews: 30% weight
- Views: 20% weight
- Review count: 10% weight

### getProductAnalytics
Comprehensive product analytics.

**Parameters:**
- `productId?: Id<"products">` - Specific product analytics
- `organizationId?: Id<"organizations">` - Organization scope
- `categoryId?: Id<"categories">` - Category scope
- `timeframe?: "day" | "week" | "month" | "quarter" | "year" | "all"` - Time filtering
- `groupBy?: "day" | "week" | "month"` - Future: time series grouping

**Single Product Returns:**
```typescript
{
  totalProducts: 1,
  totalViews: number,
  totalOrders: number,
  totalRevenue: number,
  averageRating: number,
  totalReviews: number,
  totalVariants: number,
  inventoryCount: number,
  activeVariants: number,
  topVariants: Array<{
    variantId: string,
    variantName: string,
    price: number,
    orderCount: number,
    inventory: number,
    revenue: number,
  }>,
  product: Doc<"products">,
}
```

**Aggregate Returns:**
```typescript
{
  totalProducts: number,
  totalViews: number,
  totalOrders: number,
  totalRevenue: number,
  totalReviews: number,
  totalVariants: number,
  totalInventory: number,
  averageRating: number,
  averageOrdersPerProduct: number,
  averageRevenuePerProduct: number,
  averageRevenuePerOrder: number,
  topProducts: Array<{ productId, title, slug, imageUrl, totalOrders, viewCount, rating, reviewsCount, revenue, variants }>,
  categoryBreakdown: Array<{ categoryId?, categoryName, productCount, totalOrders, totalViews }>,
  timeframe: string,
}
```

## Database Indexes

The products table uses the following indexes for optimal query performance:

- `by_slug` - For slug lookups
- `by_isDeleted` - For basic filtering
- `by_organization` - For organization-scoped queries
- `by_category` - For category filtering
- `by_creator` - For user's products
- `by_rating` - For rating-based sorting
- `by_organization_category` - For combined filtering
- `by_tags` - For tag-based queries
- `by_inventory_type` - For inventory type filtering
- `by_best_price` - For best price filtering
- `by_view_count` - For popularity sorting

## Error Handling

All mutations and queries include comprehensive error handling:

- Input validation with descriptive error messages
- Permission checks with specific error types
- Existence validation for related entities
- Business rule enforcement (e.g., unique slugs, variant names)
- Graceful handling of edge cases

## Performance Considerations

- Embedded data reduces need for joins
- Strategic indexes for common query patterns
- Pagination for all list operations
- Optimized popularity calculations
- Efficient search using multiple criteria

## Usage Examples

```typescript
// Create a product
const productId = await ctx.runMutation(api.products.mutations.createProduct, {
  organizationId: "org123",
  categoryId: "cat456",
  title: "Gaming Laptop",
  description: "High-performance laptop for gaming",
  imageUrl: ["https://example.com/image1.jpg"],
  inventory: 50,
  inventoryType: "STOCK",
  variants: [
    { variantName: "16GB RAM", price: 129999, inventory: 25 },
    { variantName: "32GB RAM", price: 149999, inventory: 25 }
  ]
});

// Search products
const results = await ctx.runQuery(api.products.queries.searchProducts, {
  query: "gaming laptop",
  organizationId: "org123",
  limit: 20
});

// Get popular products
const popular = await ctx.runQuery(api.products.queries.getPopularProducts, {
  timeframe: "week",
  limit: 10
});

// Get analytics
const analytics = await ctx.runQuery(api.products.queries.getProductAnalytics, {
  organizationId: "org123",
  timeframe: "month"
});
```
