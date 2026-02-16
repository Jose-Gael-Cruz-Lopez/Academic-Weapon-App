import { useEffect, useState, useCallback } from 'react';
import { assignmentRepo } from '../data/repos';
import type { Assignment, AssignmentStatus } from '../types';

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assignmentRepo.getAll();
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load assignments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAssignment = useCallback(async (data: Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'revision'>) => {
    const newAssignment = await assignmentRepo.create(data);
    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  }, []);

  const updateAssignment = useCallback(async (id: string, data: Partial<Assignment>) => {
    const updated = await assignmentRepo.update(id, data);
    setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const updateStatus = useCallback(async (id: string, status: AssignmentStatus) => {
    return updateAssignment(id, { status });
  }, [updateAssignment]);

  const toggleFocus = useCallback(async (id: string, currentPriority: string) => {
    // Map priority to isFocus equivalent
    const newPriority = currentPriority === 'high' ? 'medium' : 'high';
    return updateAssignment(id, { priority: newPriority });
  }, [updateAssignment]);

  const deleteAssignment = useCallback(async (id: string) => {
    await assignmentRepo.delete(id);
    setAssignments(prev => prev.filter(a => a.id !== id));
  }, []);

  const stats = useCallback(() => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'Complete' || a.status === 'Submitted').length;
    const focusCount = assignments.filter(a => a.priority === 'high' && a.status !== 'Submitted').length;
    return {
      total,
      completed,
      focusCount,
      lvl: Math.floor(completed / 5) + 1
    };
  }, [assignments]);

  return {
    assignments,
    loading,
    error,
    refresh,
    createAssignment,
    updateAssignment,
    updateStatus,
    toggleFocus,
    deleteAssignment,
    stats: stats()
  };
}
