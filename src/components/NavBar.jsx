import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
    const loc = useLocation();
    const navItems = [
        { path: '/', label: 'Base', icon: 'solar:home-linear' },
        { path: '/calendar', label: 'Cal', icon: 'solar:calendar-linear' },
        { path: '/assignments', label: 'Tasks', icon: 'solar:checklist-linear' },
        { path: '/classes', label: 'Class', icon: 'solar:notebook-linear' },
        { path: '/import', label: 'Add', icon: 'solar:upload-linear' },
    ];

    return (
        <>
            {/* Desktop Side Nav */}
            <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r-4 border-ink bg-paper p-6 z-50">
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-ink flex items-center justify-center text-white">
                        <iconify-icon icon="solar:gamepad-linear" width="24"></iconify-icon>
                    </div>
                    <span className="font-pixel text-3xl tracking-tight">QUESTLOG</span>
                </div>
                <div className="flex flex-col gap-4">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 border-2 transition-all ${loc.pathname === item.path ? 'bg-ink text-white border-ink shadow-none' : 'bg-white border-transparent hover:border-ink hover:shadow-pixel'}`}
                        >
                            <iconify-icon icon={item.icon} width="24"></iconify-icon>
                            <span className="font-pixel text-xl uppercase">{item.label}</span>
                        </Link>
                    ))}
                    <div className="mt-auto border-t-2 border-gray-300 pt-4">
                        <Link to="/grades" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-ink font-pixel text-lg">
                            <iconify-icon icon="solar:chart-linear"></iconify-icon> Grades
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-ink font-pixel text-lg">
                            <iconify-icon icon="solar:settings-linear"></iconify-icon> Settings
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-ink z-50 pb-safe">
                <div className="flex justify-around p-2">
                    {navItems.map(item => (
                        <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 rounded-sm ${loc.pathname === item.path ? 'bg-ink text-white' : 'text-ink'}`}>
                            <iconify-icon icon={item.icon} width="24"></iconify-icon>
                            <span className="font-pixel text-xs mt-1">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default NavBar;
