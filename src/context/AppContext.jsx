import { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useClasses, useAssignments, useSettings } from '../hooks';
import syncEngine from '../sync/syncEngine';

export const AppContext = createContext(null);

// Migration helper: Import mock data once on first load
async function migrateMockData() {
  const { classRepo, assignmentRepo, settingsRepo } = await import('../data/repos');
  const { COURSES, INITIAL_ASSIGNMENTS } = await import('../data/mockData');
  
  const existingClasses = await classRepo.getAll();
  if (existingClasses.length === 0) {
    console.log('[Migration] Importing mock classes...');
    for (const c of COURSES) {
      await classRepo.create({
        code: c.code,
        name: c.name,
        instructor_name: c.instructor,
        color: c.color.replace('bg-', '#'), // Convert tailwind to hex (approximate)
        credits: 3
      });
    }
  }
  
  const existingAssignments = await assignmentRepo.getAll();
  if (existingAssignments.length === 0) {
    console.log('[Migration] Importing mock assignments...');
    const classMap = await classRepo.getAll().then(classes => 
      Object.fromEntries(classes.map(c => [c.code, c.id]))
    );
    
    for (const a of INITIAL_ASSIGNMENTS) {
      const classId = classMap[a.courseId] || null;
      await assignmentRepo.create({
        class_id: classId,
        title: a.title,
        type: a.type,
        due_date: a.dueDate,
        status: a.status,
        points_possible: a.points,
        priority: a.isFocus ? 'high' : 'medium',
        to_do: a.status === 'Not Started'
      });
    }
  }
}

export const AppProvider = ({ children }) => {
  const [migrated, setMigrated] = useState(false);
  
  const { 
    classes, 
    loading: classesLoading, 
    createClass, 
    updateClass, 
    deleteClass 
  } = useClasses();
  
  const { 
    assignments, 
    loading: assignmentsLoading, 
    stats, 
    createAssignment, 
    updateStatus, 
    toggleFocus,
    deleteAssignment
  } = useAssignments();
  
  const { settings, updateSettings } = useSettings();

  // One-time migration from mock data
  useEffect(() => {
    migrateMockData().then(() => setMigrated(true));
  }, []);

  // Start sync engine when settings loaded
  useEffect(() => {
    if (settings?.sync_enabled) {
      syncEngine.start();
    }
    return () => syncEngine.stop();
  }, [settings?.sync_enabled]);

  // Adapt old API to new data model
  const adaptedCourses = useMemo(() => {
    return classes.map(c => ({
      ...c,
      instructor: c.instructor_name,  // backward compat
      color: c.color.startsWith('#') ? `bg-rpg-${getColorName(c.color)}` : c.color
    }));
  }, [classes]);

  const adaptedAssignments = useMemo(() => {
    return assignments.map(a => ({
      ...a,
      courseId: a.class_id || '',  // backward compat
      dueDate: a.due_date,  // backward compat
      points: a.points_possible,  // backward compat
      isFocus: a.priority === 'high'  // backward compat
    }));
  }, [assignments]);

  // Adapt addAssignment to new repo
  const addAssignment = useCallback(async (data) => {
    // Map old field names to new
    const mapped = {
      class_id: data.courseId || null,
      title: data.title,
      type: data.type || 'Homework',
      due_date: data.dueDate,
      status: 'Not Started',
      points_possible: data.points || 100,
      priority: 'medium',
      to_do: true
    };
    await createAssignment(mapped);
  }, [createAssignment]);

  const loading = classesLoading || assignmentsLoading || !migrated;

  const value = {
    courses: adaptedCourses,
    assignments: adaptedAssignments,
    stats,
    loading,
    syncEnabled: settings?.sync_enabled || false,
    toggleFocus: (id) => toggleFocus(id, adaptedAssignments.find(a => a.id === id)?.priority),
    updateStatus,
    addAssignment,
    // New methods for expanded functionality
    createClass,
    updateClass,
    deleteClass,
    deleteAssignment,
    enableSync: () => updateSettings({ sync_enabled: true }),
    disableSync: () => updateSettings({ sync_enabled: false })
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Helper: Map hex to approximate tailwind color name
function getColorName(hex) {
  const map = {
    '#3B82F6': 'blue',
    '#EF4444': 'red',
    '#EAB308': 'yellow',
    '#A855F7': 'purple',
    '#22C55E': 'green',
    '#F97316': 'orange'
  };
  return map[hex] || 'blue';
}
