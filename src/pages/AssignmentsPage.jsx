import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { STATUS } from '../data/mockData';
import SectionHeader from '../components/SectionHeader';

const AssignmentsPage = () => {
    const { assignments, courses, toggleFocus, updateStatus } = useContext(AppContext);
    const [filter, setFilter] = useState('ALL');

    const filtered = filter === 'ALL' ? assignments : assignments.filter(a => a.status === filter);

    const getStatusColor = (s) => {
        switch(s) {
            case STATUS.COMPLETE: return 'bg-rpg-green text-white';
            case STATUS.SUBMITTED: return 'bg-gray-400 text-white decoration-line-through';
            case STATUS.IN_PROGRESS: return 'bg-rpg-yellow text-ink';
            default: return 'bg-white text-gray-500 border-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Master List" subtitle="Manage your loadout" />
            
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', STATUS.TODO, STATUS.IN_PROGRESS, STATUS.COMPLETE].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 font-pixel uppercase text-sm border-2 ${filter === f ? 'bg-ink text-white border-ink' : 'bg-white border-gray-300 text-gray-500'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="bg-white border-2 border-ink shadow-pixel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500 border-b-2 border-ink">
                            <tr>
                                <th className="p-3 w-10">!</th>
                                <th className="p-3">Task</th>
                                <th className="p-3">Class</th>
                                <th className="p-3">Due</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filtered.map(a => {
                                const c = courses.find(x => x.id === a.courseId);
                                return (
                                    <tr key={a.id} className={`group ${a.status === STATUS.SUBMITTED ? 'opacity-50 bg-gray-50' : 'hover:bg-yellow-50'}`}>
                                        <td className="p-3 text-center cursor-pointer" onClick={() => toggleFocus(a.id)}>
                                            <iconify-icon icon={a.isFocus ? "solar:star-bold" : "solar:star-linear"} className={a.isFocus ? "text-rpg-yellow" : "text-gray-300"}></iconify-icon>
                                        </td>
                                        <td className="p-3">
                                            <div className={`font-medium ${a.status === STATUS.SUBMITTED ? 'line-through' : ''}`}>{a.title}</div>
                                            <div className="text-xs text-gray-500">{a.type}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 border border-ink font-bold ${c.color}`}>
                                                {c.code}
                                            </span>
                                        </td>
                                        <td className="p-3 font-pixel text-lg">{a.dueDate}</td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-1 border font-bold uppercase rounded-sm ${getStatusColor(a.status)}`}>
                                                {a.status === STATUS.TODO ? 'To Do' : a.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {a.status !== STATUS.SUBMITTED && (
                                                <button 
                                                    onClick={() => updateStatus(a.id, STATUS.SUBMITTED)}
                                                    className="text-xs border border-ink bg-white hover:bg-ink hover:text-white px-2 py-1 font-pixel uppercase"
                                                >
                                                    Done
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssignmentsPage;
