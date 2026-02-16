import { db } from '../db';
import type { Settings, SettingsRepo } from '../../../types';

const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  default_reminder_time: 1440,  // 24 hours before
  calendar_start_day: 0,        // Sunday
  theme: 'pixel',
  sync_enabled: false,
  updated_at: new Date().toISOString(),
  revision: 1
};

export class LocalSettingsRepo implements SettingsRepo {
  async get(): Promise<Settings> {
    const existing = await db.settings.get('default');
    if (existing) {
      return existing;
    }
    
    // Initialize with defaults
    await db.settings.add(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  async update(data: Partial<Settings>): Promise<Settings> {
    const existing = await this.get();
    
    const updated: Settings = {
      ...existing,
      ...data,
      id: 'default',
      updated_at: new Date().toISOString(),
      revision: existing.revision + 1
    };

    await db.settings.put(updated);
    return updated;
  }
}

export const settingsRepo = new LocalSettingsRepo();
