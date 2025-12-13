# Implementation Plans

This directory contains structured implementation plans for the project. Plans are created by the Planning Agent and provide detailed roadmaps for features, bug fixes, and refactoring work.

## Directory Structure

```
.github/plans/
├── README.md                           # This file
├── _template.plan.md                   # Template for new plans
└── {kebab-case-name}-{8hex}.plan.md   # Individual plan files
```

## Plan File Naming Convention

Plans follow this naming pattern:

```
{kebab-case-description}-{8-hex-characters}.plan.md
```

**Examples:**

- `add-user-authentication-a1b2c3d4.plan.md`
- `fix-pdf-generation-error-e7cd135a.plan.md`
- `refactor-cart-system-12345678.plan.md`

## Plan Statuses

| Status        | Description                                  |
| ------------- | -------------------------------------------- |
| `draft`       | Plan is being created or refined             |
| `in-progress` | Active development is underway               |
| `completed`   | All todos are done, work is finished         |
| `archived`    | Plan is no longer relevant or was superseded |

## Using Plans

### Creating a New Plan

Ask Copilot to create a plan:

```
Plan: Add user avatar upload functionality
```

```
Create a plan for implementing real-time notifications
```

```
Help me plan the database migration strategy
```

### Working with Existing Plans

**Resume work:**

```
Continue plan: add-user-avatar
```

**Update a plan:**

```
Update the avatar upload plan to include GIF support
```

**Mark todos complete:**

```
Mark todo 3 as complete in the avatar plan
```

### Viewing Plans

**List all plans:**

```
List all plans
```

**Show specific plan:**

```
Show me the avatar upload plan
```

## Plan Structure Overview

Every plan contains:

1. **YAML Frontmatter** - Metadata (name, status, priority, todos)
2. **Overview** - What the plan accomplishes
3. **Goals / Non-Goals** - Scope boundaries
4. **Technical Design** - Architecture and implementation details
5. **Implementation Plan** - Phased steps with file changes
6. **Files to Create/Modify** - Complete file list
7. **Testing Strategy** - How to verify the work
8. **To-Dos** - Actionable checklist items

## Best Practices

### Writing Good Todos

✅ **Good:** "Create `uploadAvatar` mutation in `convex/files/mutations/uploadAvatar.ts`"  
❌ **Bad:** "Add upload feature"

✅ **Good:** "Add validation for file size (max 5MB) and type (jpg, png, webp)"  
❌ **Bad:** "Validate files"

### Breaking Down Work

- Each todo should take 30 minutes to 2 hours
- Break large features into multiple phases
- Include testing as explicit todos
- Order todos by dependency (do prerequisites first)

### Keeping Plans Updated

- Check off todos as you complete them
- Update status when starting/finishing
- Add notes about blockers or scope changes
- Archive plans that are no longer relevant

## Integration with Git Workflow

Consider linking plans to git branches:

```bash
# Create branch from plan name
git checkout -b feature/add-user-avatar-a1b2c3d4
```

Reference the plan in commit messages:

```
feat(avatar): implement upload mutation

Plan: .github/plans/add-user-avatar-a1b2c3d4.plan.md
```

## Template

See [\_template.plan.md](_template.plan.md) for a blank template to create plans manually.
