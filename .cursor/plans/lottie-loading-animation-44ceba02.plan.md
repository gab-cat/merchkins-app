<!-- 44ceba02-01d2-48b7-aac8-3d134bd47e7f 6c2c6bea-7931-4b84-bbb2-7539bf9a7e8d -->

# Lottie Loading Logo Animation Implementation

## Overview

Implement a handwriting-style "Merchkins" text animation using Lottie JSON format, integrated as a global loading indicator for Next.js 16 App Router that works for both route transitions and initial page loads.

## Implementation Steps

### 1. Install Dependencies

- Install `lottie-react` package using bun
- This package allows rendering Lottie animations in React components

### 2. Create Lottie Animation JSON

- Create a handwriting-style animation JSON file for "Merchkins" text
- Store the animation JSON in `public/lotties/merchkins-loading.json`
- Animation should:
- Spell out "Merchkins" letter by letter in handwriting style
- Use brand colors: #adfc04 (green) for "kins" part and white for "Merch"
- Loop continuously
- Be smooth and professional
- Note: Since we can't use After Effects, we'll create a programmatic Lottie JSON structure that animates text stroke paths to simulate handwriting

### 3. Create Root-Level Loading Component

- Create `app/loading.tsx` file
- This handles route transitions automatically in Next.js App Router
- Component should:
- Be a client component (use "use client")
- Use Lottie component to render the animation
- Center the animation on screen with full viewport height
- Use brand colors for background (white) and ensure animation colors match brand

### 4. Create Initial Page Load Loading Component

- Create a client-side loading component for initial page load
- Add to `app/layout.tsx` to show during app initialization
- Component should:
- Show on initial mount
- Hide once page is fully loaded
- Use the same Lottie animation
- Be positioned as an overlay on top of the page content

### 5. Styling and Brand Integration

- Ensure loading animation uses Merchkins brand colors:
- Background: white (#ffffff)
- Text "Merch": white
- Text "kins": #adfc04 (green) to match `.font-genty` styling
- Make the animation responsive and centered
- Ensure it doesn't interfere with existing layout

### 6. Test Implementation

- Verify loading animation appears during route transitions
- Verify loading animation appears on initial page load
- Check that animation displays correctly on different screen sizes
- Ensure animation colors match brand guidelines

## Files to Create/Modify

**New Files:**

- `public/lotties/merchkins-loading.json` - Lottie animation JSON file
- `app/loading.tsx` - Root-level loading component for route transitions
- `src/components/initial-loading.tsx` - Client component for initial page load

**Files to Modify:**

- `app/layout.tsx` - Add initial loading component integration
- `package.json` - Add lottie-react dependency

## Technical Considerations

- Lottie JSON will be created programmatically to simulate handwriting effect using stroke path animations
- Need to ensure "use client" directive is used for components that use Lottie (since it requires browser APIs)
- Animation should be optimized for performance (reasonable file size)
- Loading state should be smooth and not jarring to users
