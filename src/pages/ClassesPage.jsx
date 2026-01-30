import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import PixelCard from '../components/PixelCard';
import SectionHeader from '../components/SectionHeader';

const ClassesPage = () => {
    const { courses } = useContext(AppContext);
    
    return (
        <div className="space-y-6">
            <SectionHeader title="Classes" subtitle="Your active party" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(c => (
                    <PixelCard key={c.id} className="relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 border-2 border-ink ${c.color}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-pixel text-2xl">{c.code}</h3>
                                <p className="font-bold text-lg">{c.name}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 border-t-2 border-gray-100 pt-3">
                            <div className="flex items-center gap-2">
                                <iconify-icon icon="solar:user-linear"></iconify-icon>
                                {c.instructor}
                            </div>
                            <div className="flex items-center gap-2">
                                <iconify-icon icon="solar:clock-circle-linear"></iconify-icon>
                                MWF 10:00 AM - 11:00 AM
                            </div>
                            <div className="flex items-center gap-2">
                                <iconify-icon icon="solar:map-point-linear"></iconify-icon>
                                Building A, Room 304
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                <span>Current Grade</span>
                                <span>88% (B+)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 border border-ink">
                                <div className={`h-full ${c.color} w-[88%]`}></div>
                            </div>
                        </div>
                    </PixelCard>
                ))}
                
                {/* Add Class Button */}
                <div className="border-2 border-dashed border-ink p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors min-h-[200px]">
                    <iconify-icon icon="solar:add-circle-linear" width="40"></iconify-icon>
                    <span className="font-pixel text-xl mt-2 uppercase">Add Class</span>
                </div>
            </div>
        </div>
    );
};

export default ClassesPage;
