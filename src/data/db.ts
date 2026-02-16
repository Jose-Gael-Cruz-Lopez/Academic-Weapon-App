import Dexie, { type Table } from 'dexie';
import type { Class, ClassSchedule, Assignment, Settings, OutboxItem } from '../types';

export class AcademicDB extends Dexie {
  classes!: Table<Class>;
  schedules!: Table<ClassSchedule>;
  assignments!: Table<Assignment>;
  settings!: Table<Settings>;
  outbox!: Table<OutboxItem>;

  constructor() {
    super('AcademicWeaponDB');
    
    this.version(1).stores({
      // Primary keys + indexes for queries
      classes: 'id, code, term_start, [revision+updated_at]',
      schedules: 'id, class_id, day_of_week, [revision+updated_at]',
      assignments: 'id, class_id, due_date, status, priority, [revision+updated_at]',
      settings: 'id, [revision+updated_at]',
      outbox: 'id, entity_type, entity_id, timestamp'
    });
  }
}

export const db = new AcademicDB();
