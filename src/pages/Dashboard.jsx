import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { STATUS } from '../data/mockData';
import PixelCard from '../components/PixelCard';
import PixelBadge from '../components/PixelBadge';
import SectionHeader from '../components/SectionHeader';

const Dashboard = () => {
    const { stats, assignments, courses } = useContext(AppContext);
    
    const bossFights = assignments.filter(a => a.type === 'Exam' && a.status !== 'Submitted');
    const todaysQuests = assignments.filter(a => a.status !== 'Submitted').slice(0, 3);

    return (
        <div className="space-y-8 animate-fade-in">
            <SectionHeader title="Dashboard" subtitle="Welcome back, Hunter." />
            
            {/* Trainer Card */}
            <PixelCard className="bg-[#e0e7ff]">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-24 h-24 bg-white border-2 border-ink flex items-center justify-center shrink-0">
                        <iconify-icon icon="solar:user-circle-bold" width="60" className="text-rpg-blue"></iconify-icon>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="font-pixel text-2xl uppercase">Student Lvl.{stats.lvl}</h2>
                                <p className="font-sans text-sm text-gray-600">Fall Semester 2023</p>
                            </div>
                            <PixelBadge label="Active" color="bg-rpg-green text-white" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                <span>XP Progress</span>
                                <span>{stats.completed}/{stats.total} Tasks</span>
                            </div>
                            <div className="h-4 border-2 border-ink bg-white relative">
                                <div 
                                    className="h-full bg-rpg-blue absolute left-0 top-0" 
                                    style={{width: `${(stats.completed / stats.total) * 100}%`}}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </PixelCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quest Log */}
                <div>
                    <h3 className="font-pixel text-xl mb-3 flex items-center gap-2">
                        <iconify-icon icon="solar:checklist-linear"></iconify-icon> Current Quests
                    </h3>
                    <div className="space-y-4">
                        {todaysQuests.length > 0 ? todaysQuests.map(a => {
                            const course = courses.find(c => c.id === a.courseId);
                            return (
                                <PixelCard key={a.id} className="flex justify-between items-center group hover:-translate-y-1 transition-transform cursor-pointer">
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-3 h-3 border border-ink ${course.color}`}></div>
                                        <div>
                                            <div className="font-bold text-sm line-clamp-1">{a.title}</div>
                                            <div className="text-xs text-gray-500 font-pixel uppercase">{a.type} • Due {a.dueDate}</div>
                                        </div>
                                    </div>
                                    <iconify-icon icon="solar:alt-arrow-right-linear" className="opacity-0 group-hover:opacity-100"></iconify-icon>
                                </PixelCard>
                            )
                        }) : (
                            <div className="border-2 border-dashed border-ink p-6 text-center text-gray-500 font-pixel">No active quests</div>
                        )}
                    </div>
                </div>

                {/* Boss Fights */}
                <div>
                    <h3 className="font-pixel text-xl mb-3 flex items-center gap-2 text-rpg-red">
                        <iconify-icon icon="solar:danger-triangle-linear"></iconify-icon> Boss Fights (Exams)
                    </h3>
                    <div className="space-y-4">
                        {bossFights.length > 0 ? bossFights.map(a => {
                            const course = courses.find(c => c.id === a.courseId);
                            return (
                                <PixelCard key={a.id} className="bg-red-50 border-rpg-red">
                                    <div className="flex justify-between items-start">
                                        <div className="font-pixel text-lg text-rpg-red uppercase mb-1">Warning: {a.type}</div>
                                        <div className={`text-xs px-1 border border-ink ${course.color}`}>{course.code}</div>
                                    </div>
                                    <div className="font-bold">{a.title}</div>
                                    <div className="text-sm mt-2 font-mono">{a.dueDate}</div>
                                </PixelCard>
                            )
                        }) : (
                            <div className="border-2 border-dashed border-ink p-6 text-center text-gray-500 font-pixel">No bosses approaching</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
