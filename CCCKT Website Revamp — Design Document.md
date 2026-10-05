# CCCKT Website Revamp — Design Document

Oct 5, 2026 · @Andy

## Executive Summary

The current ccckt.org.hk website runs on an outdated WordPress installation with unpatched plugins — a live security risk, since the site remains publicly accessible today. Given minimal traffic and content, and a consistent need for simple content updates by volunteers, we recommend retiring WordPress entirely rather than patching it, and rebuilding on a static-site-plus-managed-database architecture (Astro, Supabase, Cloudflare Pages/Netlify) that runs entirely on free hosting tiers, removes the vulnerable PHP/plugin stack, and adds a livestream-link feature for bad-weather access to services. This document lays out the architecture, content model, phased implementation steps, and items needing confirmation before work begins. Submitted for approval before implementation starts.

## Background & Current State

ccckt.org.hk (基睹中心堂) runs on a self-hosted WordPress installation that has not kept its plugins updated — a real, live security exposure since the site remains publicly reachable today. The site itself is small: a handful of static informational pages (Church Overview, History, Staff, Weather Guidelines), a sermon archive (title, date, speaker, a PDF hymn/scripture sheet per entry), an events calendar, an activity photo gallery, and a Contact page with no form. Traffic is minimal, and there is no donation system, member login, or contact form to preserve.

Patching the current plugins only delays the next vulnerability; the plugin/PHP/database stack itself is the attack surface. We recommend retiring WordPress rather than maintaining it.

## Goals & Requirements

| Requirement | Decision |
| --- | --- |
| Language | Chinese only — matches the current site, no language switcher needed |
| Budget | Free hosting/tooling tiers only |
| Content owners | \~5 volunteers today, expected to grow |
| Volunteer tasks | Post announcements; upload sermon PDF/PPT (hymns, scripture); paste YouTube recording and livestream links |
| New feature | A livestream link on sermon entries, shown as a "Watch Live" button — gives congregants a bad-weather way to join remotely |
| Editing tooling | Must not require technical skill — simple login + forms, no git or markdown |

## Proposed Architecture

&#91;embedded content: architecture flow · volunteer to public site, 6 steps\]

Volunteers publish through Supabase; the site itself is rebuilt as static pages, so there is no server left to patch.

## Content Model

Volunteer-editable (in Supabase, via the admin pages):

| Type | Fields |
| --- | --- |
| Announcement | Title, date, body text |
| Sermon | Title, date, speaker, hymn/scripture PDF or PPT upload, recording/YouTube link (optional), livestream link (optional) |
| Event | Title, date/time, description |

Builder-maintained (hardcoded in the Astro site, changed only when the site builder edits code — kept out of the volunteer CMS since they rarely change): Church Overview (pastor's message, beliefs, history, staff, departments), Weather Guidelines, Contact info.

## Volunteer Admin Experience

1. A volunteer logs in at a dedicated admin page with an email/password account — no technical setup required.
2. They pick one of three forms: Post Announcement, Post Sermon, or Add Event.
3. For a sermon: type the title, date and speaker, upload the hymn/scripture PDF or PPT, and optionally paste a YouTube link (past recording) or a livestream link (filled in before service, especially useful in bad weather).
4. Saving the form writes to Supabase and triggers a rebuild of the public site — the new content is live within a minute or two, with no further action needed.

There is no seat limit on how many volunteers can have an account, so adding more editors later is just creating another login.

## Security Improvements

The new design removes the actual source of risk: there is no WordPress core, no PHP, and no exposed database server to patch. The static site has nothing for an attacker to exploit beyond the hosting provider's own infrastructure (Cloudflare Pages/Netlify), which is maintained by them, not by church volunteers.

**Interim mitigation, while the old site is still live:** update WordPress core and all plugins now (or remove unused ones), and rotate the admin password. This is independent of the rebuild timeline and should happen immediately.

## Implementation Plan

1. **Immediate (security):** patch the live WordPress site — update core/plugins, rotate the admin password.
2. **Scaffold:** set up the Supabase project (Auth, tables, Storage bucket), the Astro project skeleton, and deploy a bare version to Cloudflare Pages/Netlify.
3. **Admin pages:** build the three volunteer forms (Announcement, Sermon, Event) and login; test with one real volunteer before wider rollout.
4. **Content & styling:** migrate the current content, apply branding/styling, verify mobile rendering.
5. **Cutover:** coordinate with the current DNS holder to repoint ccckt.org.hk to the new host, back up and then decommission the WordPress install.

## Migration & Cutover

Existing content is minimal, so migration is a manual, one-time copy into the new content types rather than an automated import: static pages (Overview, History, Staff, Weather Guidelines, Contact) are rebuilt directly in the new site; sermon and announcement history can be carried over selectively.

DNS for ccckt.org.hk is currently managed by a third party, not directly by the project team. Cutover requires coordinating with that person/host to repoint the domain once the new site is ready, and to confirm who holds the WordPress admin login so the interim security patching can actually happen. The old WordPress install is taken down only after a final backup export, once the new site is confirmed live.

## Cost & Hosting Summary

| Service | Role | Tier |
| --- | --- | --- |
| Cloudflare Pages or Netlify | Static site hosting | Free |
| Supabase | Database, Auth, file storage | Free |
| Domain (ccckt.org.hk) | Existing, unchanged | Already owned |

All chosen services run comfortably within their free tiers at the site's current low traffic and content volume. Future costs would only arise from significant growth in traffic, storage (e.g. many large video files), or if Supabase's free database/storage limits are exceeded — none of which are expected given the site's current scope.

## Open Risks & Items Needing Confirmation

| Item | Why it matters | Needs confirmation from |
| --- | --- | --- |
| WordPress admin credentials | Needed to apply the interim security patch before the rebuild is finished | Whoever currently administers the WordPress site |
| DNS access | Needed to repoint ccckt.org.hk at cutover | The current DNS/domain holder |
| Volunteer accounts | Confirm the initial list of \~5 volunteers to set up logins for | Church leadership |

- [ ] Approve this design and the plan to proceed
- [ ] Confirm WordPress admin access for interim patching
- [ ] Confirm DNS contact for cutover coordination
