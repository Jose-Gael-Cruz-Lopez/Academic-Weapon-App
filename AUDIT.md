# Academic Weapon App — Phase 0: Repo Audit

**Date:** 2026-02-15  
**Repo:** https://github.com/Jose-Gael-Cruz-Lopez/Academic-Weapon-App

---

## 1. Current Tech Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | React 18 (functional components + hooks) |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3.4 + custom pixel-art theme |
| State Management | React Context API (`AppContext.jsx`) |
| Icons | Iconify |
| Fonts | VT323 (pixel), Inter |

**Missing for full implementation:**
- TypeScript (currently plain JSX)
- Local storage layer (Dexie/IndexedDB)
- Firebase SDK
- Testing framework

---

## 2. Current Data Layer (Mock Data)

### Location
`src/context/AppContext.jsx` + `src/data/mockData.js`

### Data Models (Current State)

**Course (simplified):**
```javascript
{
  id: string,
  code: string,        // e.g., "CS 101"
  name: string,
  color: string,      // Tailwind class: 'bg-rpg-blue', etc.
  instructor: string
}
```

**Assignment (simplified):**
```javascript
{
  id: string,
  courseId: string,    // FK to Course
  title: string,
  type: string,        // 'Lab', 'Quiz', 'Exam', 'Reading', 'Homework', 'Project'
  dueDate: string,     // ISO date '2023-10-25'
  status: string,      // 'Not Started', 'In Progress', 'Complete', 'Submitted'
  points: number,      // renamed to points_possible in target schema
  isFocus: boolean     // not in target schema (will map to priority)
}
```

### State Management
- All data lives in `AppContext` using `useState`
- No persistence — data resets on refresh
- CRUD operations: `addAssignment`, `updateStatus`, `toggleFocus`
- Stats computed with `useMemo` for Dashboard

---

## 3. Integration Points for Repository Layer

### Where to Plug In

1. **Replace `AppContext.jsx`** — maintain same API surface but swap mock data for repositories
2. **Pages to update:**
   - `Dashboard.jsx` — already uses context, minimal changes
   - `AssignmentsPage.jsx` — needs repo calls for CRUD
   - `CalendarPage.jsx` — needs date-filtered assignment queries
   - `ClassesPage.jsx` — needs course CRUD
   - `ImportPage.jsx` — needs real parsing pipeline (Phase 6)

3. **Components (no changes needed):**
   - `PixelCard`, `PixelBtn`, `PixelInput`, `PixelBadge`, `SectionHeader`, `NavBar` — pure UI

### Hook Mapping Strategy

| Current | New (Phase 7) |
|---------|---------------|
| `useContext(AppContext)` → `courses` | `useClasses()` → returns `Class[]` from `ClassRepo` |
| `useContext(AppContext)` → `assignments` | `useAssignments()` → returns `Assignment[]` from `AssignmentRepo` |
| `addAssignment(data)` | `assignmentRepo.create(data)` + sync to outbox |
| `updateStatus(id, status)` | `assignmentRepo.update(id, {status})` + sync |
| `toggleFocus(id)` | Map to `priority` field, then `assignmentRepo.update()` |

---

## 4. Current UI Pages Analysis

### Dashboard (`src/pages/Dashboard.jsx`)
- Uses `stats` from context (total, completed, focusCount, lvl)
- Shows XP progress bar
- Lists focus assignments
- **Integration:** Stats will compute from repo data

### AssignmentsPage
- Full CRUD on assignments
- Filter by status/type
- **Integration:** Replace direct state calls with repo methods

### CalendarPage
- Shows month grid (hardcoded October 2023)
- Shows assignments as colored bars on due dates
- Agenda sidebar
- **Integration:** Query assignments by date range from repo

### ClassesPage
- Lists courses
- Add/edit course UI exists
- **Integration:** Connect to `ClassRepo`

### ImportPage (`src/pages/ImportPage.jsx`)
- 3 tabs: syllabus, schedule, voice
- Currently **simulated** (fake loading, fake results)
- Step 1: Input → Step 2: Loading → Step 3: Preview
- **Integration:** Replace simulation with real parsing pipeline

