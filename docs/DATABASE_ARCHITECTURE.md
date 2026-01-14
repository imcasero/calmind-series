# 🗄️ Database Logic & Supabase Integration

## 🛰️ Architecture Overview

This project follows a **"Heavy Database / Thin Client"** architecture. Since there is no intermediate backend API (Serverless/Node.js), the business logic (scoring, ranking, and tie-breaking) is encapsulated directly within **PostgreSQL Views** and **Functions** inside Supabase.

## 🧠 Business Logic Encapsulation

The "Intelligence" of the application is decentralized into the following layers:

### 1. The Scoring Engine (`player_match_performance`)

- **Type**: Database View.
- **Responsibility**: Translates raw Bo3 set results into league points ($3, 2, 1, 0$).
- **Frontend Impact**: The frontend never calculates points; it simply displays the values provided by this view.

### 2. The Ranking Engine (`league_rankings`)

- **Type**: Database View.
- **Responsibility**: Handles complex sorting and tie-breaking rules.
- **Tie-break Order**:
  1. Total Points.
  2. Set Balance (Sets Won - Sets Lost).
  3. Total Sets Won.
- **Frontend Impact**: Fetching from this view ensures the "Official Standings" are consistent across all user sessions.

## 🛡️ Security Model (RLS)

Security is managed at the data layer using **Row Level Security (RLS)**:

- **Public Access**: All authenticated and anonymous users have `SELECT` permissions on competitive data (seasons, splits, standings, matches).
- **Admin Access**: Only users with the `service_role` or specific Admin UID can perform `INSERT`, `UPDATE`, or `DELETE` operations.

## ⚡ Real-time Synchronization

The application leverages Supabase **Realtime (Walrus)**.

- **Usage**: The frontend subscribes to the `matches` table.
- **Trigger**: Any update to a match score by the Admin automatically triggers a re-fetch or state update in the `StandingsTable` without a page reload.

## 🛠️ Maintenance

To modify scoring rules or ranking logic, you must update the SQL definitions in the Supabase SQL Editor. The frontend code remains agnostic to these changes as long as the View's schema stays consistent.
