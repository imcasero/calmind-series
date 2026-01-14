# 🔌 Data Integration & API Strategy

## 🏗️ Direct PostgREST Architecture

This project interfaces directly with PostgreSQL via Supabase's auto-generated REST API. There is no intermediate backend layer; the Frontend is responsible for querying the "Intelligent Views" defined in the database schema.

## 📡 Core Data Sources

### 1. Unified Standings (`league_rankings`)

The primary source for the Dashboard. It provides a real-time, sorted list of trainers with all math already calculated.

- **Key Columns**: `nickname`, `total_points`, `set_balance`, `position`.
- **Fetching Logic**:

```typescript
const { data, error } = await supabase
  .from("league_rankings")
  .select("*")
  .eq("league_id", current_league_id)
  .order("position", { ascending: true });
```
