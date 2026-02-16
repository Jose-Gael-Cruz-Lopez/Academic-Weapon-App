// Data Models — Academic Weapon App
// Matches Firestore schema and Dexie local schema

// Enums
export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Submitted';
export type AssignmentType = 'Homework' | 'Lab' | 'Quiz' | 'Exam' | 'Project' | 'Reading';
export type Priority = 'low' | 'medium' | 'high';

// ==================== Core Entities ====================

export interface Class {
  id: string;
  code: string;           // e.g., "CS 101"
  name: string;
  instructor_name: string;
  instructor_email?: string;
  color: string;          // Hex code: "#3B82F6"
  credits?: number;
  term_start?: string;    // ISO date
  term_end?: string;      // ISO date
  term_id?: string;       // Reference to a term/semester
  // Sync metadata
  created_at: string;
  updated_at: string;
  revision: number;
}

export interface ClassSchedule {
  id: string;
  class_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=Sunday, 1=Monday, etc.
  start_time: string;     // "HH:mm" format, 24hr
  end_time: string;       // "HH:mm" format, 24hr
  location?: string;
  // Sync metadata
  created_at: string;
  updated_at: string;
  revision: number;
}

export interface Assignment {
  id: string;
  class_id: string | null;  // Nullable for unassigned/personal tasks
  title: string;
  type: AssignmentType;
  due_date: string;         // ISO date "YYYY-MM-DD"
  due_time?: string;        // Optional "HH:mm"
  status: AssignmentStatus;
  points_possible?: number;
  points_scored?: number;
  to_do: boolean;           // Quick-add flag
  priority: Priority;
  estimated_time?: number;  // Minutes
  description?: string;
  // Sync metadata
  created_at: string;
  updated_at: string;
  revision: number;
}

export interface Settings {
  id: 'default';            // Single settings record per user
  default_reminder_time: number;  // Minutes before due date
  calendar_start_day: 0 | 1;      // 0=Sunday, 1=Monday
  theme: 'light' | 'dark' | 'pixel';
  sync_enabled: boolean;
  last_sync_at?: string;    // ISO timestamp
  // Sync metadata
  updated_at: string;
  revision: number;
}

// ==================== Sync & Outbox ====================

export type OutboxOperation = 'create' | 'update' | 'delete';

export interface OutboxItem {
  id: string;               // UUID
  entity_type: 'class' | 'schedule' | 'assignment' | 'settings';
  entity_id: string;
  operation: OutboxOperation;
  payload: unknown;         // The entity data
  timestamp: string;        // ISO timestamp
  retry_count: number;
}

// ==================== Parsing Results ====================

export interface ParsedAssignment {
  title: string;
  type: AssignmentType;
  due_date: string;
  due_time?: string;
  class_code?: string;      // To match with existing class
  points_possible?: number;
  description?: string;
  confidence: number;       // 0-1 score
}

export interface ParsedScheduleItem {
  class_code?: string;
  title: string;
  day_of_week: number;      // 0-6
  start_time: string;       // "HH:mm"
  end_time: string;         // "HH:mm"
  location?: string;
  confidence: number;
}

// ==================== Repository Interfaces ====================

export interface BaseRepo<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'revision'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface ClassRepo extends BaseRepo<Class> {
  getByCode(code: string): Promise<Class | undefined>;
}

export interface ScheduleRepo extends BaseRepo<ClassSchedule> {
  getByClassId(classId: string): Promise<ClassSchedule[]>;
  getByDay(day: number): Promise<ClassSchedule[]>;
}

export interface AssignmentRepo extends BaseRepo<Assignment> {
  getByClassId(classId: string): Promise<Assignment[]>;
  getByDueDate(date: string): Promise<Assignment[]>;
  getByDateRange(start: string, end: string): Promise<Assignment[]>;
  getByStatus(status: AssignmentStatus): Promise<Assignment[]>;
  getUpcoming(limit?: number): Promise<Assignment[]>;
}

export interface SettingsRepo {
  get(): Promise<Settings>;
  update(data: Partial<Settings>): Promise<Settings>;
}
