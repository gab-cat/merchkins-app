# Vouchers Module

This module provides a comprehensive voucher/coupon system for the Merchkins platform.

## Discount Types

- **PERCENTAGE**: Percentage off the order total (e.g., 10% off)
- **FIXED_AMOUNT**: Fixed amount off (e.g., ₱100 off)
- **FREE_ITEM**: Free item with purchase
- **FREE_SHIPPING**: Free shipping (future use)

## Features

- **Customizable codes**: Auto-generate with prefix or manual entry
- **Usage limits**: Total and per-user limits
- **Validity periods**: Start and end dates
- **Organization scoping**: Global or org-specific vouchers
- **Product/category restrictions**: Apply to specific items
- **Minimum order amount**: Require minimum spend
- **Maximum discount cap**: Cap percentage discounts

## Mutations

- `createVoucher`: Create a new voucher
- `updateVoucher`: Update voucher details
- `deleteVoucher`: Soft delete a voucher
- `toggleVoucherStatus`: Enable/disable a voucher

## Queries

- `getVouchers`: List vouchers with filters
- `getVoucherById`: Get voucher details with stats
- `getVoucherByCode`: Find voucher by code
- `validateVoucher`: Validate voucher for an order
