import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Class, ClassRepo } from '../../../types';

export class LocalClassRepo implements ClassRepo {
  async getAll(): Promise<Class[]> {
    return db.classes.toArray();
  }

  async getById(id: string): Promise<Class | undefined> {
    return db.classes.get(id);
  }

  async getByCode(code: string): Promise<Class | undefined> {
    return db.classes.where('code').equals(code).first();
  }

  async create(data: Omit<Class, 'id' | 'created_at' | 'updated_at' | 'revision'>): Promise<Class> {
    const now = new Date().toISOString();
    const newClass: Class = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
      revision: 1
    };
    await db.classes.add(newClass);
    return newClass;
  }

  async update(id: string, data: Partial<Class>): Promise<Class> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Class ${id} not found`);
    }

    const updated: Class = {
      ...existing,
      ...data,
      id,  // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
      revision: existing.revision + 1
    };

    await db.classes.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Also delete related schedules
    await db.schedules.where('class_id').equals(id).delete();
    await db.classes.delete(id);
  }
}

export const classRepo = new LocalClassRepo();
