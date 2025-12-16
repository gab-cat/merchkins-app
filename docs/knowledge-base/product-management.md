---
title: Product Management
description: Creating and editing products, managing variants and inventory, stock levels, and category organization.
category: operations
icon: Package
lastUpdated: 2025-12-12
---

# Product Management Guide

## Overview

This guide covers creating, editing, and managing products in your storefront. Learn about product types, variants, inventory management, categories, and best practices.

---

## Quick Reference

| Aspect               | Details                               |
| -------------------- | ------------------------------------- |
| **Product Types**    | Physical products, digital products   |
| **Inventory Types**  | STOCK (tracked), PREORDER (unlimited) |
| **Variants**         | Size, color, style, etc.              |
| **Stock Management** | Automatic tracking for STOCK products |
| **Categories**       | Organize products by category         |
| **Images**           | Multiple images per product           |

---

## Creating Products

### Step 1: Navigate to Products

1. Go to Admin → Products
2. Click "Create New Product"

### Step 2: Basic Information

**Required Fields:**

- **Product Name** - Name of the product
- **Description** - Detailed product description
- **Price** - Base price (in cents/pesos)
- **Category** - Product category
- **Inventory Type** - STOCK or PREORDER

**Optional Fields:**

- **Slug** - URL-friendly identifier (auto-generated if not provided)
- **SKU** - Stock keeping unit
- **Tags** - Product tags for search
- **Status** - Active or inactive

### Step 3: Inventory Configuration

**Inventory Types:**

**STOCK:**

- Tracks available quantity
- Enforces stock limits
- Prevents overselling
- Stock decreases on order creation
- Stock restores on order cancellation

**PREORDER:**

- No stock tracking
- Unlimited orders accepted
- Used for pre-order items
- No inventory enforcement

**Stock Quantity:**

- Only for STOCK inventory type
- Set initial available quantity
- Update as inventory changes

### Step 4: Product Variants

**Creating Variants:**

1. Click "Add Variant"
2. Configure variant options:
   - Variant name (e.g., "Size", "Color")
   - Variant values (e.g., "Small", "Medium", "Large")
   - Price adjustment (optional)
   - Stock quantity (for STOCK products)

**Variant Examples:**

- **Size**: Small, Medium, Large, XL
- **Color**: Red, Blue, Green, Black
- **Style**: Regular, Premium, Deluxe
- **Material**: Cotton, Polyester, Blend

**Variant Pricing:**

- Base price applies to all variants
- Can add price adjustments per variant
- Example: +₱100 for Large size

### Step 5: Product Images

**Adding Images:**

1. Click "Add Image"
2. Upload product images
3. Set primary image (first image)
4. Reorder images by dragging

**Image Guidelines:**

- Use high-quality images
- Show product from multiple angles
- Include size/comparison images
- Optimize file sizes for web

### Step 6: Save Product

1. Review all information
2. Click "Create Product"
3. Product is immediately available (if active)

---

## Editing Products

### Updating Product Information

1. Navigate to product details
2. Click "Edit Product"
3. Update fields as needed
4. Save changes

**Editable Fields:**

- Name, description, price
- Category, tags, status
- Inventory type and stock
- Variants and images
- SKU and slug

### Updating Stock Levels

**For STOCK Products:**

1. Go to product details
2. Click "Update Stock"
3. Enter new quantity
4. Save changes

**Stock Updates:**

- Manual updates for inventory changes
- Automatic updates on orders
- Stock restores on cancellations

---

## Product Variants

### Variant Management

**Adding Variants:**

1. Edit product
2. Go to Variants section
3. Click "Add Variant"
4. Configure variant options
5. Save product

**Editing Variants:**

1. Edit product
2. Click variant to edit
3. Update variant details
4. Save changes

**Removing Variants:**

1. Edit product
2. Click variant to remove
3. Click "Delete Variant"
4. Confirm deletion

**Note:** Cannot delete variants that have been used in orders.

### Variant Stock Tracking

**Per-Variant Stock:**

- Each variant can have its own stock
- Track inventory per variant
- Example: Red (10), Blue (5), Green (8)

**Variant Stock Updates:**

- Update stock per variant
- Stock decreases when variant ordered
- Stock restores on cancellation

---

## Inventory Management

### Stock Tracking

**STOCK Products:**

- Real-time stock tracking
- Prevents overselling
- Automatic updates on orders
- Stock alerts when low

**Stock Levels:**

- **In Stock** - Available for purchase
- **Low Stock** - Below threshold (configurable)
- **Out of Stock** - Quantity is 0
- **Preorder** - PREORDER type (always available)

### Stock Updates

**Automatic Updates:**

- Stock decreases when order created
- Stock restores when order cancelled
- Variant-specific stock tracked

**Manual Updates:**

- Update stock when receiving inventory
- Adjust for damaged/lost items
- Correct inventory discrepancies

### Inventory Best Practices

1. **Regular Audits** - Count physical inventory regularly
2. **Update Promptly** - Update stock when receiving shipments
3. **Track Variants** - Monitor variant-specific stock
4. **Set Thresholds** - Configure low stock alerts
5. **Handle Discrepancies** - Adjust stock for errors