---

## 5. Gaps from Target Schema

| Target Schema Field | Current State | Migration Plan |
|---------------------|---------------|----------------|
| `Class.instructor_name` | `instructor` (string) | ✅ Rename compatible |
| `Class.instructor_email` | ❌ Missing | Add field, default null |
| `Class.credits` | ❌ Missing | Add field, default null |
| `Class.term_start/end` | ❌ Missing | Add field, default null |
| `ClassSchedule` | ❌ Missing | New table for schedule grid |
| `Assignment.due_time` | ❌ Missing | Add field, default null |
| `Assignment.points_possible/scored` | `points` (number) | Split into two fields |
| `Assignment.to_do` (boolean) | ❌ Missing | Add field, default false |
| `Assignment.priority` (enum) | `isFocus` (boolean) | Map `true→'high'`, `false→'medium'` |
| `Assignment.estimated_time` | ❌ Missing | Add field |
| `Assignment.description` | ❌ Missing | Add field |
| `Assignment.revision` | ❌ Missing | Add for sync conflict detection |
| `Settings` | ❌ Missing | New table |

---

## 6. Assumptions for Implementation

1. **Color mapping:** Current uses Tailwind classes (`bg-rpg-blue`). Will store as hex codes in DB for portability.
2. **Pixel art theme:** Preserved. No UI changes.
3. **Date format:** Current uses ISO strings. Target schema same — no conversion needed.
4. **ID generation:** Currently `Math.random().toString(36)`. Will switch to `crypto.randomUUID()`.
5. **Offline-first:** If user not logged in, Dexie is sole data source. If logged in + sync enabled, Dexie + Firestore.
6. **Import preview:** UI already shows preview with checkboxes — backend just needs to return same format.

---

## 7. Folder Structure Plan

```
src/
├── components/       # Unchanged
├── pages/           # Unchanged (except ImportPage wiring)
├── context/         # AppContext.jsx → refactored to use repos
├── data/            # mockData.js → DELETE after migration
│   ├── db.ts        # NEW: Dexie schema
│   ├── models.ts    # NEW: TypeScript interfaces
│   └── repos/       # NEW: Repository implementations
│       ├── interfaces.ts
│       ├── LocalClassRepo.ts
│       ├── LocalAssignmentRepo.ts
│       ├── LocalScheduleRepo.ts
│       └── LocalSettingsRepo.ts
├── sync/            # NEW: Sync engine
│   ├── network.ts
│   ├── syncEngine.ts
│   └── outbox.ts
├── parsing/         # NEW: OCR/NLP pipeline
│   ├── syllabusParser.ts
│   ├── scheduleParser.ts
│   └── voiceParser.ts
├── hooks/           # NEW: Data hooks
│   ├── useClasses.ts
│   ├── useAssignments.ts
│   ├── useSchedule.ts
│   └── useSettings.ts
├── services/        # NEW: External services
│   └── firebase.ts  # Firebase init (no secrets)
└── types/           # NEW: Shared types
    └── index.ts
```

---

## 8. Immediate Next Steps

1. **Install dependencies:** `dexie`, `firebase`, `uuid`, `zod`, `pdfjs-dist`, `tesseract.js`
2. **TypeScript migration:** Rename `.jsx` → `.tsx`, add types
3. **Dexie setup:** Schema matching target data model
4. **Repos:** Implement Local*Repo classes
5. **Context refactor:** Swap mock data for repo calls
6. **Firebase setup:** Emulators config, security rules
7. **Sync engine:** Outbox pattern implementation
8. **Parsing:** Connect ImportPage to real parsers

---

## 9. Risks / Blockers

| Risk | Mitigation |
|------|------------|
| opencv.js bundle size | Use dynamic import, web worker; fallback to Tesseract |
| Tesseract accuracy | Set reasonable confidence thresholds, always show preview |
| Sync conflicts | Use revision + updated_at; log conflicts for UI |
| PWA offline | Service worker config for vite-pwa-plugin |

---

**End of Phase 0 — Ready to proceed with Phase 1: Firebase + Tooling Setup**
