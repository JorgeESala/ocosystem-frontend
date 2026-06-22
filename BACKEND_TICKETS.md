# Backend follow-up tickets

Items the frontend has identified as needing backend work. Open issues / PRs in
the backend repo and link them here as they are created.

---

## [TICKET-001] Batch sales: support multi-batch fetch

**Status:** open
**Reported:** 2026-06-19
**Refreshed:** 2026-06-19 (URLs updated to `/api/v1/*` after the cutover; bulk-endpoint spec added)
**Frontend context:** `src/features/batch/branch/BranchGlobalSummary.tsx`, page `/business/sucursales/salesAndBatches`
**Severity:** medium (perf), low (correctness)
**Effort estimate:** S (single new endpoint, no schema change)

### Problem

The branches `salesAndBatches` page needs the full set of `BranchesBatchSale` for
every batch in the current filter, so the "Cuentas pendientes" / "Pollos
disponibles" summary tabs can show per-branch and per-batch aggregates.

Today, the only way to fetch sales for a batch is:

```
GET /api/v1/batch-sales/batch/{batchId}
```

Result: the page fires `1 + 1 + N` HTTP requests on initial mount (branches,
batches/latest, and one per-batch sales call). With the default
`?limit=15` that is **17 requests** before the user has clicked anything.

The same fan-out repeats every time the user clicks **Buscar** and the search
returns M new batch ids that were not in the `latest` cache, adding
`M` more requests. The pattern is also N+1 in the worst case: backend
throughput scales linearly with the number of batches on the page.

### Proposed API

Add a single endpoint that returns the union of `BranchesBatchSale` for a list
of batch ids, matching the existing `/api/v1/batches/search` style:

```
POST /api/v1/batch-sales/search
Content-Type: application/json

{
  "batchIds": [1, 2, 3, 4, 5]
}
```

Response: `200 OK` with the same `BatchSaleItemResponseDTO[]` shape that
`GET /api/v1/batch-sales/batch/{batchId}` returns today. No reordering, no
deduplication — the frontend sorts and groups client-side.

#### Why POST (not GET)

- Mirrors the existing `POST /api/v1/batches/search` style, so the surface
  area is consistent.
- A future expansion of the body (date range, branch filter, pagination) is
  trivial without breaking the URL contract.

If the team prefers a GET, the equivalent is
`GET /api/v1/batch-sales?batchIds=1,2,3,4,5` with a custom params serializer
in axios. Both are acceptable; the choice is up to you.

#### Error / edge behavior

- Missing or empty `batchIds`: return `400 Bad Request` with a clear message.
  The frontend will always send the explicit list (or be paginated later).
- `batchIds` containing ids that don't exist or aren't visible to the tenant:
  silently filter them out of the response (no 404). This matches the
  existing single-batch endpoint's behavior.
- Caching: response varies per tenant (`X-Business-Code`) and per batch set,
  so we don't expect HTTP-level caching to help. The frontend will cache by
  `[batchIds]` with a `staleTime: 5 min`.

### Performance impact

| Scenario | Before | After |
|---|---|---|
| Initial page mount (15 batches) | 17 requests | **3 requests** |
| Search click returning 10 new batches | 11 requests | **2 requests** |
| Re-mount within 5 min | 0 (cache hit) | 0 (cache hit) |

### Frontend changes (will happen in this repo after the backend lands)

- `src/features/batch/branch/BranchGlobalSummary.tsx`: replace the
  `useQueries({ queries: batches.map(...) })` block with a single
  `useQuery({ queryKey: ["batchSales", "by-batches", batchIds],
  queryFn: fetchSalesByBatches })`.
- `src/features/batch/branch/BatchRow.tsx`: keep
  `useSalesByBatch(batchId)` for the lazy "expanded card" case — it now
  reads from a single key the bulk query also writes to, OR falls back to a
  per-batch call if the bulk query has not yet returned. We can decide on
  one approach after seeing the backend response latency.
- `src/features/batch/branch/api/sales.api.ts`: add
  `searchByBatchIds(batchIds: number[]): Promise<BranchesBatchSale[]>`.
- `src/features/batch/branch/api/sales.queries.ts`: add a sibling hook
  `useSalesByBatches(batchIds: number[])`.

No UI changes — the summary cards, per-row totals, and "Ir a la venta"
button all keep working off the same in-memory sales array.

### Acceptance criteria

- [ ] `POST /api/v1/batch-sales/search` returns the same per-item shape as
      `GET /api/v1/batch-sales/batch/{batchId}` for a single id, and the
      concatenation of those arrays for multiple ids (no dedup, no
      reordering).
- [ ] Empty / missing `batchIds` returns `400`.
- [ ] Unknown / not-visible ids are silently filtered.
- [ ] Per-batch latency does not regress (i.e. the bulk endpoint is at least
      as fast as N parallel single-batch calls for `N` in the 10–30 range).
- [ ] Endpoint respects the existing tenant filter (`X-Business-Code`).

### Out of scope

- Live-chicken / egg `BatchPage` does **not** need this — its sales are
  lazy-loaded per expanded card, and the per-row N+1 is acceptable there.
- The legacy `DailyBatchSale` endpoint family is not affected; this ticket
  is specifically about the `BranchesBatchSale` office-sales shape used by
  `useUpdateSaleOfficeStatus` and the summary tabs.

### Reference

Frontend call sites that will switch to the new endpoint:

- `src/features/batch/branch/BranchGlobalSummary.tsx:39-46` (the
  `useQueries` block)
- `src/features/batch/branch/api/sales.api.ts:79-84` (`getByBatchId`, the
  per-batch fallback)
