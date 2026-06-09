# Risk Register (Append-Only)

| RISK-ID | Cycle | Category | Description | Likelihood | Impact | Severity | Mitigation | Owner | Status |
|---------|-------|----------|-------------|------------|--------|----------|------------|-------|--------|
| RISK-0001 | C1 | Technical | N+1 queries on `/api/business-insights` increase Fluid CPU + DB load | Medium | Medium | Medium | REQ-0020 shipped; Sentry monitor post-deploy | build-agent-js | mitigated |
| RISK-0002 | C1 | Security | Bot crawl burns Edge/CPU/image transforms on Vercel free tier | High | High | High | REQ-0017 code guardrails + enable Vercel Bot Protection + AI Bots | Human | mitigating |
| RISK-0003 | C1 | Technical | Spoonacular API daily limit (402) on free keys | Medium | High | High | API key rotation in `lib/api-key-tracker.ts` | ops | mitigating |
| RISK-0004 | C1 | Process | No automated test suite — regression manual only | Medium | Medium | Medium | Manual TC baseline; consider Playwright in C2 | test-designer | accepted |
