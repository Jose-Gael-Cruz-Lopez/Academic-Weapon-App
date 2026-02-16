import { useState, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import PixelCard from '../components/PixelCard';
import PixelBtn from '../components/PixelBtn';
import SectionHeader from '../components/SectionHeader';
import { parseSyllabusPDF, parseSyllabus } from '../parsing/syllabusParser';
import { parseScheduleImage } from '../parsing/scheduleParser';
import { parseVoiceTranscript } from '../parsing/voiceParser';

const ImportPage = () => {
    const [activeTab, setActiveTab] = useState('syllabus');
    const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Review
    const [previewItems, setPreviewItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [error, setError] = useState(null);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    
    const { addAssignment, courses } = useContext(AppContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Reset state when switching tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStep(1);
        setPreviewItems([]);
        setSelectedItems(new Set());
        setError(null);
        setVoiceTranscript('');
    };

    // Handle file selection
    const handleFileSelect = useCallback(async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setStep(2);
        setError(null);

        try {
            let items = [];

            if (activeTab === 'syllabus') {
                const classCode = courses[0]?.code; // Default to first class or none
                const result = file.type === 'application/pdf'
                    ? await parseSyllabusPDF(file, { classCode })
                    : await parseSyllabus(await file.text(), { classCode });
                items = result.assignments.map(a => ({
                    ...a,
                    type: 'assignment',
                    id: Math.random().toString(36).substr(2, 9)
                }));
            } else if (activeTab === 'schedule') {
                const result = await parseScheduleImage(file);
                items = result.items.map(i => ({
                    ...i,
                    type: 'schedule',
                    id: Math.random().toString(36).substr(2, 9)
                }));
            }

            setPreviewItems(items);
            setSelectedItems(new Set(items.map(i => i.id))); // Select all by default
            setStep(3);
        } catch (err) {
            console.error('Parse error:', err);
            setError(err.message || 'Failed to parse file');
            setStep(1);
        }
    }, [activeTab, courses]);

    // Handle voice parsing
    const handleVoiceParse = useCallback(() => {
        if (!voiceTranscript.trim()) return;

        setStep(2);
        setError(null);

        // Simulate processing delay for UX
        setTimeout(() => {
            try {
                const result = parseVoiceTranscript(voiceTranscript);
                
                if (!result.assignment) {
                    setError('Could not understand. Try: "Add math homework for tomorrow at 5pm"');
                    setStep(1);
                    return;
                }

                const item = {
                    ...result.assignment,
                    type: 'assignment',
                    id: Math.random().toString(36).substr(2, 9),
                    confidence: result.confidence
                };

                setPreviewItems([item]);
                setSelectedItems(new Set([item.id]));
                setStep(3);
            } catch (err) {
                setError('Failed to parse voice command');
                setStep(1);
            }
        }, 800);
    }, [voiceTranscript]);

    // Toggle item selection
    const toggleSelection = (id) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Save selected items
    const handleConfirm = async () => {
        const toSave = previewItems.filter(i => selectedItems.has(i.id));

        for (const item of toSave) {
            if (item.type === 'assignment') {
                // Find class by code if provided
                let courseId = '';
                if (item.class_code) {
                    const matchingClass = courses.find(c => c.code === item.class_code);
                    if (matchingClass) {
                        courseId = matchingClass.id;
                    }
                }

                await addAssignment({
                    title: item.title,
                    type: item.type,
                    courseId,
                    dueDate: item.due_date,
                    points: item.points_possible
                });
            }
            // TODO: Handle schedule items
        }

        navigate('/assignments');
    };

    // Trigger file input
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Simulate voice recording
    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            // In real implementation, this would stop speech recognition
            // For now, just use the transcript input
        } else {
            setIsRecording(true);
            // In real implementation, this would start speech recognition
            setTimeout(() => {
                setIsRecording(false);
                setVoiceTranscript('Add math homework for next Friday at 5pm');
            }, 2000);
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Import Data" subtitle="Load external cartridges" />

            <div className="flex border-b-2 border-ink">
                {['syllabus', 'schedule', 'voice'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
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
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div 
                                    onClick={triggerFileInput}
                                    className="border-2 border-dashed border-gray-300 p-8 mb-6 bg-gray-50 cursor-pointer hover:border-ink transition-colors"
                                >
                                    <span className="font-pixel text-gray-400">Click to Select File</span>
                                </div>
                            </>
                        )}
                        {activeTab === 'schedule' && (
                            <>
                                <iconify-icon icon="solar:camera-linear" width="64" className="text-gray-400 mb-4"></iconify-icon>
                                <h3 className="font-bold text-lg mb-2">Scan Schedule</h3>
                                <p className="text-sm text-gray-500 mb-6">Upload a screenshot of your class schedule grid.</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <PixelBtn onClick={triggerFileInput} className="w-full">Select Image</PixelBtn>
                            </>
                        )}
                        {activeTab === 'voice' && (
                            <>
                                <iconify-icon icon="solar:microphone-linear" width="64" className="text-gray-400 mb-4"></iconify-icon>
                                <h3 className="font-bold text-lg mb-2">Voice Command</h3>
                                <p className="text-sm text-gray-500 mb-6">Type or speak your assignment</p>
                                <input
                                    type="text"
                                    value={voiceTranscript}
                                    onChange={(e) => setVoiceTranscript(e.target.value)}
                                    placeholder="Add math homework for next Friday at 5pm"
                                    className="w-full border-2 border-ink p-3 mb-4 font-mono"
                                />
                                <div 
                                    onClick={toggleRecording}
                                    className={`w-16 h-16 rounded-full text-white flex items-center justify-center mx-auto border-4 border-double border-white shadow-lg cursor-pointer hover:scale-105 transition-transform mb-4 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-rpg-red'}`}
                                >
                                    <iconify-icon icon={isRecording ? "solar:stop-bold" : "solar:microphone-bold"} width="24"></iconify-icon>
                                </div>
                                <PixelBtn 
                                    onClick={handleVoiceParse} 
                                    disabled={!voiceTranscript.trim()}
                                    className="w-full" 
                                    icon="solar:magic-stick-linear"
                                >
                                    Process Magic
                                </PixelBtn>
                            </>
                        )}
                        
                        {activeTab !== 'voice' && (
                            <PixelBtn onClick={triggerFileInput} className="w-full mt-4" icon="solar:magic-stick-linear">
                                Process Magic
                            </PixelBtn>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}
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
                        <h3 className="font-pixel text-xl mb-4 text-center text-rpg-green">
                            Found {previewItems.length} items
                        </h3>
                        
                        {previewItems.length === 0 ? (
                            <div className="text-center text-gray-500 mb-4">
                                No items detected. Try a clearer image or different file.
                            </div>
                        ) : (
                            <div className="border-2 border-ink bg-white mb-6 max-h-64 overflow-y-auto">
                                {previewItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => toggleSelection(item.id)}
                                        className={`flex justify-between p-3 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50 ${selectedItems.has(item.id) ? 'bg-blue-50' : 'opacity-60'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedItems.has(item.id)}
                                                onChange={() => {}} // Handled by parent click
                                                className="w-4 h-4 accent-ink"
                                            />
                                            <div>
                                                <div className="font-bold text-sm">{item.title || 'Untitled'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.type === 'schedule' 
                                                        ? `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][item.day_of_week]} ${item.start_time}-${item.end_time}`
                                                        : `${item.type} • Due ${item.due_date}`
                                                    }
                                                    {item.class_code && ` • ${item.class_code}`}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-pixel text-xs px-2 py-1 ${
                                            (item.confidence || 0.8) > 0.7 ? 'bg-green-100 text-green-700' : 
                                            (item.confidence || 0.8) > 0.4 ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {Math.round((item.confidence || 0.8) * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <PixelBtn onClick={() => setStep(1)} variant="secondary" className="flex-1">Cancel</PixelBtn>
                            <PixelBtn 
                                onClick={handleConfirm} 
                                disabled={selectedItems.size === 0}
                                className="flex-1"
                            >
                                Save {selectedItems.size > 0 && `(${selectedItems.size})`}
                            </PixelBtn>
                        </div>
                    </div>
                )}
            </PixelCard>
        </div>
    );
};

export default ImportPage;
