# Requirements Register — Cycle C1

<!-- Revision: C1 | Status tags: approved [C1] | modified [Cn] | new [Cn] | deprecated [Cn] -->

## Platform — Core

### REQ-0001: Recipe Search [approved C1]
**Priority:** CRITICAL  
**Description:** Users can search recipes via Spoonacular with filters (cuisine, diet, type, ingredients).  
**Verification:** GET `/api/recipes/search` returns paginated results; UI shows RecipeCard grid.  
**Done:** Search + autocomplete + advanced filters functional on `/`.

### REQ-0002: Recipe Detail [approved C1]
**Priority:** CRITICAL  
**Description:** Full recipe page at `/recipe/[id]` with instructions, nutrition, taste, wine pairing.  
**Verification:** Spoonacular information endpoint proxied; tabs render without hydration mismatch.  
**Done:** RecipePage loads for valid IDs.

### REQ-0003: Authentication [approved C1]
**Priority:** CRITICAL  
**Description:** NextAuth v5 — Google OAuth + Credentials (email/password).  
**Verification:** Login/logout; session JWT; `requireAuth()` on protected API routes.  
**Done:** AuthContext + auth.ts providers operational.

### REQ-0004: Favourites [approved C1]
**Priority:** HIGH  
**Description:** Authenticated users save/remove favourite recipes.  
**Verification:** CRUD via `/api/recipes/favourite`; React Query invalidation.  
**Done:** Favourites tab shows user favourites only.

### REQ-0005: Collections [approved C1]
**Priority:** HIGH  
**Description:** User-created recipe collections with ordering.  
**Verification:** `/api/collections` CRUD; CollectionManager UI.  
**Done:** Collections tab functional when authenticated.

### REQ-0006: Meal Planning [approved C1]
**Priority:** HIGH  
**Description:** Weekly meal planner (breakfast, lunch, dinner, snack).  
**Verification:** `/api/meal-plan` CRUD; MealPlanner component.  
**Done:** Meal Plan tab functional when authenticated.

### REQ-0007: Shopping List [approved C1]
**Priority:** HIGH  
**Description:** Generate shopping lists from selected recipes.  
**Verification:** `/api/shopping-list` CRUD; ShoppingListGenerator.  
**Done:** Shopping tab functional when authenticated.

### REQ-0008: Unified API Handler [approved C1]
**Priority:** CRITICAL  
**Description:** Single serverless function at `app/api/[...path]/route.ts` for Vercel Hobby limits.  
**Verification:** All documented routes resolve through path[] matching.  
**Done:** No duplicate route files for business logic.

### REQ-0009: Two-Tier Caching [approved C1]
**Priority:** MEDIUM  
**Description:** Upstash Redis (server) + TanStack Query (client) with manual invalidation.  
**Verification:** `withCache()` TTLs; queryInvalidation on mutations.  
**Done:** Cache layers documented in CLAUDE.md.

### REQ-0010: AI Features [approved C1]
**Priority:** MEDIUM  
**Description:** AI search, recommendations, analysis, modifications with provider fallback chain.  
**Verification:** `/api/ai/*` endpoints; graceful degradation when keys missing.  
**Done:** Fallback chain operational.

## Platform — User Content

### REQ-0011: Recipe Notes [approved C1]
**Priority:** MEDIUM  
**Description:** Per-recipe user notes and ratings (auth).  
**Verification:** `/api/recipes/notes` CRUD.  
**Done:** RecipeNotes component on recipe detail.

### REQ-0012: Recipe Images [approved C1]
**Priority:** MEDIUM  
**Description:** User-uploaded images via Cloudinary; gallery by type.  
**Verification:** Upload → POST images; GET returns DB types mapped to UI types (`main`→`final`, `other`→`custom`).  
**Done:** RecipeImageGallery displays uploaded images.

### REQ-0013: Recipe Videos [approved C1]
**Priority:** LOW  
**Description:** User-added recipe videos (YouTube etc.).  
**Verification:** `/api/recipes/videos` CRUD; RecipeVideoPlayer.  
**Done:** Videos tab on recipe detail when authenticated.

## Platform — Ops & Content

### REQ-0014: Blog (Contentful) [approved C1]
**Priority:** MEDIUM  
**Description:** CMS-powered blog at `/blog` and `/blog/[slug]`.  
**Verification:** `/api/cms/blog` when CMS env vars set.  
**Done:** Blog pages render or empty state when CMS unavailable.

### REQ-0015: Business Insights [approved C1]
**Priority:** MEDIUM  
**Description:** Platform analytics dashboard (auth).  
**Verification:** GET `/api/business-insights` returns stats.  
**Done:** `/business-insights` page loads for authenticated users.

### REQ-0016: API Status & Docs [approved C1]
**Priority:** LOW  
**Description:** `/api-status` health dashboard; `/api-docs` reference.  
**Verification:** GET `/api/status`; static docs pages.  
**Done:** Both routes accessible.

## Non-Functional — Production Guardrails

### REQ-0017: Vercel Production Guardrails [approved C1]
**Priority:** HIGH  
**Description:** Security headers, static asset immutable cache, robots.ts, no conflicting robots.txt.  
**Verification:** `next.config.js` headers(); `vercel.json` headers; `app/robots.ts` exists.  
**Done:** Implemented 2026-03-25. Manual: Vercel Bot Protection + AI Bots (dashboard).

### REQ-0018: SafeImage Fallback [approved C1]
**Priority:** HIGH  
**Description:** Remote images use SafeImage (`next/image` first, native `<img>` on error).  
**Verification:** `src/components/ui/safe-image.tsx`; remote Image usages migrated.  
**Done:** Implemented 2026-03-25; no intentional delay on happy path.

### REQ-0019: Logout UX [approved C1]
**Priority:** MEDIUM  
**Description:** On logout from auth-only tabs, redirect to search tab without full page reload.  
**Verification:** Navbar `handleLogout` calls `setSelectedTab("search")` after `logout()`.  
**Done:** Implemented in Navbar.tsx.

## Issues — C1 Backlog

### REQ-0020: Fix Business Insights N+1 Query [new C1]
**Priority:** MEDIUM  
**Source:** SENTRY_ERRORS.md — case 1  
**Description:** `/api/business-insights` triggers repeated Prisma `User.count` queries (N+1 pattern, ~7 repeats).  
**Verification:** Single aggregated query or batched counts; Sentry N+1 alert cleared.  
**Done:** Shipped — `lib/business-insights.ts`, Redis cache, probe mode, SSR hydration.

---

## Traceability Index

| REQ | Primary Artifacts | Tests |
|-----|-------------------|-------|
| REQ-0001 | ART-0001 | TC-0001 |
| REQ-0003 | ART-0002 | TC-0002 |
| REQ-0017 | ART-0003 | TC-0017 |
| REQ-0018 | ART-0004 | TC-0018 |
| REQ-0020 | ART-0005 | TC-0020 |
