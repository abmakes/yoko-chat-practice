# YOKO Chat Practice — Project Structure & Components

## Overview

**YOKO Chat Practice** is a single-page React app for practicing English conversations in a resort/hospitality context (YOKO Onsen Spa & Resort). Users select conversations, choose learning modes (Practice, Select Responses, Sentence Structure), and progress through them with optional Vietnamese translations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 5, React 18, TypeScript |
| Routing | react-router-dom v6 |
| State | React useState; progress persisted in localStorage via custom hook |
| Data fetching | @tanstack/react-query (QueryClient wired; no API calls in current flow) |
| UI | Tailwind CSS, Radix UI (shadcn/ui components), lucide-react |
| Forms | react-hook-form, @hookform/resolvers, zod (available; AddConversationDialog uses local state) |

---

## Directory Structure

```
yoko-chat-practice/
├── index.html
├── package.json
├── vite.config.ts          # Vite + @ alias "src" → ./src
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig*.json
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
└── src/
    ├── main.tsx             # Entry: createRoot + App
    ├── App.tsx              # Providers + Router
    ├── App.css
    ├── index.css            # Global styles, Tailwind
    ├── vite-env.d.ts
    ├── lib/
    │   └── utils.ts         # cn() etc.
    ├── data/
    │   └── conversations.ts # Types, sample data, helpers
    ├── hooks/
    │   └── useConversationProgress.ts
    ├── pages/
    │   ├── Index.tsx        # Main app view (list / mode pick / learning)
    │   └── NotFound.tsx     # 404
    ├── components/
    │   ├── Header.tsx
    │   ├── ConversationList.tsx
    │   ├── ModeSelection.tsx
    │   ├── PracticeMode.tsx
    │   ├── SelectResponsesMode.tsx
    │   ├── SentenceStructureMode.tsx
    │   ├── AddConversationDialog.tsx
    │   ├── ChatBubble.tsx
    │   ├── OptionButton.tsx
    │   ├── NavLink.tsx      # Router NavLink + className helpers
    │   └── ui/              # shadcn-style primitives (dialog, button, card, etc.)
    └── test/
        ├── setup.ts
        └── example.test.ts
```

---

## Entry Points & Routing

- **Entry:** `main.tsx` renders `<App />` into `#root`.
- **App.tsx** wraps the app with:
  - `QueryClientProvider`
  - `TooltipProvider`
  - `Toaster` (shadcn), `Sonner`
  - `BrowserRouter`
- **Routes:**
  - `/` → `Index` (main experience)
  - `*` → `NotFound`

All real UX lives on the Index page; routing is minimal.

---

## Data Layer

### Types (`src/data/conversations.ts`)

| Type | Purpose |
|------|--------|
| `ConversationLine` | `speaker: 'staff' \| 'guest'`, `english`, optional `vietnamese` |
| `Conversation` | `id`, `title`, `lines: ConversationLine[]` |

### Data & Helpers

- **sampleConversations:** Default conversations (e.g. Weather, Check-in).
- **generateWrongOptions(correctAnswer, allLines, currentSpeaker):** Returns wrong options for Select Responses (from opposite speaker lines).
- **parseConversationText(text, title):** Parses "Staff: ... / Guest: ..." text into a `Conversation` (or null).

### Progress (`src/hooks/useConversationProgress.ts`)

- **LearningMode:** `'practice' | 'select' | 'structure'`
- **State:** `ProgressState` = map of `conversationId` → `ConversationProgress` (per-mode completion + optional `bestScore` for select).
- **Persistence:** `localStorage` key `conversation-progress`.
- **API:**
  - `getProgress(conversationId)` — progress for one conversation
  - `completeMode(conversationId, mode, score?)` — mark mode complete / update best score
  - `isModeUnlocked(conversationId, mode)` — practice always; select after practice; structure after select with 100%
  - `getOverallProgress(conversationId)` — 0–3 completed modes

---

## View State (Index Page)

`Index.tsx` uses a single discriminated union for the main view:

```ts
type ViewState =
  | { type: 'list' }
  | { type: 'modeSelection'; conversation: Conversation }
  | { type: 'learning'; conversation: Conversation; mode: LearningMode };
```

- **list** → Conversation list.
- **modeSelection** → Mode picker for one conversation.
- **learning** → Active mode (practice / select / structure) for one conversation.

Additional state: `showVietnamese`, `conversations` (list of conversations), `showAddDialog`.

---

## Component Hierarchy

### Page Level

