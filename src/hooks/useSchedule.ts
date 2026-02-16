import { useEffect, useState, useCallback } from 'react';
import { scheduleRepo } from '../data/repos';
import type { ClassSchedule } from '../types';

export function useSchedule() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleRepo.getAll();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load schedules'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getByClassId = useCallback(async (classId: string) => {
    return scheduleRepo.getByClassId(classId);
  }, []);

  const getByDay = useCallback(async (day: number) => {
    return scheduleRepo.getByDay(day);
  }, []);

  const createSchedule = useCallback(async (data: Omit<ClassSchedule, 'id' | 'created_at' | 'updated_at' | 'revision'>) => {
    const newSchedule = await scheduleRepo.create(data);
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  }, []);

  const updateSchedule = useCallback(async (id: string, data: Partial<ClassSchedule>) => {
    const updated = await scheduleRepo.update(id, data);
    setSchedules(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    await scheduleRepo.delete(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    schedules,
    loading,
    error,
    refresh,
    getByClassId,
    getByDay,
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
}
