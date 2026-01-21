# Calmind Series

**Competitive Pokemon tournament platform with league system, promotions, and relegations.**

A web application designed to manage amateur Pokemon competitions featuring a dual-division system, real-time rankings, and a retro visual experience inspired by classic Pokemon games.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase)


## Features

### Competitive System
- **Dual Division**: First and Second Division with 8 participants each
- **Promotion/Relegation**: "The Olympus" system where the 2nd Division champion faces the last survivor of 1st Division
- **Seasons and Splits**: Structured calendar with regular season, playoffs, and finals

### User Experience
- **Real-Time Rankings**: Instant updates via Supabase Realtime
- **Retro Pokemon Design**: Pixel art aesthetic with Press Start 2P typography
- **Visual Zones**: "Golden Zone" for leaders and "Danger Zone" for relegation candidates
- **Responsive**: Adapted design for mobile, tablet, and desktop

### Technical
- **ISR (Incremental Static Regeneration)**: Pages regenerated every 60 seconds
- **Server Components**: Server-side rendering by default for better SEO
- **Smooth Animations**: Transitions powered by Motion (Framer Motion)
- **Type Safety**: Strict TypeScript with Zod validation

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL + Realtime) |
| **Animations** | Motion |
| **Validation** | Zod |
| **Linting/Format** | Biome |
| **Package Manager** | pnpm |

---

## Installation

### Prerequisites

- Node.js 20+
- pnpm 9+
- [Supabase](https://supabase.com) account (for full functionality)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/calmind-series.git
cd calmind-series
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run development server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## Available Scripts

```bash
pnpm dev      # Development server with Turbopack
pnpm build    # Production build
pnpm start    # Production server
pnpm lint     # Run linter (Biome)
pnpm format   # Format code
pnpm check    # Lint + format with auto-fix
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router (routes only)
│   ├── [season]/[split]/         # Dynamic routes by season/split
│   │   ├── cruces/               # Bracket matches
│   │   └── final/                # Finals page
│   ├── layout.tsx
│   ├── page.tsx
│   └── error.tsx
├── components/
│   ├── home/                     # Landing page components
│   │   ├── Hero/
│   │   ├── AboutCalmind/
│   │   ├── CurrentSeason/
│   │   └── TournamentFormat/
│   ├── divisions/                # Division-related components
│   │   ├── ClassificationTable/
│   │   ├── ClassificationSection/
│   │   ├── ParticipantsList/
│   │   ├── MatchesSection/
│   │   └── SplitContent/
│   └── shared/                   # Shared components
│       ├── ui/                   # UI primitives (Button, Tabs...)
│       └── layout/               # Layout components
├── lib/
│   ├── supabase/                 # Supabase client config
│   ├── queries/                  # Data fetching queries
│   ├── types/                    # TypeScript types
│   ├── constants/                # App constants
│   └── config/                   # Configuration
└── assets/                       # Static assets
```

---

## Architecture

### Data Flow

```
Supabase (PostgreSQL)
    │
    ├── Views (league_rankings, player_match_performance)
    │   └── Scoring and tiebreaker logic in SQL
    │
    └── Realtime (WebSocket)
            │
            ▼
    Server Components (ISR 60s)
            │
            ▼
    Client Components (Hydration)
            │
            ▼
    UI (Rankings, Participants)
```

### "Heavy Database / Thin Client" Architecture

Business logic (scoring, rankings, tiebreakers) is encapsulated in **PostgreSQL Views**, keeping the frontend as a pure presentation layer.

### Scoring System

| Result | Points |
|--------|--------|
| Win 2-0 | 3 |
| Win 2-1 | 2 |
| Loss 1-2 | 1 |
| Loss 0-2 | 0 |

**Tiebreaker Criteria:**
1. Total points
2. Set balance (won - lost)
3. Total sets won

---

## Deployment

### Vercel (Recommended)

1. Fork/Push the code to GitHub
2. Connect the repository at [vercel.com](https://vercel.com)
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Automatic deploy on every push to `main`

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRODUCT.md](docs/PRODUCT.md) | Product vision and features |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Frontend architecture and routing |
| [DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md) | Database logic and Supabase |
| [TOURNAMENT_FLOW.md](docs/TOURNAMENT_FLOW.md) | Tournament flow and playoffs |
| [UI_STATES.md](docs/UI_STATES.md) | Visual states and phases |

---

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Conventions

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
- **Code**: Run `pnpm check` before committing
- **Branches**: `feature/*`, `fix/*`, `docs/*`

---

<p align="center">
  <strong>Calmind Series</strong> - Amateur Pokemon Competition
</p>
