---
title: Team Roles & Permissions
description: How to add staff members and control what they can access in your store.
category: administration
icon: Shield
lastUpdated: 2025-12-17
---

# Team Roles & Permissions

## Overview

You don't have to run your store alone. You can invite staff members to help you manage orders, products, or chats. The **Permissions System** lets you control exactly what each team member can see and do.

---

## The 4 Main Roles

### 1. Owner

- **Who is this?** The person who created the organization.
- **Access:** Everything.
- **Special Power:** Cannot be removed by anyone. Only the Owner can delete the organization.

### 2. Admin

- **Best for:** Co-founders or Store Managers.
- **Access:** Full administrative access. By default, they have all permissions enabled. They can manage other members and change store settings.

### 3. Staff

- **Best for:** Employees with specific jobs (e.g., Order Packer, Customer Support).
- **Access:** Limited. They can only do what you specifically allow them to do.

### 4. Member

- **Best for:** Interns or observers.
- **Access:** Read-only by default. They can view things but usually cannot make changes.

---

## Granular Permissions

Below are the specific permission codes available in the system:

### Organization Management

| Permission            | Description                                                   |
| :-------------------- | :------------------------------------------------------------ |
| `Manage Organization` | Update organization name, slug, logo, and theme settings.     |
| `Manage Members`      | Invite members, remove members, and manage roles/permissions. |
| `Manage Storefront`   | Configure storefront settings and applications.               |

### Product & Inventory

| Permission          | Description                                               |
| :------------------ | :-------------------------------------------------------- |
| `Manage Products`   | Create, view, update, and delete products.                |
| `Manage Categories` | Create, view, update, and delete product categories.      |
| `Manage Vouchers`   | Create, view, update, and delete vouchers and promotions. |

### Order & Financial

| Permission        | Description                                         |
| :---------------- | :-------------------------------------------------- |
| `Manage Orders`   | Create, view, update, and delete orders.            |
| `Manage Payments` | View and process payments.                          |
| `Manage Payouts`  | Configure payout settings and view payout invoices. |
| `Manage Refunds`  | Approve or reject refund requests.                  |

### Support & Communication

| Permission             | Description                                     |
| :--------------------- | :---------------------------------------------- |
| `Manage Tickets`       | View and respond to support tickets.            |
| `Manage Announcements` | Create, view, update, and delete announcements. |
| `Manage Logs`          | View and manage system logs for auditing.       |

---

## Common Staff Roles (Examples)

Instead of confusing codes, think of permissions by "Job Title". Here is how you might set up common roles:

### The "Order Packer"

- **Goal:** Needs to see orders and mark them as packed/shipped.
- **Permissions to Give:** `Manage Orders` (Read & Update)
- **What they CAN'T do:** They cannot delete products or see your payout earnings.

### The "Billing Admin"

- **Goal:** Needs to handle payments, payouts, and refunds.
- **Permissions to Give:** `Manage Payments`, `Manage Payouts`, `Manage Refunds`.
- **What they CAN'T do:** They cannot change the store's theme or invite new members.

---

## How to Add a Team Member

1.  Go to **Admin > Organization Members**.
2.  Click **Add Member**.
3.  Enter their **Email Address**.
4.  Choose a **Role** (e.g., Staff).
5.  Check the boxes for the **Permissions** they need.
6.  Click **Send Invite**.

They will receive an email to join your team!

---

## Frequently Asked Questions

### Can I change a member's permissions later?

Yes! Just go to the member list, click "Edit Permissions" next to their name, and check/uncheck the boxes.

### Can staff members delete my store?

No. Only the **Owner** has the power to perform critical actions like deleting the organization.

### What if an employee leaves?

You should remove them immediately. Go to the member list and click **Remove**. They will lose access instantly.
