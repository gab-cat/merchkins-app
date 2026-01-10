---
title: Organization Settings & Memberships
description: How to manage your store's identity, design, and team members.
category: administration
icon: Settings
lastUpdated: 2026-01-10
---

# Organization Settings & Memberships

Managing your organization effectively is key to a smooth business operation. This guide covers how to customize your store's identity and manage your team.

---

## Organization Settings

In the **Organization Settings** section, you can control the core identity of your store.

### General Information

- **Store Name:** The public name of your store.
- **Store Slug:** The URL identifier for your store (e.g., `merchkins.app/stores/your-slug`).
- **Logo:** Upload a high-quality logo that represents your brand.
- **Banner Image:** A decorative banner for your storefront.

### Customization & Theme

You can tailor the look and feel of your storefront to match your brand:

- **Primary & Secondary Colors:** Used for buttons, links, and accents.
- **Header & Footer Styling:** Customize background and foreground colors.
- **Typography:** Choose a font that fits your brand personality.
- **Border Radius:** Control the "roundness" of elements (none, small, medium, large).

> [!TIP]
> Use the **Theme Preview** to see how your changes look in real-time before saving.

---

## Membership Management

Merchkins is built for teams. You can invite others and control their access using granular permissions.

### Roles

The system supports four distinct roles:

1. **Owner:** Full control, includes billing and organization deletion.
2. **Admin:** Full management access, can manage members and settings.
3. **Staff:** Operational access, permissions must be explicitly granted.
4. **Member:** Read-only access by default.

### Inviting Members

1. Navigate to **Admin > Members**.
2. Click **Invite Member**.
3. Provide the invitee's email and select their role.
4. **Permissions:** For Staff and Member roles, you can fine-tune what they can do (Create, Read, Update, Delete) across different domains like Products, Orders, and Financials.

### Removing Members

Removing a member's access is instantaneous.

- Go to the member list.
- Click **Remove** next to their name.
- They will lose access to the organization immediately, though their past activity logs will remain for audit purposes.

---

## Security & Audit Logs

Every action performed by a member is logged in the **Audit Trail**.

- **Visibility:** Admins with `Manage Logs` permission can see who changed what and when.
- **Integrity:** The system prevents deleting the last Admin, ensuring you are never locked out of your own store.

---

## Frequently Asked Questions

### Can I have multiple Owners?

Currently, an organization can only have one **Owner** (the creator). However, you can have as many **Admins** as you need, who have nearly identical powers.

### What happens to a member's work if I remove them?

Their work (orders processed, products created) remains in the system. The "Creator" or "Updated By" fields will still show their name for historical reference.
