import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import PixelCard from '../components/PixelCard';
import PixelBtn from '../components/PixelBtn';
import SectionHeader from '../components/SectionHeader';

const ImportPage = () => {
    const [activeTab, setActiveTab] = useState('syllabus');
    const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Review
    const { addAssignment } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSimulateImport = () => {
        setStep(2);
        setTimeout(() => setStep(3), 1500);
    };

    const handleConfirm = () => {
        addAssignment({
            title: 'Imported Assignment 1',
            type: 'Homework',
            courseId: 'c1',
            dueDate: '2023-11-20'
        });
        navigate('/assignments');
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Import Data" subtitle="Load external cartridges" />

            <div className="flex border-b-2 border-ink">
                {['syllabus', 'schedule', 'voice'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setStep(1); }}
                        className={`px-6 py-2 font-pixel text-xl uppercase border-t-2 border-x-2 border-ink mr-[-2px] relative top-[2px] ${activeTab === tab ? 'bg-white z-10' : 'bg-gray-100 text-gray-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <PixelCard className="min-h-[300px] flex flex-col justify-center items-center text-center p-8">
                {step === 1 && (
                    <div className="max-w-md w-full animate-fade-in">
                        {activeTab === 'syllabus' && (
                            <>
                                <iconify-icon icon="solar:file-text-linear" width="64" className="text-gray-400 mb-4"></iconify-icon>
                                <h3 className="font-bold text-lg mb-2">Upload Syllabus PDF</h3>
                                <p className="text-sm text-gray-500 mb-6">We'll scan for dates and assignments automatically.</p>
                                <div className="border-2 border-dashed border-gray-300 p-8 mb-6 bg-gray-50">
                                    <span className="font-pixel text-gray-400">Drag & Drop or Click</span>
                                </div>
                            </>
                        )}
                        {activeTab === 'schedule' && (
                            <>
                                <iconify-icon icon="solar:camera-linear" width="64" className="text-gray-400 mb-4"></iconify-icon>
                                <h3 className="font-bold text-lg mb-2">Scan Schedule</h3>
                                <p className="text-sm text-gray-500 mb-6">Upload a screenshot of your class schedule grid.</p>
                                <PixelBtn className="w-full">Select Image</PixelBtn>
                            </>
                        )}
                        {activeTab === 'voice' && (
                            <>
                                <iconify-icon icon="solar:microphone-linear" width="64" className="text-gray-400 mb-4"></iconify-icon>
                                <h3 className="font-bold text-lg mb-2">Voice Command</h3>
                                <p className="text-sm text-gray-500 mb-6">"Add a Math Exam for next Friday at 2pm"</p>
                                <div className="w-16 h-16 rounded-full bg-rpg-red text-white flex items-center justify-center mx-auto border-4 border-double border-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                    <iconify-icon icon="solar:microphone-bold" width="24"></iconify-icon>
                                </div>
                            </>
                        )}
                        
                        <PixelBtn onClick={handleSimulateImport} className="w-full mt-4" icon="solar:magic-stick-linear">
                            Process Magic
                        </PixelBtn>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin mb-4"></div>
                        <div className="font-pixel text-xl animate-pulse">Parsing Data...</div>
                    </div>
                )}

                {step === 3 && (
                    <div className="w-full text-left animate-fade-in">
                        <h3 className="font-pixel text-xl mb-4 text-center text-rpg-green">Success! Found 3 items.</h3>
                        <div className="border-2 border-ink bg-white mb-6">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex justify-between p-3 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-ink" />
                                        <div>
                                            <div className="font-bold text-sm">Homework #{i}</div>
                                            <div className="text-xs text-gray-500">CS 101 • Due Oct {20+i}</div>
                                        </div>
                                    </div>
                                    <span className="font-pixel text-sm bg-gray-100 px-2 py-1">CONFIDENCE: HI</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <PixelBtn onClick={() => setStep(1)} variant="secondary" className="flex-1">Cancel</PixelBtn>
                            <PixelBtn onClick={handleConfirm} className="flex-1">Save All</PixelBtn>
                        </div>
                    </div>
                )}
            </PixelCard>
        </div>
    );
};

export default ImportPage;
