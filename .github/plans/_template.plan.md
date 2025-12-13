---
name: '{Plan Title}'
overview: '{One-sentence summary}'
created: 'YYYY-MM-DD'
status: 'draft'
priority: 'medium'
estimated_effort: '{time estimate}'
tags: ['feature']
todos:
  - id: 1
    content: '{First task}'
    status: pending
  - id: 2
    content: '{Second task}'
    status: pending
  - id: 3
    content: '{Third task}'
    status: pending
---

# {Plan Title}

## Overview

{2-4 sentence description of what this plan accomplishes, why it's needed, and the expected outcome.}

## Goals

- {Goal 1}
- {Goal 2}
- {Goal 3}

## Non-Goals (Out of Scope)

- {What this plan explicitly does NOT cover}

## Background / Context

{Relevant background information, current state, problem statement, or motivation.}

## Technical Design

### Architecture Overview

{High-level description of the approach and how components interact.}

### Data Model Changes

{If applicable, describe schema or data structure changes.}

```typescript
// Example schema changes
```

### API / Interface Changes

{If applicable, describe new or modified APIs or interfaces.}

## Implementation Plan

### Phase 1: {Phase Name}

**Objective:** {What this phase accomplishes}

#### 1.1 {Step Name}

{Detailed description}

**Files to modify:**

- `path/to/file.ts` - {What changes}

#### 1.2 {Step Name}

{Detailed description}

### Phase 2: {Phase Name}

{Continue as needed...}

## Files to Create / Modify

### New Files

| File Path             | Purpose       |
| --------------------- | ------------- |
| `path/to/new/file.ts` | {Description} |

### Modified Files

| File Path                  | Changes        |
| -------------------------- | -------------- |
| `path/to/existing/file.ts` | {What changes} |

## Dependencies

- {External dependencies}
- {Internal dependencies}

## Edge Cases & Error Handling

| Scenario    | Handling Strategy  |
| ----------- | ------------------ |
| {Edge case} | {How it's handled} |

## Testing Strategy

### Unit Tests

- {Test description}

### Integration Tests

- {Test description}

### Manual Testing

- [ ] {Test scenario}

## Risks & Mitigations

| Risk   | Impact  | Mitigation |
| ------ | ------- | ---------- |
| {Risk} | {Level} | {Strategy} |

## Open Questions

- [ ] {Question to resolve}

## References

- {Relevant links}

## To-Dos

- [ ] {Todo 1}
- [ ] {Todo 2}
- [ ] {Todo 3}
- [ ] {Todo 4}
- [ ] {Todo 5}

---

## Revision History

| Date       | Author   | Changes              |
| ---------- | -------- | -------------------- |
| YYYY-MM-DD | {Author} | Initial plan created |
