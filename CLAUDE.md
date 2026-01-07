# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for **Calmind Series**, a Pokemon-themed competitive tournament platform. The active project is in `calmind-series/` (Next.js 16 + React 19 + Supabase). It displays real-time division rankings with live updates using Supabase Realtime.

## Commands

### Development

```bash
cd calmind-series
pnpm install          # Install dependencies
pnpm dev              # Start dev server with Turbopack (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
pnpm check            # Lint and format (auto-fix)
```

### Environment Setup

Create `.env.local` in `calmind-series/` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Tools

- **Turbopack**: Enabled for ultra-fast dev server (Next.js 16 native bundler)
- **Biome**: All-in-one toolchain for linting and formatting (replaces ESLint + Prettier)
- Configuration in `biome.json` with recommended rules for React/Next.js

## Architecture

### Directory Structure

```
calmind-series/
├── app/
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout
│   ├── primera-division/page.tsx     # First division rankings
│   ├── segunda-division/page.tsx     # Second division rankings
│   ├── _lib/
│   │   ├── services/                 # Data fetching services
│   │   ├── hooks/                    # React hooks for real-time
│   │   ├── supabase/                 # Supabase client configs
│   │   └── types/                    # TypeScript types
│   └── _components/                  # Shared React components
├── public/                           # Static assets
```

### Key Architectural Patterns

**1. Server vs Client Components**

- Division pages (`page.tsx`) are **server components** that fetch initial data
- Interactive components use `'use client'` directive
- `getDivisionData()` service runs server-side only

**2. Data Flow**

```
Server Component (page.tsx)
  → getDivisionData() service
    → Supabase Server Client
      → Pass as props to Client Component
        → LiveClassificationTable
          → useRealtimeRankings hook
            → Supabase Browser Client (realtime subscription)
```

**3. Dual Supabase Client Pattern**

- `app/_lib/supabase/server.ts`: Server-side client (async, cookie-based auth)
- `app/_lib/supabase/client.ts`: Browser client (client-side, realtime subscriptions)

**4. ISR (Incremental Static Regeneration)**

- Division pages use `export const revalidate = 60;`
- Pages regenerate every 60 seconds for fresh data with good performance

### Supabase Real-Time Implementation

**Database Tables:**

- `seasons`: Tournament seasons (has `is_active` flag)
- `divisions`: Primera/Segunda divisions per season
- `trainers`: Participant profiles with social media links
- `division_participants`: Junction table with stats (points, matches_won, etc.)
- `matches`: Match scheduling (future feature)

**Real-Time Flow:**

1. `useRealtimeRankings` hook subscribes to `division_participants` table
2. On any INSERT/UPDATE/DELETE, PostgreSQL notification triggers
3. Hook refetches data for that division
4. Component re-renders with updated rankings
5. Green "En Vivo" indicator shows when subscribed

**Channel Pattern:**

```typescript
supabase.channel(`division_${divisionId}`).on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "division_participants",
    filter: `division_id=eq.${divisionId}`,
  },
  callback
);
```

### Data Transformation Pattern

Both server service and client hook use identical transformation logic:

1. Fetch `division_participants` with nested `trainers` join
2. Order by `points DESC`, then `matches_won DESC`
3. Map to `Player[]` array with position-based badges:
   - Champion: Position 1 in Primera División
   - Promoted: Position 1-2 in Segunda División
4. Return structured `DivisionData` object

### Component Hierarchy

**Page Components (Server):**

- Fetch data with `getDivisionData()`
- Pass to client components as props

**Client Components:**

- `LiveClassificationTable`: Wraps table with real-time hook
- `ClassificationTable`: Presentational table (reusable)
- `DivisionTabs`: Tab navigation (Clasificación/Participantes/Calendario)
- `ParticipantsList`: Grid of trainer cards with social links
- `Navbar`, `Footer`, `LinkButton`, `DivisionCard`: UI primitives

### Styling Conventions

- **Tailwind CSS v4** with custom Pokemon-themed colors
- Custom colors: `jacksons-purple-*`, `retro-gold-*`, `retro-cyan-*`
- Custom font: `Press_Start_2P` (retro pixel font)
- `.retro-border` class: 3D button effect
- Mobile-first responsive design

## Working with This Codebase

### Adding New Features

**To modify rankings display:**

- Edit `app/_components/ClassificationTable.tsx`
- Badge logic is position-based in `getDivisionData()` transformation

**To change data queries:**

- Edit `app/_lib/services/division.service.ts`
- Use `.select()` with nested joins: `division_participants(...trainers(...))`
- Mirror changes in `useRealtimeRankings` hook for consistency

**To add new pages:**

- Create `app/new-page/page.tsx`
- Use server components for initial fetch
- Pass data to client components if interactivity needed

### Type System

All types in `app/_lib/types/database.types.ts`:

- Database types: `Trainer`, `Division`, `DivisionParticipant`, `Season`, `Match`
- Frontend types: `Player` (for tables), `Participant` (for cards)
- Use proper imports to maintain type safety

### Performance Considerations

- ISR caching reduces Supabase reads (60s revalidate)
- Real-time only subscribes on changes, not constant polling
- Next.js `Image` component for optimized images
- Tab content conditionally renders (only active tab)
- Channel cleanup on component unmount

## Common Modifications

### Updating Division Rankings Logic

Edit `app/_lib/services/division.service.ts:45-70` where players array is created and badges applied.

### Changing Real-Time Behavior

Edit `app/_lib/hooks/useRealtimeRankings.ts` subscription callback at line ~30.

### Modifying Table Display

Edit `app/_components/ClassificationTable.tsx` for visual changes to the rankings table.

### Adding Database Queries

Use the nested query pattern:

```typescript
const { data } = await supabase
  .from("division_participants")
  .select(
    `
    *,
    trainers (
      id,
      name,
      twitch_url,
      twitter_url,
      instagram_url
    )
  `
  )
  .eq("division_id", divisionId)
  .order("points", { ascending: false });
```

## Project Context

- Migrated from Astro to Next.js in January 2026
- Uses pnpm as package manager
- Spanish language UI
- Retro Pokemon aesthetic theme
- Amateur competitive Pokemon tournament platform
- Real-time updates are critical feature for live tournament tracking
