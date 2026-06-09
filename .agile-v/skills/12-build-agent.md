# Skill 12: build-agent

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/build-agent/SKILL.md` |
| **Pipeline stage** | 3 |
| **When** | Generic artifact synthesis |

## Activation

```
Load skill: build-agent
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
