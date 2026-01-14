# Frontend Architecture & Routing

## 🗺️ Smart Dashboard Structure

The routing is designed to minimize clicks and maximize data density during the regular season.

- `/[season]/[split]` -> **Master Dashboard**:
  - **Standings**: Direct view of 1st and 2nd Division tables side-by-side.
  - **Live Feed**: Current round results and upcoming matches.
- `/[season]/[split]/final` -> **Finals Hub**:
  - Dedicated view for Brackets (J8/J9) and the "Olympus" play-off.
  - **Gated Access**: The navigation link to this route is programmatically enabled only after Round 7 is marked as `completed` in the database.

## ⚙️ Logic Decisions

- **Contextual Hub**: By hosting both divisions in one view, we provide a holistic view of the "Promotion/Relegation" ecosystem.
- **Conditional Navigation**: Using the `played` status of Round 7 matches to trigger the visibility of the "Tournament Mode" UI elements.
