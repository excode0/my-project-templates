# Agent Instructions for my-project-templates

This file contains instructions for AI agents working on this project.

## Context

This is a **multi-tenant template marketplace** platform where:
- **Users** can purchase and customize templates via 17+ slot types (full visual customization)
- **Contributors** can create templates via visual editor or hardcode
- **Admins** manage users, templates, domains, and system

## Critical Rules

1. **Full Customization**: Templates MUST provide editable slots for ALL visual aspects:
   - Layout variants (centered, split, grid)
   - Typography (fonts, sizes, weights)
   - Colors, gradients, shadows
   - Spacing, sizing, border radius
   - Animations, transitions
   - Button styles, effects

2. **Folder Structure**: Every template MUST follow:
   ```
   src/templates/{slug}/
   ├── manifest.json
   ├── layout.tsx
   ├── page.tsx
   ├── components/sections/
   ├── types/
   └── lib/
   ```

3. **Manifest Contract**: manifest.json MUST include:
   - Minimal 10 editable slots
   - Support variant, font, spacing, animation slots
   - Valid slot type definitions
   - Mock data for preview

4. **Engine System**: Use existing engines:
   - template-engine: Load & render
   - editor-engine: User & contributor editors
   - domain-engine: DNS & routing
   - cms: Content management
   - payment: Purchase flow

5. **TypeScript Strict**: All code MUST be TypeScript with strict mode
6. **Read Docs First**: Always check `../docs/` folder before implementing

## Documentation

Before any implementation, READ:
- `../docs/database-schema.md` - Database structure
- `../docs/folder-structure.md` - Required folder structure
- `../docs/engine-architecture.md` - Engine system flow
- `../docs/template-system.md` - Template creation guide
- `../docs/editable-slot-types.md` - 17+ slot types reference
- `../docs/ai-autopilot-prompts.md` - Task-specific prompts

## Common Tasks

### Create New Template
1. Read `docs/template-system.md`
2. Create folder: `src/templates/{slug}/`
3. Write manifest.json with 10+ slots
4. Implement layout.tsx and page.tsx
5. Create section components with useSlotValue
6. Test with TemplateRenderer

### Implement Engine Feature
1. Read `docs/engine-architecture.md`
2. Create files in `src/lib/engines/{engine-name}/`
3. Export from index.ts
4. Add TypeScript types
5. Write tests

### Add Slot Type
1. Read `docs/editable-slot-types.md`
2. Add type to EditableSlot interface
3. Implement UI component in editor
4. Add validation logic
5. Document usage

## Tech Stack Notes

- **Next.js 15**: Check `node_modules/next/dist/docs/` for latest API changes
- **App Router**: Use Server Components by default, add 'use client' when needed
- **TypeScript**: Strict mode enabled, use proper types
- **Tailwind**: Use cn() utility for class merging
- **Database**: PostgreSQL with JSONB for config storage

## Development Workflow

1. Read relevant docs
2. Check existing code patterns
3. Follow folder structure
4. Use TypeScript strict
5. Test locally
6. Document changes

---

**Always prioritize full customization capability in templates!**
