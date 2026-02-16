# Architecture Overview

## Offline-First Design

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────────┐
│   React UI      │────▶│  Repositories │────▶│  Dexie (Local)  │
│   (Pages)       │     │  (Hooks)      │     │  IndexedDB      │
└─────────────────┘     └───────────────┘     └────────┬────────┘
        ▲                                              │
        │                                              │
        │         ┌───────────────┐                    │
        └─────────│ Sync Engine   │◀───────────────────┘
                  │ (Outbox)      │
                  └───────┬───────┘
                          │
                          ▼ (when online + logged in)
                  ┌───────────────┐
                  │  Firestore    │
                  │  (Cloud)      │
                  └───────────────┘
```

## Data Flow

1. **Local Write** → Immediate to Dexie → Queue to Outbox
2. **Sync Trigger** → Flush Outbox to Firestore
3. **Remote Pull** → Firestore → Dexie (if newer)

## Key Principles

- **Dexie is source of truth** — UI always reads from local DB
- **Optimistic writes** — Local change happens immediately
- **Outbox pattern** — All changes queued for sync
- **Conflict resolution** — Last-write-wins by `updated_at` + `revision`
- **Optional cloud** — Works 100% offline, sync is opt-in
