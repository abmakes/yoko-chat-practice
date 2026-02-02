# Implementation Plan: Student Selection, Supabase Progress, /add Route, Vercel Hosting

## Summary

- **Student selection on arrival:** Group (Group One Monday Wednesday / Group Two Wednesday Thursday) then name dropdown; identity saved in localStorage per device.
- **Progress per student:** Stored in **Supabase** (frontend-only, no auth), keyed by `student_key` (e.g. `group1:Alice`). React app uses Supabase JS client with anon key.
- **Hosting:** **Vercel** for the React app; **Supabase** free tier for the database.
- **Add conversation:** Only at **`/add`** route; remove add button from main student UI. Include exact JSON format guide for LLM-generated conversations.
- **Analytics:** Designed for later (same Supabase table or new tables); not implemented in this phase.

---

## 1. Student Selection Screen

**When to show:** On app load, if localStorage has no `studentKey` (or equivalent identity), show the selection screen. Otherwise show the existing conversation list.

**Flow:**

1. **Step 1 – Group:** Two options (e.g. cards): "Group One – Monday Wednesday" and "Group Two – Wednesday Thursday". User selects one.
2. **Step 2 – Name:** Dropdown (or list) of student names for that group. Names from **fixed config** in code (e.g. `src/data/groups.ts`).
3. On confirm: save `studentKey = \`${groupId}:${studentName}\`` (and optionally `groupId`, `studentName` separately) in localStorage. Then show main app.

**Routing:** Single entry route `/`; render either selection screen or main app based on "has identity in localStorage". No separate `/select` URL required.

**Data:** Fixed config file (e.g. `src/data/groups.ts`) exporting:

- `groups: { id: string, label: string, studentNames: string[] }[]`
- Example: `{ id: 'group1', label: 'Group One – Monday Wednesday', studentNames: ['Alice', 'Bob', ...] }`, and same for `group2`.

---

## 2. Supabase: Progress Storage (No Auth)

**Setup:**

- Create a Supabase project (free tier).
- One table for progress, e.g. `progress`:
  - Columns: `student_key` (text, primary key or part of composite), `conversation_id` (text), `mode` (text: practice | select | structure), `completed` (boolean), `best_score` (integer, nullable), `updated_at` (timestamptz).
  - Or: one row per student with a JSONB column holding the full progress object (simpler schema; same shape as current localStorage).
- Use **anon (public) key** from the frontend. No Supabase Auth; no login.
- Row Level Security (RLS): either leave disabled for this table (no sensitive data) or add a simple policy; for 5 months and no sensitive data, leaving RLS off is acceptable.

**Frontend:**

