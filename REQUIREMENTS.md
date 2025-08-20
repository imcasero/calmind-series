# CalMind Tournament Website - Requirements

## Project Overview

Landing page and tournament hub for CalMind, a Pokémon competitive gaming event organizer. Built with Astro for static generation with interactive components when needed.

## Current Status

- ✅ **Home page complete** - Hero section, company info, division cards
- ✅ **Visual design established** - Purple/yellow theme, responsive layout
- ✅ **Navigation structure** - Navbar with all planned sections
- 🚧 **Individual pages needed** - All tournament and info pages pending

## Pages to Build

### 1. Information Hub (`/info`)

**What users can do:**

- Read latest tournament news and announcements
- Download tournament rules and regulations
- Check for any schedule changes or updates

**Content needed:**

- News feed (manually updated for now)
- Rules document section
- Important announcements area

### 2. First Division (`/primera-division`)

**What users can do:**

- View current standings/rankings
- See player profiles with stats
- Check match schedule and results
- Watch replays of completed matches

**Content needed:**

- Player ranking table
- Individual player cards with win/loss records
- Match calendar with dates and opponents
- Links to Pokémon Showdown replays

### 3. Second Division (`/segunda-division`)

**What users can do:**

- Same as First Division but for lower tier players
- See promotion/relegation status

**Content needed:**

- Same structure as First Division
- Separate player data and rankings

### 4. Qualifying Tournament (`/torneo-clasificatorio`)

**What users can do:**

- Register for tournaments via form
- View tournament brackets once generated
- Check tournament status (open/closed registration)

**Content needed:**

- Registration form with player details
- Tournament bracket display
- Registration status indicator

### 5. Hall of Fame (`/hall-of-fame`)

**What users can do:**

- View past champions and winners
- Browse tournament history
- See achievement records

**Content needed:**

- Champion showcase cards
- Tournament history timeline
- Notable achievements section

### 6. Contact (`/contacto`)

**What users can do:**

- Send messages via contact form
- Find Discord server links
- Get organizer contact info

**Content needed:**

- Simple contact form
- Social media and Discord links
- Staff information

## Data Management (Phase 1)

- Use JSON files for all content (no database yet)
- Manual content updates through code
- Future: Admin panel for easy updates

## Priority Order

### Phase 1 - Essential Pages

1. **Info page** - Most requested by users
2. **Contact page** - Easy to implement, high value
3. **Fix navigation** - Make all navbar links work properly

### Phase 2 - Tournament Features

4. **First Division page** - Core functionality
5. **Second Division page** - Reuse First Division components
6. **Qualifying Tournament** - Registration form

### Phase 3 - Nice to Have

7. **Hall of Fame** - Showcase achievements
8. **Admin panel** - Easy content management

## Key User Flows

### Tournament Participant

1. Arrives at homepage → sees divisions
2. Clicks division → views rankings and schedule
3. Checks match calendar → watches replays
4. Wants to join → goes to qualifying tournament

### New Visitor

1. Lands on homepage → learns about CalMind
2. Reads info section → understands rules
3. Checks contact → joins Discord community
4. Views Hall of Fame → gets inspired to participate

## Technical Notes

- Keep using current Astro + Tailwind setup
- Add Preact components only when interactivity needed (forms, dynamic content)
- Maintain current purple/yellow design theme
- Ensure mobile responsiveness for all new pages

## Success Criteria

- Users can easily navigate between all tournament sections
- Tournament information is clearly displayed and up-to-date
- Registration process is smooth and user-friendly
- Site works well on mobile devices
- Admin can update content without touching code (future phase)
