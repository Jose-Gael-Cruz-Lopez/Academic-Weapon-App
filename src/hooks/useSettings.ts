import { useEffect, useState, useCallback } from 'react';
import { settingsRepo } from '../data/repos';
import type { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsRepo.get();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSettings = useCallback(async (data: Partial<Settings>) => {
    const updated = await settingsRepo.update(data);
    setSettings(updated);
    return updated;
  }, []);

  return {
    settings,
    loading,
    error,
    refresh,
    updateSettings
  };
}
