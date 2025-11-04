<!-- 34e48d2d-9e47-4414-812f-6312cc250622 1aac37e0-b371-42a7-ae5c-594a54f28216 -->

# Gate Add-to-Cart for Public Org Products with Join Dialog

## What we’ll build

- UI guard: If a product belongs to a PUBLIC organization and the user is not a member, intercept add-to-cart and show a branded join dialog.
- Join flow: Dialog calls the existing joinPublicOrganization mutation to auto-join, then retries add-to-cart on success.
- Auth awareness: If unauthenticated, route to sign-in before joining.

## Key files to update

- `src/features/products/components/product-card.tsx`: intercept add-to-cart button.
- `src/features/products/components/product-detail.tsx`: intercept add-to-cart button.
- `src/features/organizations/components/join-organization-dialog.tsx` (new): reusable dialog UI.
- `src/features/common/` (optional tiny hook): `use-organization-membership.ts` to check if user is a member; uses `api.organizations.queries.getOrganizationsByUser`.

## Existing backend we’ll leverage

- Join: `api.organizations.mutations.joinPublicOrganization` (from `convex/organizations/mutations/joinPublicOrganization.ts`).
- Membership data: `api.organizations.queries.getOrganizationsByUser` for current user’s active memberships.
- Org info (if needed): `api.organizations.queries.getOrganizationById` to read `organizationType` when not on the product object.

## Implementation outline

1. Create `JoinOrganizationDialog` component

- Uses `components/ui/dialog` and existing `components/ui/button`.
- Props: `open`, `onOpenChange`, `organizationId`, `organizationName`, `organizationLogoUrl?`, `onJoined`.
- Content: playful mascot/emoji, concise brand-consistent copy, benefits bullets, actions: Cancel, Join Organization (primary), subtle Learn More link to `/(storefront)/o/[slug]` when slug present.
- Behavior: On Join → call `useMutation(api.organizations.mutations.joinPublicOrganization)`; show loading, handle errors; on success: `onJoined()` and close.

2. Add `useOrganizationMembership` helper

- Accepts `organizationId`.
- `useQuery(api.organizations.queries.getOrganizationsByUser, { userId: currentUserId, isActive: true })` → derive `isMember` by `some(m => m._id === organizationId)`.
- If user not logged in, return `{ isAuthenticated: false, isMember: false }`.

3. Wire into product-card add

- In `product-card.tsx`, find the add-to-cart handler.
- Determine `organizationId` and `organizationType` (from product, else `getOrganizationById`).
- If `organizationType === 'PUBLIC'` and `!isMember`:
- Prevent add mutation
- Open `JoinOrganizationDialog` with product’s org details
- After join success, retry original add-to-cart with same payload

4. Wire into product-detail add

- Mirror the same guard and dialog flow in `product-detail.tsx`.

5. Auth redirect

- If unauthenticated, pressing Join should first navigate to `/(main)/(auth)/sign-in` with a `returnUrl` back to the product page, then continue flow.

6. UX polish

- Disable add-to-cart button while join dialog is trying; use `aria-busy` and `aria-disabled` appropriately.
- Toasts for success/failure via existing `lib/toast.ts`.

7. (Optional) Retry strategy

- After join completes, immediately call the same add-to-cart mutation; on success, show success toast and close dialog.

## Notes / Non-goals

- No server-side changes for PUBLIC org gating (per choice 1.b). Existing server remains permissive for PUBLIC.
- PRIVATE org behavior unchanged.

### To-dos

- [ ] Create JoinOrganizationDialog with join action and brand styling
- [ ] Add useOrganizationMembership hook using getOrganizationsByUser
- [ ] Intercept add-to-cart in product-card to open join dialog
- [ ] Intercept add-to-cart in product-detail to open join dialog
- [ ] Ensure unauthenticated users are routed to sign-in with returnUrl
- [ ] Retry add-to-cart automatically after successful join
