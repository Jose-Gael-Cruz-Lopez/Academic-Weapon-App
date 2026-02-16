import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { ClassSchedule, ScheduleRepo } from '../../../types';

export class LocalScheduleRepo implements ScheduleRepo {
  async getAll(): Promise<ClassSchedule[]> {
    return db.schedules.toArray();
  }

  async getById(id: string): Promise<ClassSchedule | undefined> {
    return db.schedules.get(id);
  }

  async getByClassId(classId: string): Promise<ClassSchedule[]> {
    return db.schedules.where('class_id').equals(classId).toArray();
  }

  async getByDay(day: number): Promise<ClassSchedule[]> {
    return db.schedules.where('day_of_week').equals(day).toArray();
  }

  async create(data: Omit<ClassSchedule, 'id' | 'created_at' | 'updated_at' | 'revision'>): Promise<ClassSchedule> {
    const now = new Date().toISOString();
    const newSchedule: ClassSchedule = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
      revision: 1
    };
    await db.schedules.add(newSchedule);
    return newSchedule;
  }

  async update(id: string, data: Partial<ClassSchedule>): Promise<ClassSchedule> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Schedule ${id} not found`);
    }

    const updated: ClassSchedule = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
      revision: existing.revision + 1
    };

    await db.schedules.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.schedules.delete(id);
  }
}

export const scheduleRepo = new LocalScheduleRepo();
