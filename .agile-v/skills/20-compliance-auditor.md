# Skill 20: compliance-auditor

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/compliance-auditor/SKILL.md` |
| **Pipeline stage** | All |
| **When** | DECISION_LOG, audit trail |

## Activation

```
Load skill: compliance-auditor
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
