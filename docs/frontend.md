# Frontend Notes

The frontend is a Buyer-facing Next.js App Router application. It talks directly to:

- `catalog-service` for catalog search, filtering, sorting, pagination, categories, and item details.
- `procurement-service` for drafts, line items, header updates, submission, purchase order list/detail, lifecycle actions, and timeline history.

The catalog query contract is server-ready: `q`, `category`, `stock`, `sort`, `page`, and `pageSize` are synchronized with URL parameters. Larger datasets should keep search/filter/sort/pagination server-side behind the same API shape.

The browser keeps only a draft id pointer so refreshes can resume an active draft. Purchase order data and business rules are owned by `procurement-service`.
