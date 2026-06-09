# Skill 08: discovery-analyst

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/discovery-analyst/SKILL.md` |
| **Pipeline stage** | 1 |
| **When** | Discovery → structured hypotheses |

## Activation

```
Load skill: discovery-analyst
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
