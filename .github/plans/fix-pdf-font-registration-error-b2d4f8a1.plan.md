---
name: 'Fix: PDF Font Registration Error'
overview: 'Fix the TypeError: dataUrl.split is not a function error in PDF generation by converting font Buffers to data URL strings.'
created: '2024-12-13'
status: 'completed'
priority: 'high'
estimated_effort: '30 minutes'
tags: ['bug', 'fix', 'pdf', 'fonts']
todos:
  - id: 1
    content: 'Update fetchFontBuffer to return data URL string instead of Buffer'
    status: complete
  - id: 2
    content: 'Update registerFonts to use the new data URL format'
    status: complete
  - id: 3
    content: 'Test PDF generation endpoint'
    status: pending
---

# Fix: PDF Font Registration Error

## Problem

The PDF generation endpoint at `/api/invoices/generate-pdf` throws:

```
TypeError: dataUrl.split is not a function. (In 'dataUrl.split(",")', 'dataUrl.split' is undefined)
```

**Root Cause:** The `@react-pdf/renderer` library's `Font.register()` function expects the `src` property to be a **string** (either a URL or a base64 data URL), but the current implementation passes **Buffer objects** directly.

## Root Cause Analysis

In [route.tsx](../../app/api/invoices/generate-pdf/route.tsx):

1. `fetchFontBuffer()` fetches fonts and returns `Buffer` objects
2. These Buffer objects are passed directly to `Font.register({ src: buffer })`
3. `@react-pdf/renderer` internally calls `dataUrl.split(",")` expecting a string
4. Since Buffer has no `.split()` method, the error is thrown

## Solution

Convert the fetched font data to base64 data URL strings before registering:

**Before:**

```typescript
async function fetchFontBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

**After:**

```typescript
async function fetchFontAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:font/truetype;base64,${buffer.toString('base64')}`;
}
```

## Files to Modify

- `app/api/invoices/generate-pdf/route.tsx` - Fix font registration

## To-Dos

- [x] Update `fetchFontBuffer` function to return data URL string
- [x] Rename function to `fetchFontAsDataUrl` for clarity
- [x] Update JSDoc comments
- [ ] Test PDF generation

---

## Revision History

| Date       | Author         | Changes              |
| ---------- | -------------- | -------------------- |
| 2024-12-13 | GitHub Copilot | Initial plan created |