- Add `@supabase/supabase-js` dependency.
- Create a Supabase client (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Replace (or refactor) `useConversationProgress` so that:
  - It reads `studentKey` from localStorage (current identity). If none, do not fetch/write progress (or no-op).
  - **Fetch:** On load, `supabase.from('progress').select('*').eq('student_key', studentKey)` and normalize into the same shape the app uses today (e.g. `{ [conversationId]: { practice, select, structure } }`).
  - **Write:** On mode completion, upsert the row(s) for this `student_key` and conversation/mode (e.g. `supabase.from('progress').upsert({ student_key, conversation_id, mode, completed, best_score, updated_at })`).
- All progress read/write goes through Supabase; no localStorage for progress (identity only stays in localStorage).

**Schema option A (normalized rows):**

- Table: `progress(student_key, conversation_id, mode, completed, best_score, updated_at)` with primary key `(student_key, conversation_id, mode)`.
- GET: select all rows for `student_key`, then build client-side object `{ [conversationId]: { practice, select, structure } }`.
- POST: upsert one row per (student_key, conversation_id, mode).

**Schema option B (one row per student):**

- Table: `progress(student_key text primary key, data jsonb, updated_at timestamptz)`.
- GET: select one row for `student_key`; use `data` as the progress object.
- POST: upsert that row with updated `data` (merge or replace).

Option B is simpler for the frontend (one read, one write); Option A is easier for future analytics (e.g. counts per mode). Either is fine; pick one and implement consistently.

---

## 3. Vercel Hosting

- Connect the repo to Vercel; deploy the Vite/React app as a static site (or Vite preset).
- Build command: `npm run build` (or `bun run build`); output directory: `dist`.
- No serverless functions required for progress (Supabase is called directly from the browser).
- Environment variables in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (so the built app has them at runtime).

---

## 4. Add Conversation at /add Only

**Remove from student UI:**

- In `src/pages/Index.tsx` and `src/components/Header.tsx`: remove the add-conversation button and any state/dialog for adding. Header should not show "Add" on the main flow.

**New route:**

- In `src/App.tsx`, add `<Route path="/add" element={<AddConversationPage />} />` above the catch-all `*` route.
- **AddConversationPage:** New page (e.g. `src/pages/AddConversation.tsx`) that:
  - Renders the **exact JSON format guide** for adding a conversation (see below).
  - Reuses the existing add-conversation logic (paste "Staff:/Guest:" text and/or JSON). Move or reuse `AddConversationDialog` content into this page (or embed it).
  - Optionally: "Paste JSON" and "Paste text" tabs; JSON is the primary path for LLM-generated content.
- No link to `/add` in the student-facing UI; staff use the URL directly (e.g. bookmark).

**Conversations storage:** Today conversations live in React state and can be extended by "Add". If you want new conversations (added at `/add`) to persist across sessions, you have two options:

- **A)** Keep conversations in state + localStorage (or in Supabase). If Supabase: e.g. a `conversations` table readable by anon; add-conversation page inserts; main app fetches list on load. Requires one more table and fetch.
- **B)** For 5 months, keep current behavior: conversations are in-memory + sample list; only staff who visit `/add` can add; reload loses added conversations unless you persist them. Simplest.

If you want added conversations to persist for all users, use Supabase for conversations (one table, anon read/insert for add page); otherwise keep current in-memory add and document that added conversations are session-only unless you add persistence.

---

## 5. JSON Format Guide (on /add page)

On the `/add` page, show a clear, copy-pasteable spec so you can prompt an LLM and paste the result. Include:

- **Required fields:** `id`, `title`, `lines`.
- **Structure of each item in `lines`:** `speaker` (`"staff"` | `"guest"`), `english` (string), `vietnamese` (optional string).
- **Example minimal JSON** (2–3 lines).
- **Short rules:** double quotes, no trailing commas, valid JSON.

Optionally: a "Validate" button that checks pasted JSON against this spec before "Add".

---

## 6. Analytics (Later)

- No implementation in this phase.
- Same Supabase project can later add tables or columns (e.g. `attempts`, `visits`) and the frontend can send events (e.g. POST to a Supabase table or Edge Function). Keep `student_key` in all progress writes so analytics can be keyed by student/group.

---

## 7. Implementation Order

1. **Fixed groups config** (`src/data/groups.ts`) and **student selection screen** (group → name → save `studentKey` in localStorage); gate main app on "has identity".
2. **Supabase:** Create project, create `progress` table (choose schema A or B), get URL and anon key. Add `@supabase/supabase-js`, create client, env vars.
3. **Progress hook:** Refactor `useConversationProgress` to use Supabase (read/write by `studentKey` from localStorage); remove progress from localStorage.
4. **Route /add:** Add route and `AddConversationPage` with JSON format guide and existing add-conversation UI; remove add button and dialog from main student view.
5. **Vercel:** Connect repo, set build settings and `VITE_SUPABASE_*` env vars, deploy.
6. **(Later)** Analytics: schema + frontend events.

---

## 8. Environment Variables

- **Local and Vercel:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Add `.env.example` with these keys (no values) and ensure `.env` is in `.gitignore`.

This plan is the single source of truth for implementation with Supabase (frontend-only, no auth) and Vercel hosting.
