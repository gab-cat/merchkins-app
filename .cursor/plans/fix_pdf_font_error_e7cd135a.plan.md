---
name: Fix PDF Font Error
overview: ""
todos:
  - id: fix-buffer-format
    content: Change fetchFontBuffer to return Buffer instead of Uint8Array
    status: completed
  - id: add-fallback
    content: Add try-catch with graceful fallback to built-in fonts (Helvetica)
    status: completed
  - id: update-styles
    content: Ensure styles reference fallback font family if custom fonts fail
    status: completed
  - id: test-pdf
    content: Test PDF generation to verify the fix works
    status: completed
---

# Fix PDF Generation "Unknown font format" Error

## Problem Analysis

The error `Unknown font format` occurs because `@react-pdf/renderer` uses `fontkit` internally for font parsing, which expects fonts to be provided as a `Buffer` (Node.js) or `ArrayBuffer`, not a `Uint8Array`. The current implementation passes `Uint8Array` directly to `Font.register()`.

```mermaid
flowchart LR
    A[Fetch Font URL] --> B[Convert to ArrayBuffer]
    B --> C[Create Uint8Array]
    C --> D[Font.register]
    D --> E[fontkit parses]
    E --> F[Error: Unknown font format]
```

## Solution

**Fix the font buffer format** in [`app/api/invoices/generate-pdf/route.tsx`](app/api/invoices/generate-pdf/route.tsx):

1. Change `fetchFontBuffer` to return `Buffer` instead of `Uint8Array`
2. Add graceful fallback to built-in fonts (Helvetica) if custom font loading fails
3. This ensures PDFs generate even in edge cases where font fetching might fail

### Key Changes

**Before (broken):**

```typescript
async function fetchFontBuffer(url: string): Promise<Uint8Array> {
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
```

**After (fixed):**

```typescript
async function fetchFontBuffer(url: string): Promise<Buffer> {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

### Fallback Strategy

If font registration fails, the styles will gracefully fall back to built-in PDF fonts (Helvetica, Times-Roman, Courier) which are always available without registration.

## Alternative Approaches (if needed)

If the Buffer fix doesn't resolve the issue in your environment:

1. **Use font source as async function** - `@react-pdf/renderer` supports `src: () => Promise<Buffer>`
2. **Embed fonts as base64** - Store font data as base64 strings in the codebase
3. **Switch to pdf-lib** - Already installed, but requires complete rewrite of the document structure

## Risk Assessment

- **Low risk** - This is a targeted fix to the buffer format
- The document structure, styling, and layout remain unchanged
- Built-in font fallback ensures invoices are always generated