# Backend changes: "real tickets" metric for the branches sales report

## Why

The "Panel inteligente: Sucursales" dashboard (route `/business/sucursales/reports`) already
exposes a **"Venta Real"** KPI on the frontend (`src/features/branches/reports/components/SalesDashboard.tsx`).
"Venta Real" excludes lines whose product category is `Merma` or `Matados`, because those
categories are not real customer sales — they are internal stock adjustments
(waste and dead birds) recorded through the same sales pipeline.

We are adding a new KPI card to the dashboard: **"Tickets por día de la semana"**
(it shows the average number of tickets per weekday — Monday vs Saturday, etc.).
The frontend needs the same exclusion applied to the ticket count, otherwise the
"strongest day" and the daily averages will be inflated by waste-only tickets and
won't match the "Venta Real" story.

A new aggregated field is required because the current DTO does not expose
per-ticket category attribution, so the frontend cannot derive the number
client-side. This mirrors how `totalSales` is already server-aggregated.

## Endpoint

`GET /api/reports/sales?branchId=<id>&startDate=<ISO>&endDate=<ISO>`

(Branch-scoped, multi-tenant — the `X-Business-Code: branches` header is set
automatically by the frontend based on URL prefix, no change there.)

## Required response changes

### 1. `SalesSummaryDTO` — add one field

```jsonc
{
  "totalSales": 0,
  "totalUnits": 0,
  "totalSlaughtered": 0,
  "totalTickets": 0,
  "realTickets": 0,           // <-- NEW
  "totalChickenTickets": 0,
  "ticketsWithComplements": 0,
  "avgChickenOnlyTicketValue": 0,
  "avgFullTicketValue": 0
}
```

### 2. `DailySalesDTO` — add one field on every element

```jsonc
[
  {
    "day": "2026-06-15",
    "totalSales": 0,
    "totalTickets": 0,
    "realTickets": 0          // <-- NEW
  }
]
```

## Definition of `realTickets`

A ticket counts as **real** if **any of its line items** has
`product.categoryName` outside the set `{ "Merma", "Matados" }`.

In other words: drop tickets whose products are 100% `Merma` and/or `Matados`;
keep every other ticket, even if it also contains a `Merma` line.

### Worked examples

| Ticket contents                          | `totalTickets` | `realTickets` |
|------------------------------------------|----------------|---------------|
| Pollo, Verduras                          | +1             | +1            |
| Pollo, Merma, Verduras                   | +1             | +1 (has a non-Merma, non-Matados line) |
| Merma only                               | +1             | +0            |
| Matados only                             | +1             | +0            |
| Merma + Matados                          | +1             | +0            |
| Empty ticket (shouldn't exist, but safe) | +1             | +0            |

This matches the existing `ventasReales` filter on the frontend, which
excludes `Merma` and `Matados` products from `$ sales` but does not penalize
a real customer ticket that happens to have a `Merma` line on it.

## Implementation notes

- The definition is **per-ticket**, not per-line. The aggregation must happen
  at the ticket level, not the product level, otherwise the count would be
  inflated by tickets that contain both real products and waste lines.
- `realTickets` must satisfy: `realTickets <= totalTickets`, always.
- `realTickets` is a non-negative integer. `0` is a valid value.
- The frontend also uses `summary.realTickets` as the denominator of the
  existing "Ticket Promedio" KPI (`$ ventasReales / realTickets`), so the
  summary field must cover the same date range as the daily buckets.
- No other endpoints, headers, or pagination contracts change. No
  authentication, authorization, or tenant header changes.

## Frontend changes already shipped

These are the consumers of the new fields. They will not break the build if
the backend has not yet shipped the fields, but the UI will show `0` for the
new card and a `NaN`/`$0.00` for "Ticket Promedio" until the backend is
deployed.

- `src/features/branches/reports/api/salesReports.api.ts` — added `realTickets`
  to `SalesSummaryDTO` and `DailySalesDTO`
- `src/features/branches/reports/utils/ticketsByWeekday.ts` — helper now
  accepts a `(entry) => number` selector; defaults to `entry.totalTickets`
- `src/features/branches/reports/components/SalesDashboard.tsx` — passes
  `(entry) => entry.realTickets` to the helper; uses
  `summary.realTickets` as the denominator of `ticketPromedioReal`
- `src/features/branches/reports/components/TicketsByWeekdayCard.tsx` — no
  change (purely presentational)

## Suggested test cases for the backend PR

1. Branch with only Merma/Matados tickets in the range → `realTickets === 0`,
   `totalTickets > 0`, all per-day `realTickets` are `0`.
2. Branch with only real tickets → `realTickets === totalTickets`.
3. Branch with mixed tickets (real and waste) → `realTickets < totalTickets`,
   `realTickets + wasteTickets === totalTickets` where
   `wasteTickets` is the count of Merma+Matados-only tickets.
4. Day in range with zero transactions → per-day `realTickets === 0`,
   `totalTickets === 0`.
5. Boundary: ticket that contains `Merma` *and* a real product → counted in
   `realTickets`, not excluded.
