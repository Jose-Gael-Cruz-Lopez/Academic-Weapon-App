import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db';
import type { OutboxItem, OutboxOperation } from '../types';

// Outbox management: queue local changes for sync

export const outbox = {
  async queue<T>(
    entityType: OutboxItem['entity_type'],
    entityId: string,
    operation: OutboxOperation,
    payload: T
  ): Promise<OutboxItem> {
    const item: OutboxItem = {
      id: uuidv4(),
      entity_type: entityType,
      entity_id: entityId,
      operation,
      payload,
      timestamp: new Date().toISOString(),
      retry_count: 0
    };

    await db.outbox.add(item);
    return item;
  },

  async getPending(): Promise<OutboxItem[]> {
    return db.outbox.orderBy('timestamp').toArray();
  },

  async remove(id: string): Promise<void> {
    await db.outbox.delete(id);
  },

  async retry(id: string): Promise<void> {
    const item = await db.outbox.get(id);
    if (item) {
      await db.outbox.update(id, {
        retry_count: item.retry_count + 1
      });
    }
  },

  async clear(): Promise<void> {
    await db.outbox.clear();
  },

  async count(): Promise<number> {
    return db.outbox.count();
  }
};

export default outbox;
