-- Run this in Supabase SQL Editor to create the progress table.
-- Option B: one row per student, progress stored as JSONB (same shape as app state).

create table if not exists progress (
  student_key text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Optional: allow anon read/write for this table (no RLS = anyone with anon key can read/write).
-- For 5 months and no sensitive data this is acceptable.
-- To enable RLS later: alter table progress enable row level security;
-- Then add policies that restrict by student_key if needed.

-- Conversations table (for persisting quizzes added at /add).
create table if not exists conversations (
  id text primary key,
  title text not null,
  description text,
  unit text,
  lines jsonb not null,
  created_at timestamptz not null default now()
);

-- Optional: To seed Weather and Check-in quizzes, add them via the /add page (paste or JSON)
-- or run INSERT statements with the same id, title, and lines as in src/data/conversations.ts sampleConversations.
