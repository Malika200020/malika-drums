# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page portfolio site for Malika Degaldoruwa, a professional drummer. Built as a
vanilla Vite + React SPA (no router — one page, anchor-linked sections).

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # tsc -b (type-check) then vite build
npm run lint      # eslint .
npm run preview   # preview production build locally
```

There is no test runner configured in this repo.

## Architecture

**Composition root**: [src/App.tsx](src/App.tsx) renders one `<section>` per page block, in order,
inside a single `MotionConfig reducedMotion="user"` (respects OS-level reduced-motion globally —
don't wrap individual sections in another `MotionConfig`). Sections live in `src/sections/` and are
self-contained: each owns its own local state, animation variants, and (where relevant) localStorage
persistence. There's no shared page-level state — cross-section coordination happens only through
anchors (`#about`, `#gear`, `#reels`, `#gallery`, `#contact`) that `Navbar` links to.

**Color system — single source of truth is [src/lib/colors.ts](src/lib/colors.ts)**:
- `COLORS` export is for JS/TS inline `style` props only (radial gradients, dynamic accent colors, etc.)
- Tailwind utility classes (`bg-surface-900`, `text-gold`, etc.) resolve through CSS custom properties
  defined in [src/index.css](src/index.css) and wired into [tailwind.config.ts](tailwind.config.ts) —
  this is what makes light/dark switch without touching component code
- `surface-*` and `foreground*` tokens are theme-aware (`var(--xxx)`, flipped by `html.light`); `gold`
  and `accent` are static brand colors, same in both themes
- If you add a new brand color, define it in both `COLORS` (colors.ts) and the CSS vars (index.css) —
  keeping them in sync is manual, there's no codegen
- Anti-FOUC: [index.html](index.html) has an inline script that reads `localStorage.theme` and applies
  `html.light` before React hydrates, to prevent a flash of the wrong theme

**Theme toggle**: [src/hooks/useTheme.ts](src/hooks/useTheme.ts) — dark is the default/fallback state;
toggling adds/removes the `light` class on `<html>` and persists to `localStorage['theme']`.

**Path alias**: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json` — update both if changed).

**shadcn/ui** is configured ([components.json](components.json)) but no components have been generated
yet — `cn()` in [src/lib/utils.ts](src/lib/utils.ts) (clsx + tailwind-merge) is the only shared UI utility
in use so far.

### Animation conventions (Framer Motion v12)

Every animated section defines its own local spring presets near the top of the file, typically:
```ts
const snap   = { type: 'spring', stiffness: 400-420, damping: 28-32 } as const  // interactive feedback
const gentle = { type: 'spring', stiffness: 240-260, damping: 22-24 } as const  // entrance/reveal
```
Reuse this naming/values pattern rather than inventing new ones per component. Design constraints
(see project memory for full rationale): hover scale ≤ 1.03, tap scale ~0.96, transitions 150-300ms,
restrained ambient motion (few glows/particles, low opacity).

TypeScript v12 gotchas that will otherwise fail to compile:
- Ease string literals need `as const` (e.g. `ease: 'easeIn' as const`)
- Spring configs need `type: 'spring' as const`
- Cubic-bezier arrays need an explicit tuple cast: `[0.4, 0, 0.2, 1] as [number, number, number, number]`

### Notable section internals

- **[src/sections/Gallery.tsx](src/sections/Gallery.tsx)** is the most complex section: a public
  masonry gallery plus a hidden admin flow (triple-click the section heading → 4-digit PIN modal →
  upload/manage panel). Uploaded images are client-side compressed to a data URL (canvas, max 1200px,
  JPEG q=0.82) and persisted to `localStorage` under `malika_gallery_v1` — there is no backend. PIN
  lockout state (`_failedAttempts`, `_lockedUntil`) is intentionally module-level, not component state,
  so it survives modal remounts within a session.
- **[src/sections/Reels.tsx](src/sections/Reels.tsx)** reads video metadata from
  [src/data/videos.ts](src/data/videos.ts) (`VIDEOS`, `CATEGORY_META`) and embeds TikTok videos via
  `https://www.tiktok.com/embed/v2/{id}` in a `createPortal` modal. To add a video, append to `VIDEOS`
  with its TikTok numeric ID and an existing `CategoryId`.
- Modals across sections (`Gallery`, likely others) use `createPortal(..., document.body)` plus a
  manual `keydown` listener for Escape-to-close and `document.body.style.overflow = 'hidden'` while open
  — follow this pattern for any new modal rather than introducing a dialog library.
