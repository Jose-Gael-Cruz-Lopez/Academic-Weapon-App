export const COURSES = [
    { id: 'c1', code: 'CS 101', name: 'Intro to Algorithms', color: 'bg-rpg-blue', instructor: 'Dr. Bit' },
    { id: 'c2', code: 'MATH 202', name: 'Linear Algebra', color: 'bg-rpg-red', instructor: 'Prof. Vector' },
    { id: 'c3', code: 'HIST 300', name: 'Ancient Civs', color: 'bg-rpg-yellow', instructor: 'Dr. Jones' },
    { id: 'c4', code: 'PHYS 101', name: 'Mechanics', color: 'bg-rpg-purple', instructor: 'Prof. Newton' },
];

export const ASSIGNMENT_TYPES = {
    HOMEWORK: 'Homework',
    LAB: 'Lab',
    QUIZ: 'Quiz',
    EXAM: 'Exam',
    PROJECT: 'Project',
    READING: 'Reading'
};

export const STATUS = {
    TODO: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETE: 'Complete',
    SUBMITTED: 'Submitted'
};

export const INITIAL_ASSIGNMENTS = [
    { id: 'a1', courseId: 'c1', title: 'Binary Trees Implementation', type: 'Lab', dueDate: '2023-10-25', status: 'In Progress', points: 100, isFocus: true },
    { id: 'a2', courseId: 'c2', title: 'Matrix Multiplication Quiz', type: 'Quiz', dueDate: '2023-10-26', status: 'Not Started', points: 50, isFocus: false },
    { id: 'a3', courseId: 'c1', title: 'Midterm Exam', type: 'Exam', dueDate: '2023-10-30', status: 'Not Started', points: 200, isFocus: true },
    { id: 'a4', courseId: 'c3', title: 'Rome Reading Ch. 4', type: 'Reading', dueDate: '2023-10-24', status: 'Complete', points: 0, isFocus: false },
    { id: 'a5', courseId: 'c4', title: 'Kinematics Problem Set', type: 'Homework', dueDate: '2023-10-28', status: 'Submitted', points: 20, isFocus: false },
    { id: 'a6', courseId: 'c2', title: 'Vector Spaces Project', type: 'Project', dueDate: '2023-11-05', status: 'Not Started', points: 150, isFocus: true },
    { id: 'a7', courseId: 'c3', title: 'Essay: Fall of Rome', type: 'Project', dueDate: '2023-11-15', status: 'Not Started', points: 100, isFocus: false },
];
