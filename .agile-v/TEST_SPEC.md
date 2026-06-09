# Test Specification — Cycle C1

<!-- TC-XXXX [Cn] | parent REQ | type | status -->

| TC-ID | Cycle | REQ | Type | Description | Status |
|-------|-------|-----|------|-------------|--------|
| TC-0001 | C1 | REQ-0001 | manual | Search returns results for known term | baseline |
| TC-0002 | C1 | REQ-0003 | manual | Login/logout session flow | baseline |
| TC-0017 | C1 | REQ-0017 | manual | Response headers include X-Content-Type-Options | pass |
| TC-0018 | C1 | REQ-0018 | manual | Remote image renders; fallback on optimizer failure | pass |
| TC-0019 | C1 | REQ-0019 | manual | Logout from favourites tab → search tab, no reload | pass |
| TC-0020 | C1 | REQ-0020 | automated | business-insights: ≤1 User count query per uncached request | pass (vitest) |

## Regression Baseline

No automated E2E suite. Vitest covers TC-0020 + realtime publish. Manual + Sentry for regression.

## Test Designer Notes

When REQ-0020 is implemented, verify via Sentry performance trace: single count query pattern.
