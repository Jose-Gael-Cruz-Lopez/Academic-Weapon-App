import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  type Firestore
} from 'firebase/firestore';
import { db as firestoreDB } from '../services/firebase';
import { db as localDB } from '../data/db';
import { outbox } from './outbox';
import { network } from './network';
import { settingsRepo } from '../data/repos';
import type { Class, ClassSchedule, Assignment, Settings, OutboxItem } from '../types';

// Sync Engine: Offline-first Dexie → Firestore sync
// Design:
// - Local (Dexie) is always source of truth
// - Changes are queued to outbox immediately
// - When online + logged in + sync enabled: flush outbox, pull remote

let syncInterval: number | null = null;
let isSyncing = false;

const SYNC_INTERVAL_MS = 30000; // 30 seconds

// Map entity types to Firestore collections
const collectionMap = {
  class: 'classes',
  schedule: 'schedules',
  assignment: 'assignments',
  settings: 'settings'
};

// Convert Date objects to ISO strings for local storage
function toLocalFormat<T extends { updated_at: string | Timestamp; created_at?: string | Timestamp }>(
  data: T
): T {
  const result = { ...data };
  if (data.updated_at instanceof Timestamp) {
    result.updated_at = data.updated_at.toDate().toISOString();
  }
  if (data.created_at instanceof Timestamp) {
    result.created_at = data.created_at.toDate().toISOString();
  }
  return result;
}

// Get user's Firestore base path (requires auth)
function getUserPath(): string | null {
  // This would come from Firebase Auth
  // For now, return null if not authenticated
  const auth = (window as any).firebaseAuth;
  if (!auth?.currentUser?.uid) return null;
  return `users/${auth.currentUser.uid}`;
}

// Sync outbox items to Firestore
async function flushOutbox(userPath: string): Promise<void> {
  const pending = await outbox.getPending();

  for (const item of pending) {
    try {
      const collectionName = collectionMap[item.entity_type];
      const docRef = doc(firestoreDB, `${userPath}/${collectionName}/${item.entity_id}`);

      switch (item.operation) {
        case 'create':
        case 'update':
          await setDoc(docRef, {
            ...item.payload,
            updated_at: Timestamp.now()
          }, { merge: true });
          break;

        case 'delete':
          await deleteDoc(docRef);
          break;
      }

      // Remove from outbox on success
      await outbox.remove(item.id);
    } catch (err) {
      console.error(`[Sync] Failed to sync outbox item ${item.id}:`, err);
      await outbox.retry(item.id);
    }
  }
}

// Pull remote changes from Firestore
async function pullRemote(userPath: string): Promise<void> {
  const settings = await settingsRepo.get();
  const lastSync = settings.last_sync_at;

  // Fetch all collections modified since last sync
  const collections = ['classes', 'schedules', 'assignments'] as const;

  for (const collName of collections) {
    const collRef = collection(firestoreDB, `${userPath}/${collName}`);
    const localTable = localDB[collName === 'classes' ? 'classes' : collName === 'schedules' ? 'schedules' : 'assignments'];

    let q = query(collRef);
    if (lastSync) {
      q = query(collRef, where('updated_at', '>', Timestamp.fromDate(new Date(lastSync))));
    }

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const remoteData = toLocalFormat(docSnap.data() as any);
      const localId = docSnap.id;

      // Check for conflicts
      const localItem = await localTable.get(localId);

      if (!localItem) {
        // New item from remote - add locally
        await localTable.add({ ...remoteData, id: localId });
      } else if (localItem.revision < remoteData.revision) {
        // Remote is newer - update local
        await localTable.put({ ...remoteData, id: localId });
      } else if (localItem.revision > remoteData.revision) {
        // Local is newer - this shouldn't happen if outbox works
        // But queue local version to remote
        console.warn('[Sync] Local revision higher than remote:', localId);
      }
      // Same revision = no conflict
    }
  }

  // Update last sync time
  await settingsRepo.update({
    last_sync_at: new Date().toISOString()
  });
}

// Main sync function
async function performSync(): Promise<void> {
  if (isSyncing) return;
  if (!network.isOnline()) return;

  const userPath = getUserPath();
  if (!userPath) return; // Not logged in

  const settings = await settingsRepo.get();
  if (!settings.sync_enabled) return;

  isSyncing = true;
  console.log('[Sync] Starting sync...');

  try {
    // 1. Push local changes to remote
    await flushOutbox(userPath);

    // 2. Pull remote changes
    await pullRemote(userPath);

    console.log('[Sync] Complete');
  } catch (err) {
    console.error('[Sync] Failed:', err);
  } finally {
    isSyncing = false;
  }
}

// Sync engine public API
export const syncEngine = {
  // Start periodic sync
  start(): void {
    if (syncInterval) return;

    // Immediate first sync attempt
    performSync();

    // Periodic sync
    syncInterval = window.setInterval(performSync, SYNC_INTERVAL_MS);

    // Sync when coming back online
    network.onStatusChange((online) => {
      if (online) performSync();
    });

    console.log('[Sync Engine] Started');
  },

  // Stop sync
  stop(): void {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    console.log('[Sync Engine] Stopped');
  },

  // Manual sync trigger
  async syncNow(): Promise<void> {
    await performSync();
  },

  // Get sync status
  isSyncing(): boolean {
    return isSyncing;
  },

  // Get pending outbox count
  async getPendingCount(): Promise<number> {
    return outbox.count();
  }
};

export default syncEngine;
