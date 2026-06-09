# Skill 09: threat-modeler

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/threat-modeler/SKILL.md` |
| **Pipeline stage** | 1 |
| **When** | STRIDE → security REQs |

## Activation

```
Load skill: threat-modeler
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
