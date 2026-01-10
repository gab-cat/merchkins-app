/**
 * Email Preview API Route
 * Preview email templates in browser during development
 *
 * Usage: Navigate to /api/email-preview?template=refund-approved
 *
 * Available templates:
 * - refund-request-received
 * - refund-approved
 * - refund-rejected
 * - payout-invoice-ready
 * - payment-confirmation
 * - payment-received
 * - order-confirmation
 * - shipping-shipped
 * - shipping-out-for-delivery
 * - shipping-delivered
 * - shipping-ready-for-pickup
 * - welcome
 * - organization-invite
 */

import { NextRequest, NextResponse } from 'next/server';

// Import email templates directly for preview (avoiding Convex bundling)
import { generateEmailPreview, getAllTemplateTypes, type EmailTemplateType } from '../../../convex/helpers/emailTemplates/preview';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get('template') as EmailTemplateType | null;

  // If no template specified, return list of available templates
  if (!template) {
    const templates = getAllTemplateTypes();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Template Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f4f4f5;
          }
          h1 { color: #1d43d8; margin-bottom: 8px; }
          p { color: #6b7280; margin-bottom: 24px; }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }
          a {
            display: block;
            padding: 16px 20px;
            background: white;
            border-radius: 8px;
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            transition: all 0.2s;
            border: 1px solid #e5e7eb;
          }
          a:hover {
            border-color: #1d43d8;
            box-shadow: 0 4px 12px rgba(29, 67, 216, 0.15);
            transform: translateY(-2px);
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 11px;
            border-radius: 4px;
            margin-left: 8px;
            text-transform: uppercase;
            font-weight: 600;
          }
          .refund { background: #dbeafe; color: #1e40af; }
          .payout { background: #f0fdf4; color: #166534; }
          .order { background: #fef3c7; color: #92400e; }
          .shipping { background: #e0e7ff; color: #3730a3; }
          .welcome { background: #fce7f3; color: #9d174d; }
        </style>
      </head>
      <body>
        <h1>Email Template Preview</h1>
        <p>Click on a template to preview it with sample data.</p>
        <div class="grid">
          ${templates
            .map((t: EmailTemplateType) => {
              let badge = '';
              if (t.includes('refund')) badge = '<span class="badge refund">Refund</span>';
              else if (t.includes('payout') || (t.includes('payment') && !t.includes('received'))) badge = '<span class="badge payout">Payout</span>';
              else if (t.includes('payment-received')) badge = '<span class="badge payout">Payment</span>';
              else if (t.includes('order')) badge = '<span class="badge order">Order</span>';
              else if (t.includes('shipping')) badge = '<span class="badge shipping">Shipping</span>';
              else if (t.includes('welcome')) badge = '<span class="badge welcome">Welcome</span>';
              else if (t.includes('organization-invite')) badge = '<span class="badge welcome">Invite</span>';

              return `<a href="?template=${t}">${t.replace(/-/g, ' ')}${badge}</a>`;
            })
            .join('')}
        </div>
      </body>
      </html>
    `;
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Validate template type
  const validTemplates = getAllTemplateTypes();
  if (!validTemplates.includes(template)) {
    return NextResponse.json(
      {
        error: `Invalid template: ${template}`,
        availableTemplates: validTemplates,
      },
      { status: 400 }
    );
  }

  // Generate and return the email preview
  try {
    const { subject, html } = generateEmailPreview(template);

    // Return the raw HTML for browser preview
    // Note: Subject is encoded to handle non-ASCII characters (emoji, currency symbols)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Email-Subject': encodeURIComponent(subject),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: `Failed to generate preview: ${(error as Error).message}` }, { status: 500 });
  }
}
