# Skill 11: logic-gatekeeper

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/logic-gatekeeper/SKILL.md` |
| **Pipeline stage** | 2 |
| **When** | Validate REQs before Gate 1 |

## Activation

```
Load skill: logic-gatekeeper
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
