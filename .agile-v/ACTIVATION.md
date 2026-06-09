# Agile V Session Activation

## Every Chat — Load Order

1. **agile-v-core** — always first
2. **agile-v-pipeline** — if multi-stage work
3. **agile-v-quality-gates** — if implementing or fixing
4. **agile-v-lifecycle** — if C2+ or change requests
5. **agile-v-compliance** — if gates, CAPA, risk
6. **agile-v-product-owner** — if backlog/sprint planning
7. Role skill — see `skills/INDEX.md`

## Resume Protocol

1. Read `.agile-v/STATE.md`
2. Read `.agile-v/CHECKPOINTS.md` if any PENDING
3. Load only current-stage files (paths, not full dump)

## Halt Conditions

- Missing parent REQ-XXXX on new artifact
- Ambiguous requirement
- Human Gate without APPROVALS.md entry

## Evidence Summary (required on stage completion)

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL/FLAG counts]
Decision Points: [choices] | Log: [TIMESTAMP | AGENT | DECISION | RATIONALE | LINKED_REQ]
```

## Write-Through

Update STATE.md + DECISION_LOG.md on every stage transition.
