# Timer Arena - Implementation Plan

**Timer Arena** - A productivity and time-tracking app with gamified streaks, built with modern web technologies.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Package Manager | Bun |
| Backend | Supabase (Auth + Database) |
| State Management | Zustand + React hooks |
| Storage | LocalStorage (offline) + Supabase (cloud sync) |

---

## Architecture

### Auth Flow

```
App Entry → Check Auth State
                │
        ┌───────┴───────┐
        ▼               ▼
    Signed In      Not Signed In
        │               │
        ▼               ▼
    Dashboard    Landing Page + Sign In
        │               │
        └───────────────┤
                      ▼
            Anonymous Mode (localStorage)
```

### Data Sync (Local-First)

```
React Components → Sync Store (Zustand)
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
    LocalStorage                     Supabase
    (immediate write)              (background sync)
          │                               │
          ▼                               ▼
    Offline support                Cloud backup
    Instant UI                     Cross-device sync
```

---

## Database Schema (Supabase)

### Tables

**profiles**
```sql
id UUID PRIMARY KEY (auth.users)
email TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**sessions**
```sql
id UUID PRIMARY KEY (gen_random_uuid)
user_id UUID REFERENCES auth.users
start TIMESTAMPTZ NOT NULL
end TIMESTAMPTZ
duration INTEGER NOT NULL  -- seconds
created_at TIMESTAMPTZ
CREATE INDEX idx_sessions_user_date ON sessions(user_id, start);
```

**user_settings**
```sql
user_id UUID PRIMARY KEY (auth.users)
streak_threshold_minutes INTEGER DEFAULT 15
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**streaks**
```sql
user_id UUID PRIMARY KEY (auth.users)
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
last_qualified_date DATE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### RLS Policies

All tables include policies ensuring users can only access their own data via `auth.uid() = user_id` (or equivalent).

---

## Project Structure

```
time-arena/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing + Auth
│   │   ├── globals.css
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Auth guard + nav
│   │   │   ├── page.tsx                # Timer + Streak
│   │   │   ├── history/
│   │   │   │   └── page.tsx            # Session history
│   │   │   └── settings/
│   │   │       └── page.tsx            # Settings
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── timer/
│   │   │   ├── Timer.tsx
│   │   │   ├── TimerDisplay.tsx
│   │   │   └── TimerControls.tsx
│   │   ├── streak/
│   │   │   ├── StreakTile.tsx
│   │   │   └── StreakHeader.tsx
│   │   ├── sessions/
│   │   │   ├── SessionCard.tsx
│   │   │   ├── SessionList.tsx
│   │   │   └── TodaySummary.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   └── settings/
│   │       ├── SettingsForm.tsx
│   │       └── ClearDataDialog.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSessions.ts
│   │   ├── useTimer.ts
│   │   ├── useStreak.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── stores/
│   │   ├── useSessionStore.ts
│   │   ├── useSettingsStore.ts
│   │   └── useSyncStore.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── date.ts
│       ├── streak.ts
│       └── helpers.ts
├── supabase/
│   └── schema.sql
├── .env.local
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Implementation Phases

### Phase 1: Foundation
1. Initialize Next.js project with Bun
2. Install dependencies (Supabase, Zustand, date-fns, shadcn)
3. Setup shadcn/ui with initial config
4. Install shadcn components: button, card, dialog, input, label, select, switch, toast, skeleton, avatar, separator

### Phase 2: Core Types & Utilities
5. Create TypeScript types (`src/types/index.ts`)
6. Create utility functions:
   - `date.ts` - local date handling (YYYY-MM-DD)
   - `streak.ts` - streak calculation
   - `helpers.ts` - time formatting

### Phase 3: State Management
7. Setup Zustand stores with persistence:
   - `useSessionStore.ts` - sessions + localStorage
   - `useSettingsStore.ts` - user settings
   - `useSyncStore.ts` - sync status
8. Create custom hooks:
   - `useAuth.ts` - Supabase auth
   - `useSessions.ts` - session CRUD
   - `useTimer.ts` - timer logic
   - `useStreak.ts` - streak calculations
   - `useSettings.ts` - settings CRUD

### Phase 4: UI Components
9. Landing page with auth options
10. Dashboard layout with navigation
11. Timer components (Display, Controls, Main)
12. Streak components (Tile, Header)
13. Session components (Card, List, TodaySummary)
14. Settings components

### Phase 5: Pages
15. Home page (Timer + Streak)
16. History page (Session list)
17. Settings page (Configuration)

### Phase 6: Supabase Integration
18. Create and run database schema
19. Implement auth flow (sign up/in/out)
20. Implement sync logic (push/pull)
21. Add offline support

### Phase 7: Polish
22. Loading states (skeletons)
23. Toast notifications
24. Animations (framer-motion optional)
25. Responsive design

---

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Timer | `components/timer/Timer.tsx` | Main timer with Start/Pause/Stop |
| TimerDisplay | `components/timer/TimerDisplay.tsx` | Large time display (MM:SS) |
| TimerControls | `components/timer/TimerControls.tsx` | Control buttons |
| StreakTile | `components/streak/StreakTile.tsx` | Streak card with fire icon |
| StreakHeader | `components/streak/StreakHeader.tsx` | Header streak display |
| SessionCard | `components/sessions/SessionCard.tsx` | Individual session display |
| SessionList | `components/sessions/SessionList.tsx` | List of sessions |
| TodaySummary | `components/sessions/TodaySummary.tsx` | Today's total time |

---

## Sync Strategy

### Local-First Approach
- **Write**: LocalStorage (immediate) → Supabase (background)
- **Read**: LocalStorage cache → Supabase (if stale)
- **Conflict**: Last write wins (timestamp-based)

### Sync Flow
```typescript
// Push local sessions not in remote
const toPush = local.filter(s => !remote.includes(s.id));
await supabase.insertSessions(toPush);

// Pull remote sessions not in local
const toPull = remote.filter(s => !local.includes(s.id));
saveToLocalStorage(toPull);
```

---

## Supabase Schema (run in Supabase dashboard)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start TIMESTAMPTZ NOT NULL,
  end TIMESTAMPTZ,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_date ON sessions(user_id, start);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_threshold_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks table
CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_qualified_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own streak" ON streaks
  FOR ALL USING (auth.uid() = user_id);
```

---

## Environment Variables (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Commands Reference

### Install shadcn components
```bash
npx shadcn@latest add button card dialog input label select switch toast skeleton avatar separator
```

### Run development server
```bash
bun dev
```

### Build for production
```bash
bun build
```

---

## Success Criteria

- [ ] User can track time in ≤1 click
- [ ] Streak updates correctly every day
- [ ] No data loss on refresh
- [ ] App feels fast and distraction-free
- [ ] Works offline with localStorage
- [ ] Syncs to cloud when online
- [ ] Cross-device access with Supabase auth

---

## Future Enhancements (Post-MVP)

- GitHub-style contribution grid
- Pomodoro presets
- Tags/labels per session
- Mobile app (Expo)
- Analytics charts
- Notifications
