import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import SectionHeader from '../components/SectionHeader';

const CalendarPage = () => {
    const { assignments, courses } = useContext(AppContext);
    
    // Simplified Calendar Logic (Static Month for Demo)
    const days = Array.from({length: 31}, (_, i) => i + 1);
    const startDayOffset = 3; // Starts on Wed

    const getDayEvents = (day) => {
        const dateStr = `2023-10-${day.toString().padStart(2, '0')}`;
        return assignments.filter(a => a.dueDate === dateStr);
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Calendar" subtitle="October 2023" />
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Month Grid */}
                <div className="flex-1 bg-white border-2 border-ink shadow-pixel p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                            <div key={d} className="text-center font-pixel uppercase text-gray-500">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 auto-rows-fr">
                        {Array.from({length: startDayOffset}).map((_, i) => <div key={`empty-${i}`} className="bg-gray-50 aspect-square"></div>)}
                        {days.map(day => {
                            const events = getDayEvents(day);
                            return (
                                <div key={day} className="border border-gray-200 aspect-square p-1 relative hover:bg-yellow-50 cursor-pointer">
                                    <span className="font-pixel text-sm">{day}</span>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {events.map(ev => {
                                            const c = courses.find(x => x.id === ev.courseId);
                                            return (
                                                <div key={ev.id} className={`h-1.5 w-full ${c?.color || 'bg-black'}`}></div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Agenda */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="font-pixel text-xl uppercase border-b-2 border-ink pb-1">Agenda</div>
                    {assignments.sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5).map(a => {
                        const c = courses.find(x => x.id === a.courseId);
                        return (
                            <div key={a.id} className="flex gap-3 items-start border-b border-gray-200 pb-2">
                                <div className="flex flex-col items-center min-w-[3rem] bg-gray-100 border border-ink p-1">
                                    <span className="text-xs font-bold uppercase">{new Date(a.dueDate).toLocaleString('en-US', {month:'short'})}</span>
                                    <span className="font-pixel text-xl leading-none">{new Date(a.dueDate).getDate()}</span>
                                </div>
                                <div>
                                    <div className={`text-[10px] uppercase font-bold tracking-wide ${c?.color === 'bg-rpg-red' ? 'text-rpg-red' : 'text-gray-500'}`}>{c?.code} • {a.type}</div>
                                    <div className="font-medium text-sm leading-tight">{a.title}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
