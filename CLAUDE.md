# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **static template** for **Calmind Series**, a Pokemon-themed competitive tournament platform built with Next.js 16 + React 19. It displays division rankings and participant information using mock data for demonstration purposes.

## Commands

### Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server with Turbopack (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
pnpm check            # Lint and format (auto-fix)
```

### Development Tools

- **Turbopack**: Enabled for ultra-fast dev server (Next.js 16 native bundler)
- **Biome**: All-in-one toolchain for linting and formatting (replaces ESLint + Prettier)
- Configuration in `biome.json` with recommended rules for React/Next.js

## Architecture

### Directory Structure

```
├── app/
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout
│   ├── primera-division/page.tsx     # First division rankings (with mock data)
│   ├── segunda-division/page.tsx     # Second division rankings (with mock data)
│   ├── _lib/
│   │   └── types/                    # TypeScript types
│   └── _components/                  # Shared React components
├── public/                           # Static assets
```

### Key Architectural Patterns

**1. Server Components by Default**

- Division pages (`page.tsx`) are server components
- Interactive components use `'use client'` directive where needed
- Mock data is defined directly in the page components

**2. Data Flow**

```
Server Component (page.tsx)
  → Mock data defined in the component
    → Pass as props to Client Component
      → DivisionTabs
        → ClassificationTable (presentational)
        → ParticipantsList (presentational)
```

**3. Static Mock Data**

- Each division page has mock `Player[]` and `Participant[]` arrays
- Data demonstrates the UI/UX without requiring a backend

### Component Hierarchy

**Page Components (Server):**

- Define mock data arrays
- Pass to client components as props

**Client Components:**

- `ClassificationTable`: Rankings table with stats
- `DivisionTabs`: Tab navigation (Clasificación/Participantes/Calendario)
- `ParticipantsList`: Grid of trainer cards with social links
- `Navbar`, `Footer`, `LinkButton`, `DivisionCard`: UI primitives

### Styling Conventions

- **Tailwind CSS v4** with custom Pokemon-themed colors
- Custom colors: `jacksons-purple-*`, `retro-gold-*`, `retro-cyan-*`, `snuff-*`
- Custom font: `Press_Start_2P` (retro pixel font)
- `.retro-border` class: 3D button effect
- Mobile-first responsive design

## Working with This Codebase

### Modifying Mock Data

To change the displayed rankings or participants:

1. Edit the `mockPlayers` and `mockParticipants` arrays in division pages
2. Follow the `Player` and `Participant` type interfaces in `app/_lib/types/database.types.ts`

**To add new pages:**

- Create `app/new-page/page.tsx`
- Use server components by default
- Pass data to client components if interactivity needed

### Type System

All types in `app/_lib/types/database.types.ts`:

- `Player`: For classification tables (id, name, avatar, stats, badges)
- `Participant`: For participant cards (includes social media URLs)

### Styling Guide

**Pokemon-Themed Colors:**

- Gold tones: `retro-gold-300`, `retro-gold-400`, `retro-gold-500`
- Cyan tones: `retro-cyan-300`, `retro-cyan-500`, `retro-cyan-600`
- Purple tones: `jacksons-purple-600`, `jacksons-purple-700`, `jacksons-purple-800`
- Snuff tones: `snuff-500`, `snuff-600`, `snuff-800`

**Typography:**

- Headers use `pokemon-title` class
- Retro pixelated font with drop-shadow effects
- Uppercase tracking-wide for emphasis

## Common Modifications

### Updating Division Rankings Display

Edit `app/_components/ClassificationTable.tsx` for visual changes to the rankings table.

### Modifying Tab Navigation

Edit `app/_components/DivisionTabs.tsx` to add/remove tabs or change tab behavior.

### Adding New Participant Cards

Edit `app/_components/ParticipantsList.tsx` to customize participant card display.

### Changing Mock Data

Edit the division pages directly:
- `app/primera-division/page.tsx`
- `app/segunda-division/page.tsx`

## Project Context

- Migrated from Astro to Next.js in January 2026
- All backend logic removed - this is a pure frontend template
- Uses pnpm as package manager
- Spanish language UI
- Retro Pokemon aesthetic theme
- Amateur competitive Pokemon tournament platform
