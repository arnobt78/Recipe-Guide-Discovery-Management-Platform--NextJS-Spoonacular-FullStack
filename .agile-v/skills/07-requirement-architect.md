# Skill 07: requirement-architect

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/requirement-architect/SKILL.md` |
| **Pipeline stage** | 1 |
| **When** | Emit REQUIREMENTS.md with REQ-IDs |

## Activation

```
Load skill: requirement-architect
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
