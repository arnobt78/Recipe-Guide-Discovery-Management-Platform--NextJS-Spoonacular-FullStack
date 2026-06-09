# Product Backlog — Cycle C1

## BL-0001: Recipe search & discovery
**Type:** Feature · **Priority:** CRITICAL · **REQ:** REQ-0001, REQ-0002  
**Status:** Done (baseline)

## BL-0002: Auth-protected user features
**Type:** Feature · **Priority:** HIGH · **REQ:** REQ-0004, REQ-0005, REQ-0006, REQ-0007  
**Status:** Done (baseline)

## BL-0003: Vercel production guardrails
**Type:** Enhancement · **Priority:** HIGH · **REQ:** REQ-0017  
**Story:** As operator, I want bot/crawl protection and security headers so Vercel free tier is not burned.  
**Acceptance:** Headers in next.config + vercel.json; robots.ts; dashboard Bot Protection enabled.  
**Status:** Done (code) — dashboard manual pending

## BL-0004: SafeImage remote fallback
**Type:** Enhancement · **Priority:** HIGH · **REQ:** REQ-0018  
**Status:** Done

## BL-0005: Logout redirect to home tab
**Type:** Bug · **Priority:** MEDIUM · **REQ:** REQ-0019  
**Status:** Done

## BL-0006: Fix business-insights N+1
**Type:** Bug · **Priority:** MEDIUM · **REQ:** REQ-0020  
**Story:** As operator, I want business-insights to use minimal DB queries so Sentry N+1 alerts stop.  
**Acceptance:** TC-0020 pass; Sentry issue resolved.  
**Effort:** S · **Status:** Backlog / Ready for Sprint
