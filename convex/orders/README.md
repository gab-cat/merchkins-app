# Orders Domain

This domain manages order creation, updates, cancellation, deletion, restoration, and analytics. It mirrors the structure of other domains with arg/handler separation and `index.ts` exports.

## Mutations

- createOrder
- updateOrder
- cancelOrder
- deleteOrder
- restoreOrder
- updateOrderStats (internal)

## Queries

- getOrders
- getOrderById
- getOrderAnalytics
- searchOrders

## Permissions

- Organization-scoped orders require `MANAGE_ORDERS` with appropriate action.
- Global orders (no organization) can be created by the customer; staff/admins can create on behalf of others.

## Notes

- Inventory enforcement for STOCK products, variant-aware.
- Item snapshots embedded for small orders; separate `orderItems` for large orders.
- Status transitions are validated; history keeps last 5 changes.
