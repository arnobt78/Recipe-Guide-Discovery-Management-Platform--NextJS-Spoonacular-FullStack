# Skill 19: red-team-verifier

| Field | Value |
|-------|-------|
| **Cursor path** | `~/.cursor/skills/red-team-verifier/SKILL.md` |
| **Pipeline stage** | 4 |
| **When** | Independent verification — no self-verify |

## Activation

```
Load skill: red-team-verifier
Read: .agile-v/STATE.md
Trace: cite REQ-XXXX in all outputs
```

## Project Notes (recipe-spoonacular)

- Unified API: `app/api/[...path]/route.ts`
- Client: `src/` · Server: `lib/`
- Open REQ: REQ-0020 (business-insights N+1)
