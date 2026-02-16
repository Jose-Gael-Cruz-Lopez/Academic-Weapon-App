import { useEffect, useState, useCallback } from 'react';
import { classRepo } from '../data/repos';
import type { Class } from '../types';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await classRepo.getAll();
      setClasses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load classes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createClass = useCallback(async (data: Omit<Class, 'id' | 'created_at' | 'updated_at' | 'revision'>) => {
    const newClass = await classRepo.create(data);
    setClasses(prev => [...prev, newClass]);
    return newClass;
  }, []);

  const updateClass = useCallback(async (id: string, data: Partial<Class>) => {
    const updated = await classRepo.update(id, data);
    setClasses(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    await classRepo.delete(id);
    setClasses(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    classes,
    loading,
    error,
    refresh,
    createClass,
    updateClass,
    deleteClass
  };
}