- **Index**
  - **Header** (Vietnamese toggle, back, add conversation)
  - **main** → content by `ViewState` (see below)
  - **AddConversationDialog** (controlled by `showAddDialog`)

### Content by ViewState

| ViewState | Component | Role |
|-----------|-----------|------|
| `list` | **ConversationList** | Lists conversations; cards show progress (1/3, 2/3, Complete); `onSelect` → modeSelection |
| `modeSelection` | **ModeSelection** | Shows conversation title + 3 mode cards (Practice, Select Responses, Sentence Structure); locked/unlocked and completed state from `useConversationProgress` |
| `learning` (practice) | **PracticeMode** | Step-through conversation; **ChatBubble** per line; progress bar; Complete → back to modeSelection |
| `learning` (select) | **SelectResponsesMode** | Staff lines after guest: choose correct staff response from options; **ChatBubble** + **OptionButton**; score; completion/restart |
| `learning` (structure) | **SentenceStructureMode** | Guest lines: reorder word tiles to form guest response; **ChatBubble** + tiles; completion/restart |

### Shared / Reusable Components

| Component | Location | Purpose |
|-----------|----------|--------|
| **Header** | `components/Header.tsx` | Logo "YOKO", back button (when not on list), add button (on list), Vietnamese toggle (Switch) |
| **ConversationList** | `components/ConversationList.tsx` | Renders conversation cards with progress badge and border (accent/warning/success) |
| **ModeSelection** | `components/ModeSelection.tsx` | Renders 3 **ModeCard**s (internal); uses `progress`, `isModeUnlocked` |
| **PracticeMode** | `components/PracticeMode.tsx` | Reveals lines one-by-one; completion screen with Continue |
| **SelectResponsesMode** | `components/SelectResponsesMode.tsx` | Quiz: correct staff response; options from `generateWrongOptions`; score and 100% gating for structure |
| **SentenceStructureMode** | `components/SentenceStructureMode.tsx` | Word tiles for guest line; shuffle; check answer; show correct answer on wrong |
| **AddConversationDialog** | `components/AddConversationDialog.tsx` | Dialog with Tabs: Paste (title + "Staff:/Guest:" text) or JSON; calls `onAdd(conversation)` |
| **ChatBubble** | `components/ChatBubble.tsx` | Single line: speaker label, bubble (staff/guest styling), optional Vietnamese |
| **OptionButton** | `components/OptionButton.tsx` | One option in Select mode; states: default, correct, incorrect, disabled |
| **NavLink** | `components/NavLink.tsx` | react-router NavLink with `className` / `activeClassName` / `pendingClassName` (not used in current Index flow) |

### UI Primitives (`components/ui/`)

Used by the app (non-exhaustive): **button**, **card**, **dialog**, **input**, **label**, **textarea**, **tabs**, **switch**, **toaster**, **toast** (sonner), **tooltip**. Rest are shadcn-style primitives available for future use (e.g. accordion, alert, avatar, dropdown, sheet).

---

## Data Flow Summary

1. **Conversations** — Held in `Index` state; initial value from `sampleConversations`; new ones from **AddConversationDialog** (`parseConversationText` or JSON).
2. **Progress** — `useConversationProgress()` in Index; `completeMode` called when user finishes a mode; `getProgress` / `getOverallProgress` / `isModeUnlocked` drive ModeSelection and list badges.
3. **View** — Index handlers (`handleBack`, `handleSelectConversation`, `handleSelectMode`, `handlePracticeComplete`, `handleSelectComplete`, `handleStructureComplete`) update `ViewState` and optionally call `completeMode`.
4. **Vietnamese** — `showVietnamese` passed from Index into Header (toggle) and into PracticeMode, SelectResponsesMode, SentenceStructureMode, ChatBubble, OptionButton for conditional Vietnamese text.

---

## Styling

- **Tailwind** + design tokens (e.g. `background`, `card`, `accent`, `success`, `destructive`, `staff-bubble`, `guest-bubble`) in `index.css` / `tailwind.config`.
- **Animations:** `animate-fade-in`, `animate-slide-up`; custom classes for option correct/incorrect (e.g. in `App.css` or component styles).
- **Layout:** Index is `max-w-lg mx-auto`; mobile-first.

---

## Testing

- **Vitest** + jsdom; entry `src/test/setup.ts`; example test in `src/test/example.test.ts`.
- No dedicated e2e or component test files referenced for the main feature set.

---

## External / Config

- **Port:** 8080 (Vite server).
- **Path alias:** `@` → `src/`.
- **Lovable tagger** plugin enabled in development only.

This file is the single source of truth for the app’s structure and components as of the assessment.
