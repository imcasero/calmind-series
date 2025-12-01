# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CalMind Series is a landing page and tournament hub for a competitive Pokémon gaming event organizer. Built with Astro for static site generation with Preact components for interactive features. The site features tournament divisions, player rankings, and community engagement tools.

**Tech Stack:**
- Astro 5.9.2 (SSG framework)
- Preact (for interactive components)
- Tailwind CSS 4.x (via Vite plugin)
- TypeScript
- pnpm (package manager)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (localhost:4321)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Format code with Prettier
pnpm format

# Check formatting without writing
pnpm format:check

# Run Astro CLI commands
pnpm astro [command]
```

## Architecture

### Component Structure

**Astro Components** (.astro files) - Server-rendered, no client-side JavaScript:
- `src/layouts/Layout.astro` - Base layout with Navbar and global styles
- `src/components/Navbar.astro` - Site navigation
- `src/components/Welcome.astro` - Hero section
- `src/components/Info.astro` - Information section
- `src/components/Divisions.astro` - Division cards overview
- `src/components/shared/ClassificationTable/ClassificationTable.astro` - Player rankings table
- `src/components/shared/LinkButton/LinkButton.astro` - Navigation link component

**Preact Components** (.tsx files) - Client-side interactive:
- `src/components/shared/DivisionTabs/DivisionTabs.tsx` - Tabbed interface for division pages (clasificación, participantes, calendario)
- `src/components/shared/TabNavigation/TabNavigation.tsx` - Generic tab navigation
- `src/components/shared/Button/Button.tsx` - Interactive button component

**When to use Preact:**
- Forms and user input
- Dynamic content that changes without page reload
- Tab switching, accordions, modals
- Client-side state management

**When to use Astro components:**
- Static content
- Server-rendered layouts
- SEO-critical content
- Components that don't need interactivity

### Data Management

**Current approach (Phase 1):**
- Data stored in JSON files (`src/data/divisions.json`)
- Manual updates through code changes
- No database, no CMS

**Data structure:**
```typescript
interface Player {
  id: number;
  name: string;
  avatar: string;
  pj: number;      // Partidos jugados (games played)
  pg: number;      // Partidos ganados (games won)
  pp: number;      // Partidos perdidos (games lost)
  points: number;
  isPromoted?: boolean;
  isChampion?: boolean;
}
```

### Page Structure

- `/` - Homepage with welcome, info, and division cards
- `/primera-division` - First division rankings and details
- `/segunda-division` - Second division rankings and details
- Additional pages planned: `/info`, `/contacto`, `/torneo-clasificatorio`, `/hall-of-fame`

### Design System

**Color Theme:**
- Primary: Purple (`jacksons-purple-*` shades)
- Accent: Yellow (`yellow-*` shades)
- Text: White with drop-shadows
- Background: Gradient purple with dotted pattern overlay

**Custom colors defined in global CSS:**
- `--color-jacksons-purple-300: #b9b7fb`
- Additional purple shades referenced via Tailwind classes

**Typography:**
- System font stack: `system-ui, sans-serif`
- Bold/black weights for headings
- Drop shadows for text contrast

**Component patterns:**
- Border thickness: `border-4`
- Border color: `border-yellow-400`
- Rounded corners: `rounded-lg`
- Box shadows: `shadow-2xl`
- Background opacity: `bg-{color}/80` or `bg-{color}/90`

### Static Assets

- `/public/favicon.svg` - Site icon
- `/public/normativa_pokemon_calmind_series.pdf` - Tournament rules document
- `src/assets/CalmindSeriesLogo.png` - Logo image (imported via Astro Image component)

## Code Style

**Prettier configuration:**
- Single quotes
- Semicolons
- 2-space indentation
- 100 character line width
- ES5 trailing commas
- Arrow parens: avoid

**File organization:**
- Shared/reusable components in `src/components/shared/`
- Page-specific components in `src/components/`
- Layouts in `src/layouts/`
- Data in `src/data/`
- Global styles in `src/styles/`

## Important Implementation Notes

1. **Preact integration:** Use `client:load` directive when embedding Preact components in Astro pages (e.g., `<DivisionTabs client:load>`)

2. **Responsive design:** All components should work on mobile devices. Use Tailwind's responsive prefixes (`sm:`, `md:`)

3. **Discord integration:** The site links to Discord server (`https://discord.gg/97GeP7uS`) for community engagement and registration

4. **Spanish language:** Content is in Spanish. UI labels use Spanish terminology (e.g., "Clasificación", "Participantes", "Calendario")

5. **Tournament divisions:**
   - Primera División: Top-tier players, shows champion indicator
   - Segunda División: Lower-tier players, shows promotion zones
   - Classification tables use Spanish abbreviations (PJ, PG, PP)

6. **Navigation:** Navbar links use `LinkButton` component with variants: `primary` (purple), `yellow` (accent)

## Future Development (from REQUIREMENTS.md)

**Phase 1 priorities:**
1. Info page - Tournament news and announcements
2. Contact page - Contact form and social links
3. Fix remaining navigation links

**Phase 2:**
4. First Division features - Match calendar, player profiles, replay links
5. Second Division features - Reuse First Division components
6. Qualifying Tournament page - Registration form and brackets

**Phase 3:**
7. Hall of Fame - Past champions showcase
8. Admin panel - Content management without code changes

## Testing the Site

After making changes:
1. Run `pnpm dev` to test locally
2. Check mobile responsiveness (site should work well on small screens)
3. Verify all navigation links work
4. Test interactive Preact components (tab switching)
5. Build with `pnpm build` to catch any SSG issues
