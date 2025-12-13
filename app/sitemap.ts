import { MetadataRoute } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  const sitemapEntries: MetadataRoute.Sitemap = [];

  try {
    // Add home page
    sitemapEntries.push({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });

    // Add search page
    sitemapEntries.push({
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    // Add landing page
    sitemapEntries.push({
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    // Fetch all public products
    try {
      // Get all products (this will include both global and org-specific products)
      // We'll filter to public org products and global products in the query
      const allProducts = await fetchQuery(api.products.queries.index.getProducts, {
        limit: 1000, // Large limit to get all products
        hasInventory: true, // Only include products with inventory
        includeDeleted: false,
      });

      for (const product of allProducts.products) {
        let url: string;
        let lastModified: Date;

        if (product.organizationId) {
          // Organization-specific product
          const org = await fetchQuery(api.organizations.queries.index.getOrganizationById, {
            organizationId: product.organizationId,
          });
          if (org && org.organizationType === 'PUBLIC' && !org.isDeleted) {
            url = `${baseUrl}/o/${org.slug}/p/${product.slug}`;
            lastModified = new Date(product.updatedAt || product.createdAt || Date.now());
            sitemapEntries.push({
              url,
              lastModified,
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        } else {
          // Global product
          url = `${baseUrl}/p/${product.slug}`;
          lastModified = new Date(product.updatedAt || product.createdAt || Date.now());
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching products for sitemap:', error);
    }

    // Fetch all categories
    try {
      const allCategories = await fetchQuery(api.categories.queries.index.getCategories, {
        limit: 100,
        includeDeleted: false,
        isActive: true,
      });

      for (const category of allCategories.categories) {
        let url: string;
        let lastModified: Date;

        if (category.organizationId) {
          // Organization-specific category
          const org = await fetchQuery(api.organizations.queries.index.getOrganizationById, {
            organizationId: category.organizationId,
          });
          if (org && org.organizationType === 'PUBLIC' && !org.isDeleted) {
            url = `${baseUrl}/o/${org.slug}/c/${category.slug}`;
            lastModified = new Date(category.updatedAt || category.createdAt || Date.now());
            sitemapEntries.push({
              url,
              lastModified,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        } else {
          // Global category
          url = `${baseUrl}/c/${category.slug}`;
          lastModified = new Date(category.updatedAt || category.createdAt || Date.now());
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
    }

    // Fetch all public organizations
    try {
      const allOrganizations = await fetchQuery(api.organizations.queries.index.getOrganizations, {
        limit: 100,
        organizationType: 'PUBLIC',
      });

      for (const org of allOrganizations.page) {
        const url = `${baseUrl}/o/${org.slug}`;
        const lastModified = new Date(org.updatedAt || org.createdAt || Date.now());
        sitemapEntries.push({
          url,
          lastModified,
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    } catch (error) {
      console.error('Error fetching organizations for sitemap:', error);
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemapEntries;
}
