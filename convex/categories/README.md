# Categories Domain

This document describes the categories domain implementation, which provides a complete category management system with hierarchical support, analytics, and robust permission controls.

## Overview

The categories domain enables organizations to create and manage product categories with the following features:

- **Hierarchical Structure**: Support for parent-child relationships with up to 3 levels deep
- **Organization Scoping**: Categories can be global or organization-specific
- **Rich Metadata**: SEO fields, images, colors, tags, and display ordering
- **Analytics**: Product counts, order counts, revenue tracking
- **Permission-Based Access**: Integrated with the organization permission system
- **Soft Delete**: Categories can be deleted and restored
- **Slug Management**: Unique slugs within organization scope

## Data Model

The categories are defined in `convex/models/categories.ts` with the following key fields:

### Core Fields
- `name`: Category name (required, 2-100 characters)
- `description`: Optional category description
- `slug`: URL-friendly identifier (auto-generated from name if not provided)
- `isActive`: Whether the category is active
- `isDeleted`: Soft delete flag

### Hierarchy
- `parentCategoryId`: Reference to parent category
- `parentCategoryName`: Denormalized parent name for performance
- `level`: Numeric level (0=root, 1=subcategory, 2=sub-subcategory)

### Organization
- `organizationId`: Optional organization scope (null for global categories)
- `organizationInfo`: Embedded organization details for performance

### Display & SEO
- `imageUrl`: Category image
- `iconUrl`: Category icon
- `color`: Theme color (hex)
- `displayOrder`: Sort order within level
- `isFeatured`: Featured category flag
- `seoTitle`: SEO meta title
- `seoDescription`: SEO meta description
- `tags`: Array of search tags

### Analytics
- `productCount`: Total products in category
- `activeProductCount`: Active products count
- `totalOrderCount`: Total orders containing category products
- `totalRevenue`: Total revenue from category products

## Mutations

### createCategory
Creates a new category with validation and permission checks.

**Features:**
- Organization permission validation (`MANAGE_CATEGORIES` + `create`)
- Slug uniqueness checking within organization scope
- Parent category validation and level calculation
- Global category creation (system admins only)
- Hierarchical depth limiting (max 3 levels)

**Example:**
```typescript
await createCategory({
  organizationId: "org123",
  name: "Electronics",
  description: "Electronic devices and accessories",
  slug: "electronics", // Optional, auto-generated if not provided
  imageUrl: "https://example.com/electronics.jpg",
  color: "#3b82f6",
  tags: ["tech", "gadgets"],
  isFeatured: true,
  displayOrder: 1
});
```

### updateCategory
Updates an existing category with comprehensive validation.

**Features:**
- Permission validation for organization categories
- Slug uniqueness checking when slug is changed
- Circular reference prevention in parent relationships
- Cascading level updates for descendants
- Comprehensive field validation

### deleteCategory
Soft deletes a category with safety checks.

**Features:**
- Prevents deletion of categories with active products
- Prevents deletion of categories with subcategories
- Optional hard delete for system administrators
- Audit logging

### restoreCategory
Restores a soft-deleted category.

**Features:**
- Slug uniqueness validation before restore
- Parent category existence validation
- Permission checking

### updateCategoryStats (Internal)
Updates category statistics - used internally by product/order mutations.

**Features:**
- Atomic stat updates
- Recursive parent stat updates
- Graceful handling of deleted categories

## Queries

### getCategoryById
Retrieves a single category by ID.

### getCategoryBySlug
Retrieves a category by slug with organization scoping.

### getCategories
Advanced category listing with filtering and pagination.

**Features:**
- Organization scoping
- Parent category filtering
- Level filtering
- Active/featured filtering
- Include deleted option
- Pagination support
- Optimized index usage

**Example:**
```typescript
const result = await getCategories({
  organizationId: "org123",
  level: 0, // Root categories only
  isActive: true,
  limit: 20,
  offset: 0
});
```

### searchCategories
Full-text search across category names, descriptions, and tags.

**Features:**
- Cross-field search (name, description, tags)
- Relevance-based sorting
- Organization scoping
- Active filter option

### getCategoryHierarchy
Retrieves a category with its ancestors and descendants.

**Features:**
- Complete hierarchy navigation
- Optional ancestor/descendant inclusion
- Immediate children listing
- Hierarchical sorting

### getCategoryAnalytics
Comprehensive category analytics and statistics.

**Features:**
- Organization-wide or category-specific analytics
- Product and revenue metrics
- Level distribution analysis
- Top performers by various metrics
- Empty category identification

### getPopularCategories
Retrieves popular categories by various metrics.

**Features:**
- Sort by products, orders, or revenue
- Organization scoping
- Empty category filtering
- Configurable result limits

## Permission Integration

The categories domain integrates with the organization permission system:

- **MANAGE_CATEGORIES**: Required for create, update, delete, restore operations
- **Organization Scope**: Permissions are checked per organization
- **Global Categories**: Only system administrators can manage global categories
- **Action-Specific**: Permissions include action context (create, read, update, delete)

## Error Handling

The implementation includes comprehensive error handling:

- **Validation Errors**: Input validation with descriptive messages
- **Permission Errors**: Clear access denied messages
- **Business Logic Errors**: Circular reference prevention, depth limits
- **Not Found Errors**: Graceful handling of missing entities
- **Conflict Errors**: Slug uniqueness violations

## Performance Optimizations

- **Strategic Indexing**: Multiple indexes for common query patterns
- **Embedded Data**: Organization and parent info embedded for performance
- **Batch Operations**: Efficient descendant level updates
- **Query Optimization**: Index selection based on filter parameters

## Usage Examples

### Creating a Category Hierarchy

```typescript
// Create root category
const electronicsId = await createCategory({
  organizationId: "org123",
  name: "Electronics",
  isFeatured: true
});

// Create subcategory
const phonesId = await createCategory({
  organizationId: "org123",
  name: "Phones",
  parentCategoryId: electronicsId
});

// Create sub-subcategory
await createCategory({
  organizationId: "org123",
  name: "Smartphones",
  parentCategoryId: phonesId
});
```

### Analytics and Reporting

```typescript
// Get organization analytics
const analytics = await getCategoryAnalytics({
  organizationId: "org123"
});

// Get popular categories
const popular = await getPopularCategories({
  organizationId: "org123",
  metric: "revenue",
  limit: 5
});
```

### Category Management

```typescript
// Search categories
const results = await searchCategories({
  searchTerm: "electronics",
  organizationId: "org123",
  isActive: true
});

// Get category hierarchy
const hierarchy = await getCategoryHierarchy({
  categoryId: "cat123",
  includeDescendants: true,
  includeAncestors: true
});
```

## Best Practices

1. **Use descriptive names**: Category names should be clear and user-friendly
2. **Maintain hierarchy depth**: Keep categories within 3 levels for usability
3. **Optimize slugs**: Use SEO-friendly slugs for better discoverability
4. **Monitor analytics**: Regularly review category performance metrics
5. **Clean up empty categories**: Remove or restructure categories without products
6. **Use tags wisely**: Add relevant tags for better search functionality
7. **Set display orders**: Use displayOrder for consistent category presentation

## Integration Points

The categories domain integrates with:

- **Products**: Categories are assigned to products and affect product organization
- **Orders**: Category analytics are updated when orders are placed
- **Organizations**: Categories can be scoped to organizations
- **Permissions**: Access control is enforced through organization permissions
- **Search**: Categories can be searched and filtered across multiple dimensions

This implementation provides a robust, scalable category management system that can handle complex hierarchical structures while maintaining performance and data integrity.
