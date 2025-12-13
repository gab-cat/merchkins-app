---
name: Invoice Page with PDF Download
overview: Convert the invoice PDF API route to a client-side page that renders an HTML preview of the invoice using `useQuery`, with a button to download the PDF client-side.
todos:
  - id: create-invoice-page
    content: Create the invoice page at app/(main)/invoices/[invoiceId]/page.tsx with useQuery
    status: pending
  - id: create-invoice-preview
    content: Create HTML invoice preview component matching PDF styling
    status: pending
  - id: create-pdf-download
    content: Create PDF download button with client-side @react-pdf generation
    status: pending
  - id: create-barrel-export
    content: Create index.ts barrel export for invoice components
    status: pending
  - id: test-functionality
    content: Test the invoice page renders correctly and PDF downloads work
    status: pending
---

# Invoice Page with Client-Side PDF Download

## Problem

The current API route at `/api/invoices/[invoiceId]/route.tsx `fails because `fetchQuery` is not receiving the `invoiceId` parameter correctly from Next.js dynamic route params.

## Solution

Create a client-side page that:

1. Uses Convex `useQuery` to fetch invoice data reactively
2. Renders an HTML invoice preview styled to match the PDF design
3. Provides a "Download PDF" button using `@react-pdf/renderer`'s client-side generation

## Architecture

```mermaid
flowchart LR
    subgraph Client["Client Side"]
        Page[Invoice Page]
        Preview[Invoice Preview HTML]
        PDF[PDF Download Button]
    end
    subgraph Convex["Convex Backend"]
        Query[getAuthorizedPayoutInvoice]
    end
    
    Page -->|useQuery| Query
    Query -->|invoice data| Page
    Page --> Preview
    Page --> PDF
    PDF -->|@react-pdf/renderer| Download[PDF File]
```

## Files to Create

### 1. Invoice Page

**Path**: [`app/(main)/invoices/[invoiceId]/page.tsx`](app/(main)/invoices/[invoiceId]/page.tsx)

Client component that:

- Extracts `invoiceId` from URL params
- Uses `useQuery(api.payouts.queries.index.getAuthorizedPayoutInvoice, { invoiceId })`
- Handles loading/error states
- Renders the invoice preview and download button

### 2. Invoice Preview Component

**Path**: [`src/features/invoices/components/invoice-preview.tsx`](src/features/invoices/components/invoice-preview.tsx)

HTML/Tailwind component that mirrors the PDF design:

- Header with brand and invoice number
- Invoice card with date, period, status
- Payee details section
- Financial summary (gross, fees, net)
- Stats grid (orders, items, fee %)
- Order summary table
- Footer

### 3. PDF Download Button Component

**Path**: [`src/features/invoices/components/pdf-download-button.tsx`](src/features/invoices/components/pdf-download-button.tsx)

Component that:

- Uses `@react-pdf/renderer`'s `pdf()` function for dynamic generation
- Registers fonts client-side with Google Fonts URLs
- Shows loading state during generation
- Triggers download of the generated PDF

### 4. Index Barrel Export

**Path**: [`src/features/invoices/components/index.ts`](src/features/invoices/components/index.ts)

Export all invoice components.

## Key Implementation Details

### Client-Side PDF Generation

Use dynamic `pdf().toBlob()` instead of `PDFDownloadLink` for better control:

```typescript
import { pdf } from '@react-pdf/renderer';
import { PayoutInvoiceDocument } from '@/lib/pdf/payout-invoice';

const handleDownload = async () => {
  const blob = await pdf(<PayoutInvoiceDocument invoice={invoiceData} />).toBlob();
  const url = URL.createObjectURL(blob);
  // trigger download
};
```

### Font Registration for Client

Modify [`lib/pdf/payout-invoice.tsx`](lib/pdf/payout-invoice.tsx) to support client-side font loading:

- Use direct Google Fonts URLs (already present)
- Fonts auto-load when PDF is rendered

### Convex Query

Reuse existing query from [`convex/payouts/queries/getAuthorizedPayoutInvoice.ts`](convex/payouts/queries/getAuthorizedPayoutInvoice.ts) - no changes needed.

## Optional Cleanup

After implementation, consider removing the API routes if no longer needed:

- [`app/api/invoices/[invoiceId]/route.tsx`](app/api/invoices/[invoiceId]/route.tsx)
- [`app/api/invoices/generate-pdf/route.tsx`](app/api/invoices/generate-pdf/route.tsx)