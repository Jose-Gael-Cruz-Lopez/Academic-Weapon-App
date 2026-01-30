import { createContext, useState, useMemo } from 'react';
import { COURSES, INITIAL_ASSIGNMENTS, STATUS } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [courses, setCourses] = useState(COURSES);
    const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
    
    // Stats for Dashboard
    const stats = useMemo(() => {
        const total = assignments.length;
        const completed = assignments.filter(a => a.status === STATUS.COMPLETE || a.status === STATUS.SUBMITTED).length;
        const focusCount = assignments.filter(a => a.isFocus && a.status !== STATUS.SUBMITTED).length;
        return { total, completed, focusCount, lvl: Math.floor(completed / 5) + 1 };
    }, [assignments]);

    const toggleFocus = (id) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, isFocus: !a.isFocus } : a));
    };

    const updateStatus = (id, status) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const addAssignment = (data) => {
        const newAssign = {
            id: Math.random().toString(36).substr(2, 9),
            status: STATUS.TODO,
            isFocus: false,
            points: 100,
            ...data
        };
        setAssignments([...assignments, newAssign]);
    };

    return (
        <AppContext.Provider value={{ courses, assignments, stats, toggleFocus, updateStatus, addAssignment }}>
            {children}
        </AppContext.Provider>
    );
};
