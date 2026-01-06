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
| Icons | React Icons |

## Color Scheme

**Black, Orange, and White**

| Role | Color | Tailwind Token |
|------|-------|----------------|
| Background | Black (#0A0A0A) | `bg-black` |
| Surface | Dark Gray (#1A1A1A) | `bg-zinc-900` |
| Primary | Vibrant Orange (#FF6B35) | `text-orange-500`, `bg-orange-500` |
| Primary Hover | Darker Orange (#E55A2B) | `hover:bg-orange-600` |
| Text Primary | White (#FFFFFF) | `text-white` |
| Text Secondary | Light Gray (#A1A1AA) | `text-zinc-400` |
| Border | Medium Gray (#3A3A3A) | `border-zinc-700` |

**Accent Colors**
- Streak fire: Bright Orange (#FF4500)
- Success: Orange-White gradient
- Timer active: Pulsing orange glow

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
1. Initialize Next.js project with Bun ✓
2. Install dependencies (Supabase, Zustand, date-fns, react-icons) ✓
3. Setup shadcn/ui with initial config ✓
4. Install shadcn components: button, card, dialog, input, label, select, switch, sonner, skeleton, avatar, separator ✓

### Phase 2: Core Types & Utilities
5. Create TypeScript types (`types/index.ts`) ✓
6. Create utility functions:
   - `utils/date.ts` - local date handling (YYYY-MM-DD) ✓
   - `utils/streak.ts` - streak calculation ✓
   - `utils/helpers.ts` - time formatting ✓

### Phase 3: State Management
7. Setup Zustand stores with persistence ✓
   - `stores/useSessionStore.ts` - sessions + localStorage ✓
   - `stores/useSettingsStore.ts` - user settings ✓
   - `stores/useSyncStore.ts` - sync status ✓
8. Create custom hooks ✓
   - `hooks/useAuth.ts` - Supabase auth ✓
   - `hooks/useSessions.ts` - session CRUD ✓
   - `hooks/useTimer.ts` - timer logic ✓
   - `hooks/useStreak.ts` - streak calculations ✓
   - `hooks/useSettings.ts` - settings CRUD ✓

### Phase 4: UI Components
9. Landing page with auth options
10. Dashboard layout with navigation ✓
11. Timer components (Display, Controls, Main) ✓
12. Streak components (Tile, Header) ✓
13. Session components (Card, List, TodaySummary) ✓
14. Settings components ✓

### Phase 5: Pages
15. Home page (Timer + Streak) ✓
16. History page (Session list) ✓
17. Settings page (Configuration) ✓

### Phase 6: Supabase Integration
18. Create and run database schema ✓ (`supabase/schema.sql`)
19. Implement auth flow (sign up/in/out) ✓
20. Implement sync logic (push/pull) ✓
21. Add offline support ✓

**Supabase Setup:**
1. Create project at https://supabase.com
2. Run `supabase/schema.sql` in Supabase SQL editor
3. Add credentials to `.env.local`

### Phase 7: Polish
22. Loading states (skeletons) - Native to shadcn/ui
23. Toast notifications - Sonner configured ✓
24. Animations - Tailwind animate.css ✓
25. Responsive design - Mobile nav + sidebar ✓

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
npx shadcn@latest add button card dialog input label select switch sonner skeleton avatar separator
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

- [x] User can track time in ≤1 click
- [x] Streak updates correctly every day
- [x] No data loss on refresh (localStorage)
- [x] App feels fast and distraction-free
- [x] Works offline with localStorage
- [x] Syncs to cloud when online (Supabase)
- [x] Cross-device access with Supabase auth

---

## Future Enhancements (Post-MVP)

- GitHub-style contribution grid
- Pomodoro presets
- Tags/labels per session
- Mobile app (Expo)
- Analytics charts
- Notifications

---

## Implementation Plan (v2.0 - Pending)

### Issues to Fix

#### Issue 1: Timer Not Working
**Root cause**: The `useEffect` in `useTimer.ts` only runs when `isRunning` or `lastStartTime` changes, but doesn't handle the interval properly. The timer state updates but the UI doesn't reflect changes.

** the timer logic -Fix**: Simplify move interval management entirely to the `start`/`pause`/`resume` functions without relying on `useEffect` for the interval.

---

### New Features (v2.0)

#### Feature 1: Pomodoro Timer (Work/Break Modes)

Add timer modes:
- **Work mode**: Default configurable (25 min)
- **Break mode**: Default configurable (5 min)
- Auto-switch between modes when timer completes (wait for user confirmation)
- Browser notification when timer completes

**UI Changes**:
- Add mode selector (Work/Break toggle)
- Show remaining time with progress indicator
- Settings page to configure durations

**Database Schema Updates**:
```sql
ALTER TABLE user_settings ADD COLUMN work_duration_minutes INTEGER DEFAULT 25;
ALTER TABLE user_settings ADD COLUMN break_duration_minutes INTEGER DEFAULT 5;
ALTER TABLE user_settings ADD COLUMN auto_start_break BOOLEAN DEFAULT false;
```

**New Components**:
| File | Purpose |
|------|---------|
| `components/timer/TimerModeSelector.tsx` | Work/Break toggle switch |
| `components/timer/ProgressRing.tsx` | Circular progress indicator |

---

#### Feature 2: Supabase Authentication (Email + GitHub)

**Auth Methods**:
- Email/Password sign up and sign in
- GitHub OAuth (via Supabase)

**New Files**:
| File | Purpose |
|------|---------|
| `hooks/useAuth.ts` | Auth state & methods (signUp, signIn, signOut, session) |
| `components/auth/AuthForm.tsx` | Login/signup UI with toggle |
| `components/auth/AuthProvider.tsx` | React context for auth state |
| `app/(auth)/login/page.tsx` | Login page |
| `app/(auth)/signup/page.tsx` | Signup page |
| `middleware.ts` | Route protection |

**Auth Flow**:
```
App Entry → Check Auth State
                │
        ┌───────┴───────┐
        ▼               ▼
    Signed In      Not Signed In
        │               │
        ▼               ▼
    Dashboard    Landing + Auth Modal
        │               │
        └───────────────┤
                      ▼
            Anonymous Mode (localStorage)
```

**Note**: Routes remain accessible to anonymous users - auth is optional for cloud sync.

---

#### Feature 3: Cloud Sync for Timer State

Save timer state to Supabase for cross-device sync and real-time updates.

**New Database Table**:
```sql
CREATE TABLE timer_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_running BOOLEAN DEFAULT false,
  elapsed_seconds INTEGER DEFAULT 0,
  mode TEXT DEFAULT 'work',  -- 'work' or 'break'
  work_duration_seconds INTEGER DEFAULT 1500,
  break_duration_seconds INTEGER DEFAULT 300,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE POLICY "Users can CRUD own timer state" ON timer_states
  FOR ALL USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_timer_states_user ON timer_states(user_id);
```

**Behavior**:
- On timer start/pause/stop: save state to `timer_states` table
- On page load: fetch state from `timer_states` and restore
- Real-time updates via Supabase subscriptions (optional enhancement)

**Hook Update**:
- `hooks/useTimer.ts`: Add `syncTimerState()` function that saves to Supabase
- `hooks/useTimer.ts`: Add `restoreTimerState()` function on mount

---

#### Feature 4: GitHub-Style Activity Heatmap

Show daily activity as a configurable heatmap grid.

**Component**: `components/streak/ActivityHeatmap.tsx`

**Visual**:
```
□ ■ ■ □ □ ■ ■ ■ □
■ ■ □ □ ■ ■ □ ■ □
□ □ □ ■ ■ ■ □ □ □
```

- Each cell = one day (last 365 days configurable)
- Color intensity = total minutes that day
- Click cell to show day's sessions in modal
- Tooltip with exact minutes on hover

**Color Scale** (5 levels):
| Level | Minutes | Color (Tailwind) |
|-------|---------|------------------|
| 0 | 0 min | `bg-zinc-800` |
| 1 | 1-15 min | `bg-orange-900/30` |
| 2 | 15-30 min | `bg-orange-800/50` |
| 3 | 30-60 min | `bg-orange-600/70` |
| 4 | 60+ min | `bg-orange-500` |

**Configurable Periods**:
- 30 days (default)
- 60 days
- 90 days
- 120 days
- 150 days
- 180 days

**New Files**:
| File | Purpose |
|------|---------|
| `components/streak/ActivityHeatmap.tsx` | Main heatmap grid |
| `components/streak/HeatmapCell.tsx` | Individual day cell |
| `components/streak/HeatmapLegend.tsx` | Color scale legend |
| `components/streak/PeriodSelector.tsx` | Dropdown to select period |

**Data Aggregation**:
```typescript
function getDailyMinutes(sessions: Session[]): Record<string, number> {
  // Group sessions by date, sum durations
  return sessions.reduce((acc, session) => {
    const date = formatLocalDate(new Date(session.start));
    acc[date] = (acc[date] || 0) + session.duration;
    return acc;
  }, {});
}
```

---

### Implementation Order (v2.0)

| Phase | Tasks | Status |
|-------|-------|--------|
| **1** | Fix timer not working (debug interval issue) | Pending |
| **2** | Add Pomodoro mode selector + settings | Pending |
| **3** | Implement Supabase auth (useAuth hook + login page) | Pending |
| **4** | Add timer_states table + cloud sync | Pending |
| **5** | Create ActivityHeatmap component + Dashboard integration | Pending |

---

### Database Schema (Complete v2.0)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration INTEGER NOT NULL,
  mode TEXT DEFAULT 'work',  -- 'work' or 'break'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_date ON sessions(user_id, start);
CREATE INDEX idx_sessions_user_mode ON sessions(user_id, mode);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_threshold_minutes INTEGER DEFAULT 15,
  work_duration_minutes INTEGER DEFAULT 25,
  break_duration_minutes INTEGER DEFAULT 5,
  auto_start_break BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
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

-- Timer states table (for cloud sync)
CREATE TABLE timer_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_running BOOLEAN DEFAULT false,
  elapsed_seconds INTEGER DEFAULT 0,
  mode TEXT DEFAULT 'work',
  work_duration_seconds INTEGER DEFAULT 1500,
  break_duration_seconds INTEGER DEFAULT 300,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_timer_states_user ON timer_states(user_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own streak" ON streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own timer state" ON timer_states
  FOR ALL USING (auth.uid() = user_id);

-- Trigger to create profile/settings/streak on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  INSERT INTO public.user_settings (user_id, streak_threshold_minutes, work_duration_minutes, break_duration_minutes)
  VALUES (NEW.id, 15, 25, 5);
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_qualified_date)
  VALUES (NEW.id, 0, 0, NULL);
  INSERT INTO public.timer_states (user_id, is_running, elapsed_seconds, mode, work_duration_seconds, break_duration_seconds)
  VALUES (NEW.id, false, 0, 'work', 1500, 300);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### User Preferences (Confirmed)

| Setting | Value |
|---------|-------|
| Auth methods | Email/Password + GitHub OAuth |
| Timer sounds | Browser notifications only |
| Break auto-start | Wait for user confirmation |
| Heatmap default | 90 days |
| Heatmap periods | 30, 60, 90, 120, 150, 180 days |
