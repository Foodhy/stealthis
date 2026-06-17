# StealThis Agent Skills

Skills are on-demand knowledge modules for AI agents working in this monorepo. Each skill lives in `.agents/skills/<name>/SKILL.md` and is loaded when a task matches its description.

## Available skills

| Skill | Path | Use when |
| --- | --- | --- |
| **Create site pages** | [`create-site-pages/SKILL.md`](./create-site-pages/SKILL.md) | Adding a new Astro route to `apps/www` (e.g. `/changelog`, `/showcase`) with i18n and SEO |
| **Page resources** | [`page-resources/SKILL.md`](./page-resources/SKILL.md) | Adding a copy-paste full-page template to the Library (`category: pages`, Lab demo) |
| **Content authoring** | [`content-authoring/SKILL.md`](./content-authoring/SKILL.md) | Adding or editing any library resource under `packages/content/resources/` |
| **Add collection** | [`add-collection/SKILL.md`](./add-collection/SKILL.md) | Introducing a new Library collection ID (schema, i18n, docs catalog) |

## How skills relate to other docs

| Doc | Role |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | Always-on project context and command reference |
| `.agents/skills/*/SKILL.md` | Task-specific workflows loaded when relevant |
| `CONTENT_AUTHORING.md` | Full reference for resource frontmatter and snippets |
| `PHASE-WORKFLOW.md` | Multi-agent batch builds for ROADMAP phases (opt-in) |

## Anatomy of a skill

Every `SKILL.md` follows this shape:

```yaml
---
name: skill-id
description: One line — when the agent should load this skill.
---

## When to use
## Workflow
## Checklist
## Related files
```

Optional subfolders (`rules/`, `examples/`) can hold deeper reference material without bloating the entry point.
