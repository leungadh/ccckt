# CCCKT Website Revamp

Planning and design for rebuilding the [基督中心堂 (CCCKT)](https://ccckt.org.hk) church website — moving off an outdated, unpatched WordPress install onto a free-tier static site with a managed database.

## Status

**Planning phase — no code yet.** The design has been reviewed; implementation (Phase 1: scaffold) hasn't started.

## Why

The current site runs on WordPress with outdated plugins and is still publicly live — an active security exposure. Given the site's minimal traffic and content, and volunteers who need a simple way to post updates, the plan is to retire WordPress rather than patch it, and rebuild on:

- **Astro** — static site generator for the public pages
- **Supabase** — database, auth, and file storage for volunteer-submitted content (announcements, sermons, events)
- **Cloudflare Pages / Netlify** — free static hosting

See the design document for the full architecture, content model, and implementation phases.

## Contents

| File | Description |
| --- | --- |
| `CCCKT Website Revamp — Design Document.md` / `.docx` / `.pdf` | Full design doc: problem statement, architecture, content model, phased implementation plan, costs, open risks |
| `ccckt_revamp.pptx` | Slide deck covering the same material, for stakeholder review |

## Next steps

1. Patch the live WordPress site (interim security mitigation)
2. Scaffold the Supabase + Astro project
3. Build the volunteer admin pages
4. Migrate content and style the site
5. Cut over DNS and retire WordPress

See the design document's Implementation Plan section for details.
