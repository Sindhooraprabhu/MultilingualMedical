import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  UserIcon, 
  MicIcon, 
  PlayIcon, 
  SaveIcon, 
  XIcon, 
  FileTextIcon,
  MessageSquareIcon,
  Volume2Icon,
  LanguagesIcon
} from 'lucide-react';

const DoctorConsultation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [playBackLoading, setPlayBackLoading] = useState(false);
    const [translation, setTranslation] = useState(null);

    useEffect(() => {
        const fetchConsultation = async () => {
             // In a real app we'd have an endpoint to get single consultation detail
             // For now we'll fetch the patient history and find it
             try {
                // Mocking the behavior for the prototype
                const res = await api.get(`/api/dashboard/stats`); // just a heartbeat
                setConsultation({
                    id: id,
                    patient_name: "John Doe",
                    patient_id: "PAT-001",
                    symptoms: "High fever and chest pain",
                    preferred_language: "Tamil",
                    patient_language_code: "ta-IN"
                });
             } catch (err) {
                 console.error(err);
             } finally {
                 setLoading(false);
             }
        };
        fetchConsultation();
    }, [id]);

    const handleStartSTT = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Doctor speaks in English
        recognition.continuous = false;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInstructions(prev => prev + " " + transcript);
        };

        recognition.start();
    };

    const handleProcessPlayback = async () => {
        if (!instructions.trim()) return;
        setPlayBackLoading(true);
        try {
            const res = await api.post('/api/doctor/instructions_playback', {
                text: instructions,
                target_lang: consultation.preferred_language === 'Tamil' ? 'ta' : 'kn'
            });
            
            setTranslation(res.data.translated_text);
            
            // Play Audio
            const audioData = res.data.audio_base64;
            const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
            audio.play();

        } catch (err) {
            console.error("Playback error:", err);
            alert("Translation/TTS service failed");
        } finally {
            setPlayBackLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.post('/api/consultations', {
                patient_id: consultation.patient_id,
                doctor_id: "DOC-001",
                symptoms: consultation.symptoms,
                follow_up_instructions: instructions,
                completed: true
            });
            alert("Consultation completed and saved.");
            navigate('/doctor-dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center">Opening Consultation File...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/doctor-dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <XIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 italic">Active Consultation</h1>
                </div>
                <button 
                   onClick={handleSave}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
                >
                    <SaveIcon className="w-5 h-5" />
                    Finalize & Save
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                <UserIcon className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{consultation.patient_name}</h3>
                            <p className="text-sm text-slate-500 font-medium">ID: {consultation.patient_id}</p>
                            <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase">
                                Language: {consultation.preferred_language}
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-3">
                            <FileTextIcon className="w-4 h-4" />
                            Captured Symptoms
                        </h4>
                        <p className="text-amber-900 text-sm leading-relaxed bg-white/50 p-4 rounded-xl italic">
                            "{consultation.symptoms}"
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-2">
                                <MessageSquareIcon className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-slate-800">Clinical Instructions</h3>
                           </div>
                           <button 
                            onClick={handleStartSTT}
                            className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                           >
                            <MicIcon className="w-6 h-6" />
                           </button>
                        </div>

                        <textarea 
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Enter or dictate instructions for the patient (e.g. Dosage, dietary restrictions)..."
                            className="flex-1 w-full p-6 text-lg text-slate-800 bg-slate-50 border-none rounded-2xl focus:ring-0 resize-none placeholder:text-slate-300 italic"
                        />

                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                           <p className="text-xs text-slate-400 font-medium italic">Speak or type your advice in English - The system will handle the rest.</p>
                           <button 
                            disabled={playBackLoading || !instructions}
                            onClick={handleProcessPlayback}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${playBackLoading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-black/10'}`}
                           >
                            {playBackLoading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Volume2Icon className="w-5 h-5" />
                                    Translate & Play to Patient
                                </>
                            )}
                           </button>
                        </div>
                    </div>

                    {translation && (
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                             <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                                <LanguagesIcon className="w-4 h-4" />
                                Translated Advice ({consultation.preferred_language})
                             </div>
                             <p className="text-emerald-900 font-medium text-lg leading-relaxed">
                                {translation}
                             </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorConsultation;
