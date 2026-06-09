# Skill 22: release-manager

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/release-manager/SKILL.md` |
| **Pipeline stage** | 5 |
| **When** | Rollout, rollback, sign-off |

## Activation

```
Load skill: release-manager
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
