# AGENTS.md

Compact guide for OpenCode sessions working in this repo. Skip this file if the
work is trivial.

## Quick start

```bash
npm run dev        # Vite dev server (HMR)
npm run build      # tsc -b && vite build (run before pushing)
npm run lint       # eslint .
npm run format     # prettier . --write
```

No test framework is installed (no vitest, jest, playwright). Verification is
typecheck + build + lint.

## Stack

- React 19 + TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`)
- Vite 7, Tailwind 4, flowbite-react 0.12
- TanStack Query 5 (global `QueryClient` in `src/App.tsx`)
- React Router 7 (`BrowserRouter` in `main.tsx`)
- axios with request/response interceptors in `src/shared/api/http.ts`
- react-hook-form for batch/movement forms; plain `useState` for the expense
  modal forms (`ExpenseEntryForm` + `*Fields.tsx`)
- date-fns + dayjs + react-day-picker (Flowbite's `Datepicker`)

## Path alias

`@/*` → `src/*`. Set in `vite.config.ts`, `tsconfig.app.json`,
`tsconfig.node.json`. Always use `@/...` instead of long `../../` chains.

## Multi-tenancy is URL-driven

The axios request interceptor in `src/shared/api/http.ts` inspects
`window.location.pathname` and sets the `X-Business-Code` header from this
prefix map:

- `/business/sucursales` → `branches`
- `/business/pollo-vivo` → `live_chicken`
- `/business/huevo` → `egg`
- `/business/pig` → `pig`
- `/business/groceries` → `groceries`
- otherwise → `public`

`BusinessRoutes.tsx` keys the in-app switch on `useParams().slug`; the
`BusinessRoutesWrapper` re-mounts the subtree on slug change via `key={slug}`.

**Implication for new features**: do not add a tenant picker. Just add a new
slug → code mapping in `TENANT_MAP` if needed. Components in
`src/features/<x>/` that must be multi-tenant accept a `unitType` prop and use
it to scope query keys (see `expense.keys.ts`, `batch` `unitConfig.tsx`).

## Routes / business slugs

`src/business/business.types.ts` defines the source-of-truth `BusinessType`
union. `src/business/business.config.ts` maps slugs to menu items, icons, and
labels. `src/routes/businessSlugMap.ts` maps URL slugs to `BusinessType`.

Current slugs: `sucursales`, `pollo-vivo`, `cerdo`, `huevo`, `verduras`,
`abarrotes`. Add new slugs in all three places consistently.

## Feature folder layout

`src/features/<feature>/` is the standard structure. The expenses feature is
the most complete reference:

```
src/features/expenses/
  api/         # <feature>.api.ts, <feature>.keys.ts, <feature>.queries.ts
  components/  # ExpenseFilters, ExpenseModal, ExpensesTable, FilterChipGroup, ...
  config/      # filterConfig.ts (chip options/colors), unitConfig.ts
  pages/       # ExpensesPage.tsx (unit-typed, takes unitType prop)
  types/       # expense.types.ts
  utils/       # expense-summary.ts
```

`core/` holds cross-feature primitives (api types, clients, vehicles, routes,
cedis, suppliers). `shared/` holds the axios instance, auth events, and a
(stub) `tenant-store.ts`. `services/api.ts` is a legacy dump of types and
fetchers being migrated; do not add new code there.

## Auth

Token + user live in `localStorage`. `useAuth()` from
`src/context/AuthContext.tsx` exposes `{ token, user, login, logout,
isAuthenticated }`. The axios response interceptor dispatches an
`unauthorized` window event on 401; `AuthContext` listens and logs out. Don't
catch 401s in feature code — let the interceptor handle it.

`user.allowedBusinesses: BusinessType[]` drives the sidebar in
`components/SidebarApp.tsx`.

## i18n / copy

UI is in Spanish (e.g., "Nuevo gasto", "Buscar", "Limpiar", "Sucursales").
Datepickers use `language="es-MX"`. There is no i18n library — strings are
inlined. Stay consistent with existing labels.

## Code style

- **No comments.** Project preference (see commit `526b3ac "removed
  comments"`). Don't add code comments, JSDoc, or file headers.
- For the EGG unit, always display piece quantities using
  `EggQuantityDisplay`
  (`src/features/batch/components/egg/EggQuantityDisplay.tsx`), which renders
  icons for 📦 cajas / 📊 casilleros / 🥚 piezas. Never use plain numbers in
  tables, charts, summary cards, or tooltips when displaying EGG unit piece
  counts. This applies to every batch, sales, expense, profit, and report
  feature that shows EGG quantities.
- Use the `flowbite-react` component library for buttons, modals, badges,
  tooltips, alerts, labels, inputs. Don't reinvent these with raw HTML unless
  you need a feature the library lacks.
- Use the `@/` alias for all internal imports.
- React Query hooks live in `*.queries.ts`. Query keys live in `*.keys.ts` as
  factory functions scoped by `unitType` (or other top-level discriminator)
  so cache invalidation can target a single tenant.
- The `react-refresh/only-export-components` ESLint rule warns on non-component
  exports from a component file — keep utility functions in `utils/`.

## Things that will trip you up

1. **`.flowbite-react/init.tsx` is auto-generated.** Don't edit it; edit
   `.flowbite-react/config.json` if you must.
2. **`.env` is gitignored.** Only `.env.development` and `.env.production` are
   committed. `VITE_API_URL` is the only env var consumed (see `shared/api/http.ts`).
3. **Two route files exist**: `AppRoutes.tsx` (auth + global) and
   `BusinessRoutes.tsx` (per-business). Don't merge them; new business routes
   go in `BusinessRoutes.tsx` with a slug check.
4. **`features/shared/` is empty.** Don't add code there; use `core/` or
   `shared/`.
5. **Some forms use react-hook-form, some use plain state.** When adding a
   form, pick the pattern that matches nearby code (e.g., expense modal uses
   plain `useState` + `setForm` updater; batch/movement forms use RHF).
6. **ExpenseType is a string-literal type, not an enum.** In
   `core/api/types.ts` it's `type ExpenseType = "SERVICIOS" | ...` — you cannot
   do `ExpenseType.SERVICIOS`. Use the string literal in config arrays, and
   `ExpenseTypeLabels[<value>]` for display. `ExpenseCategoryCode` IS an enum
   and works normally.
7. **The legacy `services/api.ts` is being phased out.** New API code goes in
   `src/features/<x>/api/` or `src/core/<x>/api/` using the local `http`
   instance from `@/shared/api/http`.
8. **Backend CORS + `withCredentials: true`** is set on the axios instance —
   don't remove it.

## Typecheck / build before pushing

There is no CI, no pre-commit hook, and no test runner. Before considering a
change done, run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The build runs `tsc -b && vite build`, so the explicit `tsc --noEmit` is a
faster pre-check.

## Git

- Working branch: `dev`.
- Commit style: short lowercase, no period, imperative (e.g., "added a button
  to create new routes", "removed unused code"). No conventional-commits
  prefix.
- Never commit `dist/`, `node_modules/`, `.env`, or the `git-diagnostics-*.zip`
  artifact in the repo root.
