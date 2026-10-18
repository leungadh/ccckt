# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

The CCCKT (基督中心堂) website revamp: a static Astro site + Supabase backend, replacing an outdated, unpatched WordPress install. Live at https://ccckt.pages.dev (Cloudflare Pages, auto-deploys from `main`).

## Repo layout

- `site/` — the Astro project. Public pages (`src/pages/*.astro`, `src/pages/{about,announcements,sermons,events}/`) and the volunteer admin tool (`src/pages/admin/`). Shared layouts in `src/layouts/`, Supabase client + small helpers in `src/lib/`.
- `supabase/` — `migrations/` (schema) and `config.toml`, linked via the Supabase CLI to the hosted project (ref `crsdwrkibwzrgixapiwg`).
- `images/` — reference photos pulled from the live ccckt.org.hk site (used in README, source material for `site/public/images/`). Not served by the site itself.
- Design doc (`.md`/`.docx`/`.pdf`), `ccckt_revamp.pptx` (stakeholder deck), `CCCKT Website Architecture.pptx` (technical architecture/admin-ops deck).

## Architecture

Three services, no backend server:

1. **Astro** builds static HTML/CSS/JS at build time. Nothing runs server-side at request time.
2. **Cloudflare Pages** hosts the static output and auto-rebuilds on every push to `main` (root directory `site`, build command `npm run build`, output `dist`).
3. **Supabase** is the entire backend: Postgres (`announcements`, `sermons`, `events` tables), Auth (email/password, invite-only — public signup is deliberately disabled), and Storage (`sermon-files` bucket).

The browser's own JavaScript calls Supabase directly (via `supabase-js`, using the public/anon key) for both the admin forms and the public content listings — there's no middle-tier API. Security is enforced by Postgres Row Level Security (RLS): anonymous reads are allowed, writes require an authenticated session. This is intentional and documented in `CCCKT Website Architecture.pptx`.

## Commands

```bash
cd site
npm run dev      # or: npx astro dev --background / astro dev stop
npm run build
npx astro check  # typecheck
```

```bash
supabase db push       # apply new migrations in supabase/migrations/
supabase config push   # push supabase/config.toml to the hosted project — see gotcha below
```

## Known gotchas

- **Astro scoped `<style>` does not reach `<slot />` content.** A layout's own `<style>` block only scopes to elements written directly in that layout file — content passed in from a page via `<slot />` never gets the scoping attribute, so the styles silently never apply. Both `AdminLayout.astro` and `PublicLayout.astro` use `<style is:global>` for this reason, with selectors scoped manually (e.g. `.card label`, `.page-card h1`) to avoid leaking globally.
- **`supabase config push` has silently disabled the Auth email provider's `enabled` flag** on this project, more than once, even when `config.toml` explicitly sets `[auth.email] enabled = true`. The CLI reports the push as a no-op diff but the hosted project ends up with email login broken (`email_provider_disabled`). After any `config push`, verify login still works; if not, manually toggle Email provider back on at `supabase.com/dashboard/project/crsdwrkibwzrgixapiwg/auth/providers`.
- **No browser automation tool (Chrome extension or built-in browser) is available in this environment.** UI changes are verified via `astro check` + `astro build` + reading rendered HTML with `curl`, and functional/data checks via small Node scripts calling `@supabase/supabase-js` directly. Ask the user to visually confirm anything that needs an actual browser.
- Secrets live in gitignored files at the repo root: `supabase/.service_role_key`, `cckt_password_supabase.txt`, `admin_login_info.txt`. Never commit these; `site/.env` (publishable Supabase URL/key) is also gitignored though not sensitive.
- **An `[hidden]`-toggled element (modal, lightbox, overlay) needs an explicit `.foo[hidden] { display: none; }` rule if that same class also sets `display` elsewhere.** Author CSS always overrides the browser's built-in `[hidden] { display: none; }` default regardless of selector specificity, so `.lightbox { display: flex }` alone leaves the element visibly stuck open forever once shown — toggling the `hidden` attribute from JS silently does nothing. This broke the homepage photo gallery's lightbox once already (`site/src/layouts/PublicLayout.astro`, `.lightbox[hidden]` rule).
- **A full-bleed photo background on `<body>` needs `background-attachment: fixed` on that layer.** `background-size: cover` without it sizes against the entire scrollable *document* height (not the viewport), forcing a huge, blurry upscale of a modest-resolution source photo on any page taller than one screen. The site-wide wood-panel background in `PublicLayout.astro` relies on this.
- **`sips --cropOffset <offsetY> <offsetX>` is the TOP-LEFT corner of the crop box** in source-image pixels, not a center-relative shift, and sips pads with black (rather than resizing) if the box runs past the source image's edges. Useful when carving a clean crop out of a larger building photo for a background/texture — iterate with small test crops and `Read` the result before committing to a final size.
- Source/reference photos (e.g. a volunteer's batch of new church photos) often land in `images/new_images/` at several MB each — always resize/compress with `sips` into `site/public/images/` before referencing them from a page; never serve the raw originals. The raw originals are not committed to git (too large) unless explicitly asked.
