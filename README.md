# Hour Focus

**Hour Focus** (npm package name: `hourly-task-focus`) is a single-page web app for task-based focus: you maintain a task board, run a **one-hour sprint** timer on the task you care about, and your logged time feeds **analytics** and **local persistence**. It is built for people who want a simple, visual way to commit to deep work and see where their focus time went.

---

## Technologies

| Area | Stack |
|------|--------|
| **UI** | [React](https://react.dev/) 18 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Build & dev server** | [Vite](https://vitejs.dev/) 5 |
| **Routing** | [React Router](https://reactrouter.com/) v6 (`BrowserRouter`, `Routes`, `Link`, `Navigate`) |
| **Animation & layout** | [Framer Motion](https://www.framer.com/motion/) (page transitions, list layout, reduced-motion aware timings) |
| **Styling** | Custom CSS (`src/styles.css`), [Google Fonts](https://fonts.google.com/) — **Inter** and **Dancing Script** (see `index.html`) |
| **Persistence** | Browser **localStorage** (`hour-focus-tasks-v1` in `src/tasksStorage.ts`) |
| **Testing** | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/) (React, Jest DOM, user-event) |

---

## Features

### Task board (home `/`)

- **Add tasks** with the input field and **Add**, or press **Enter** in the new-task field.
- **Select** an open task (click the title) so the sprint timer attributes time to that task.
- **Mark complete** with the checkbox; completed tasks stop receiving sprint time and can be cleared from selection logic.
- **Edit** titles (pencil): inline field; **Enter** or blur saves; empty input falls back to the previous title.
- **Delete** tasks from the list.
- **Active task count** badge for open (incomplete) tasks.
- While a sprint is **started** (after **Start focus**), **task selection is locked** to the sprint task until **Restart** — so pausing early does not let you accidentally switch context.

### One Hour Sprint (`TimerPanel`)

- **60-minute** countdown (`ONE_HOUR_SECONDS` in `src/utils.ts`).
- **Start focus** / **Pause** / **Restart** controls.
- Each second the timer runs while a task is active and not completed, **`spentSeconds`** on that task increases.
- **Progress bar** and large clock display.
- **Fullscreen sprint mode** for a minimal, immersive view (see keyboard shortcuts below).
- Respects **prefers-reduced-motion** for shorter or minimal motion where Framer Motion is used.

### Analytics (`/analytics`)

- **Total focus time** across all tasks (recorded sprint time).
- **Tasks completed** count and **average wall time** from task creation to marking complete.
- **Average session** length per task that has any logged time.
- **Time to complete** chart for recently completed tasks (relative bar lengths).
- **Focus activity** chart: time bucketed by **weekday of task creation** (documented in-app as a proxy for when work was added).
- **Top focus tasks** with bar comparison.
- **Daily goal** strip: progress against a **6-hour** all-time reference and a simple “streak” style day count from board data.
- **Weekly insight** copy generated from your data.
- **Export report**: downloads a dated **JSON** file of all tasks.

### General

- **Light and dark** themes (toggle in header on both main views).
- **Unknown routes** redirect to `/`.
- Data is **auto-saved** to localStorage shortly after task changes (debounced in `App.tsx`).

---

## How to use it

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) with **npm** (or compatible package manager).

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). The app uses the **HTML5 History API** via `BrowserRouter`; for static hosting you may need server fallback to `index.html` for direct loads of `/analytics`.

### Production build

```bash
npm run build
```

Output is written to `dist/`. Preview locally:

```bash
npm run preview
```

### Tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Typical workflow

1. Open **Tasks** and add what you are working on.
2. **Click** a task title to select it.
3. On the right, press **Start focus** to begin the hour sprint; time accrues on that task while the timer runs.
4. Use **Pause** when you need a break; **Restart** resets the hour and unlocks switching tasks again.
5. When work is done, **check** the task complete on the card.
6. Visit **Analytics** to review totals, patterns, and export a JSON backup.

---

## Keyboard shortcuts

Global shortcuts **do not run** when focus is in a text-like control (text inputs, textarea, select, contenteditable), so you can type `a` or `f` in task names without triggering navigation or fullscreen.

| Shortcut | Action |
|----------|--------|
| **A** | Toggle between **Tasks** (`/`) and **Analytics** (`/analytics`). |
| **F** | Toggle **fullscreen sprint** mode (sprint panel expanded). |
| **Escape** | Exit fullscreen sprint when it is active. |
| **Enter** (in “New task” field) | Add the task (same as clicking **Add**). |
| **Enter** (while editing a task title) | Save the new title and leave edit mode. |

---

## How it is useful

- **Single-task focus**: the hour sprint and lock-after-start encourage finishing one context before switching.
- **Honest time on tasks**: logged seconds tie directly to the task you had selected, which makes reviews more meaningful than a generic stopwatch.
- **Lightweight analytics**: totals, top tasks, and completion timing help you see **where time went** and how long tasks really take — without a heavy project-management suite.
- **Privacy-first**: data stays in **your browser** (localStorage); export JSON when you want a backup or to move data.
- **Quick to run**: Vite + React keeps the tool fast to develop and deploy as a static site.

---

## Project layout (high level)

- `src/App.tsx` — routes, task state, persistence effect, global **A** shortcut; focus page and **F** / **Escape** for sprint fullscreen.
- `src/components/` — UI pieces (`TaskCard`, `TimerPanel`, `AnalyticsPage`, etc.).
- `src/tasksStorage.ts` — load/save tasks and storage key.
- `src/types.ts` — `Task` shape (`id`, `title`, `spentSeconds`, `createdAt`, `completed`, optional `completedAt`).
- `src/utils.ts` — timer length, formatting, analytics helpers.

---

## License / name

The repository is marked **private** in `package.json`. The browser tab title in `index.html` is **Hour Tasks**; in-app branding reads **Hour Focus**.
