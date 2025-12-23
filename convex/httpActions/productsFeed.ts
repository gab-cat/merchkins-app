import { api } from '../_generated/api';
import { httpAction } from '../_generated/server';
import { buildPublicUrl } from '../helpers';

export const productsFeedHandler = httpAction(async (ctx) => {
  try {
    // Fetch all active products
    const products = await ctx.runQuery(api.products.queries.index.getAllActiveProducts, {});

    // Build the RSS/XML feed
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

    const escapeXml = (text: string | undefined | null): string => {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    };

    const productItems = products
      .map(
        (product: {
          _id: string;
          title: string;
          description?: string;
          slug: string;
          minPrice?: number;
          variants?: { price: number }[];
          imageUrl?: string[];
          inventory: number;
          organizationInfo?: { slug: string; name: string };
        }) => {
          // Get the first variant's price or minPrice
          const price = product.minPrice ?? product.variants?.[0]?.price ?? 0;
          const imageUrl = product.imageUrl?.[0] || '';
          const productUrl = product.organizationInfo?.slug
            ? `${baseUrl}/o/${product.organizationInfo.slug}/p/${product.slug}`
            : `${baseUrl}/p/${product.slug}`;

          // Determine availability based on inventory
          const availability = product.inventory > 0 ? 'in_stock' : 'out_of_stock';

          // Use product _id as the unique identifier
          const productId = product._id;

          return `    <item>
      <g:id>${escapeXml(productId)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(product.description || product.title)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(buildPublicUrl(imageUrl))}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} PHP</g:price>
      <g:brand>${escapeXml(product.organizationInfo?.name || 'Merchkins')}</g:brand>
    </item>`;
        }
      )
      .join('\n');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Merchkins - Product Feed</title>
    <link>${baseUrl}</link>
    <description>Product feed for Google Merchant Center</description>
${productItems}
  </channel>
</rss>`;

    return new Response(xmlFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating product feed:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
