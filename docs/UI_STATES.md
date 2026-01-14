# UI/UX Visual States

## 🔄 Phase-Based Navigation

The UI must mutate based on the `current_round` value:

### 1. Regular Season Phase (J1-J7)

- **Primary View**: Two-column layout showing both Division Standings.
- **Tournament Access**: A "Coming Soon" or "Projected Brackets" teaser button that remains disabled or leads to a "Projections" overlay.

### 2. Post-Season Phase (J8-J9)

- **Primary View**: The Navigation Bar highlights a new "THE FINALS" button.
- **Auto-Redirect**: Optionally, if the user lands on the Hub, a prominent banner invites them to the `/final` route where the action is now happening.

## ⚔️ Final Hub Locking Logic

- **Locked State**: Component displays a countdown or a "Season in Progress" message.
- **Active State**: Once Round 7 is closed, the bracket transitions from "Tentative" (Standings-based) to "Official" (Fixed database records).
