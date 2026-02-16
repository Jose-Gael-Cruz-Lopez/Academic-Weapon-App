# Sync Documentation

## Conflict Resolution

When local and remote versions diverge:

1. Compare `revision` numbers
2. Higher `revision` wins
3. If `updated_at` differs but `revision` same:
   - Keep both versions
   - Log conflict for UI review

## Outbox Table

| Field | Description |
|-------|-------------|
| `id` | Unique outbox item ID |
| `entity_type` | class / schedule / assignment / settings |
| `entity_id` | Entity's UUID |
| `operation` | create / update / delete |
| `payload` | Full entity JSON |
| `timestamp` | When queued |
| `retry_count` | Failed sync attempts |

## Sync Triggers

- Every 30 seconds when online
- When app comes back online
- Manual `syncEngine.syncNow()`

## Enabling Sync

```typescript
const { settings, updateSettings } = useSettings();

// Enable sync (requires login)
await updateSettings({ sync_enabled: true });
syncEngine.start();
```
