import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Assignment, AssignmentRepo, AssignmentStatus } from '../../../types';

export class LocalAssignmentRepo implements AssignmentRepo {
  async getAll(): Promise<Assignment[]> {
    return db.assignments.toArray();
  }

  async getById(id: string): Promise<Assignment | undefined> {
    return db.assignments.get(id);
  }

  async getByClassId(classId: string): Promise<Assignment[]> {
    return db.assignments.where('class_id').equals(classId).toArray();
  }

  async getByDueDate(date: string): Promise<Assignment[]> {
    return db.assignments.where('due_date').equals(date).toArray();
  }

  async getByDateRange(start: string, end: string): Promise<Assignment[]> {
    return db.assignments
      .where('due_date')
      .between(start, end, true, true)
      .toArray();
  }

  async getByStatus(status: AssignmentStatus): Promise<Assignment[]> {
    return db.assignments.where('status').equals(status).toArray();
  }

  async getUpcoming(limit: number = 10): Promise<Assignment[]> {
    const today = new Date().toISOString().split('T')[0];
    return db.assignments
      .where('due_date')
      .aboveOrEqual(today)
      .sortBy('due_date')
      .then(results => results.slice(0, limit));
  }

  async create(data: Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'revision'>): Promise<Assignment> {
    const now = new Date().toISOString();
    const newAssignment: Assignment = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
      revision: 1
    };
    await db.assignments.add(newAssignment);
    return newAssignment;
  }

  async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Assignment ${id} not found`);
    }

    const updated: Assignment = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
      revision: existing.revision + 1
    };

    await db.assignments.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.assignments.delete(id);
  }
}

export const assignmentRepo = new LocalAssignmentRepo();
