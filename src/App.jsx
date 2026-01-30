import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import AssignmentsPage from './pages/AssignmentsPage';
import ClassesPage from './pages/ClassesPage';
import ImportPage from './pages/ImportPage';
import PixelBadge from './components/PixelBadge';

const Layout = () => {
    return (
        <div className="min-h-screen bg-paper flex text-ink font-sans selection:bg-rpg-yellow">
            <NavBar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/assignments" element={<AssignmentsPage />} />
                    <Route path="/classes" element={<ClassesPage />} />
                    <Route path="/import" element={<ImportPage />} />
                    <Route path="*" element={<Dashboard />} />
                </Routes>
            </main>
            
            {/* Placeholder for Offline Toast */}
            <div className="fixed top-4 right-4 z-50 animate-bounce hidden">
                <PixelBadge label="OFFLINE MODE" color="bg-gray-800 text-white" />
            </div>
        </div>
    );
};

const App = () => {
    return (
        <HashRouter>
            <AppProvider>
                <Layout />
            </AppProvider>
        </HashRouter>
    );
};

export default App;