---

## Product Categories

### Category Organization

**Creating Categories:**

1. Go to Admin → Categories
2. Click "Create Category"
3. Enter category name and description
4. Set parent category (optional)
5. Save category

**Category Hierarchy:**

- Parent categories
- Subcategories
- Nested organization

**Assigning Categories:**

1. Edit product
2. Select category from dropdown
3. Can assign to one category
4. Save product

### Category Management

**Benefits:**

- Organize products logically
- Improve customer navigation
- Filter products by category
- Category-specific promotions

---

## Product Status

### Active Products

- Visible to customers
- Can be ordered
- Appears in storefront
- Included in search

### Inactive Products

- Hidden from customers
- Cannot be ordered
- Not in storefront
- Useful for:
  - Temporarily unavailable items
  - Seasonal products (off-season)
  - Discontinued items (keeping for records)

**Changing Status:**

1. Edit product
2. Toggle status (Active/Inactive)
3. Save changes

---

## Product Images

### Image Management

**Adding Images:**

1. Edit product
2. Go to Images section
3. Click "Add Image"
4. Upload image file
5. Set as primary (optional)

**Image Requirements:**

- Supported formats: JPG, PNG, WebP
- Recommended size: 1200x1200px
- File size: Under 5MB
- Aspect ratio: Square recommended

**Primary Image:**

- First image is primary
- Shown in product listings
- Featured in storefront
- Can be changed by reordering

**Image Order:**

- Drag to reorder images
- First image is primary
- Order matters for gallery

---

## Product Search & Filtering

### Search Features

Customers can search by:

- Product name
- Description
- SKU
- Tags
- Category

### Filtering Options

Filter products by:

- Category
- Price range
- Inventory type
- Status
- Tags

---

## Common Scenarios

### Scenario 1: Create Product with Variants

**Product:** T-Shirt

**Variants:**

- Size: Small, Medium, Large, XL
- Color: Red, Blue, Black

**Configuration:**

- Base price: ₱500
- Large size: +₱50
- XL size: +₱100
- Stock per variant: 20 each

**Result:** Product with 8 variants (4 sizes × 2 colors)

---

### Scenario 2: Preorder Product

**Product:** Limited Edition Item

**Configuration:**

- Inventory type: PREORDER
- No stock tracking
- Accept unlimited orders
- Set release date in description

**Result:** Customers can preorder, no stock limits

---

### Scenario 3: Update Stock After Shipment

**Flow:**

1. Receive shipment of 50 units
2. Go to product details
3. Click "Update Stock"
4. Add 50 to current stock
5. Save changes

**Result:** Stock increased by 50 units

---

### Scenario 4: Temporarily Disable Product

**Flow:**

1. Product out of stock temporarily
2. Edit product
3. Set status to Inactive
4. Save changes

**Result:** Product hidden from storefront until reactivated

---

## Best Practices

### Product Creation

1. **Complete Information** - Fill all relevant fields
2. **Clear Descriptions** - Write detailed, clear descriptions
3. **Quality Images** - Use high-quality product images
4. **Accurate Pricing** - Set correct prices
5. **Proper Categories** - Assign to appropriate categories

### Inventory Management

1. **Track Stock Accurately** - Keep stock levels updated
2. **Monitor Variants** - Track variant-specific inventory
3. **Set Alerts** - Configure low stock notifications
4. **Regular Audits** - Count physical inventory regularly
5. **Handle Discrepancies** - Adjust for errors promptly

### Variant Management

1. **Clear Variant Names** - Use descriptive variant names
2. **Logical Values** - Organize variant values logically
3. **Price Adjustments** - Set fair price adjustments
4. **Stock Per Variant** - Track stock for each variant
5. **Test Combinations** - Verify variant combinations work

### Product Organization

1. **Use Categories** - Organize products by category
2. **Add Tags** - Use tags for better searchability
3. **Consistent Naming** - Use consistent naming conventions
4. **SKU Management** - Use unique SKUs for tracking
5. **Status Management** - Keep inactive products hidden

---

## Frequently Asked Questions

### Q: Can I change a product's inventory type after creation?

**A:** Yes, but be careful. Changing from STOCK to PREORDER will remove stock tracking. Changing from PREORDER to STOCK requires setting initial stock.

### Q: What happens to orders if I change a product's price?

**A:** Existing orders keep their original price. Only new orders use the updated price.

### Q: Can I delete a product that has orders?

**A:** Products with orders cannot be deleted. Instead, set status to Inactive to hide it.

### Q: How many variants can a product have?

**A:** There's no hard limit, but keep it manageable. Too many variants can be confusing for customers.

### Q: What's the difference between STOCK and PREORDER?

**A:** STOCK tracks available quantity and enforces limits. PREORDER accepts unlimited orders without stock tracking.

### Q: Can I update stock for multiple variants at once?

**A:** Currently, stock must be updated per variant. Bulk updates may be added in future updates.

---

## Related Articles

- [Order Management](./order-management.md)
- [Categories Management](../convex/categories/README.md)




