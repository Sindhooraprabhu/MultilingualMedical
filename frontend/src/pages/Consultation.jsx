import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Save, Activity, FileText, AlertTriangle, Volume2 } from 'lucide-react';
import api from '../api';

export default function Consultation() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientLanguage, setPatientLanguage] = useState('en-IN');
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch patients for the dropdown
    api.get('/patients').then(res => setPatients(res.data)).catch(console.error);

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + '. ';
          }
        }
        if (currentTranscript) {
           setTranscript((prev) => prev + currentTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    } else {
        console.warn("Speech Recognition not supported in this browser.");
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setAiResult(null);
      if (recognitionRef.current) {
        recognitionRef.current.lang = patientLanguage;
      }
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const processConsultation = async () => {
    if (!transcript.trim()) return;
    setProcessing(true);
    try {
      let englishTranscript = transcript;
      if (!patientLanguage.startsWith('en')) {
         const transRes = await api.post('/translate', {
            text: transcript,
            source_lang: patientLanguage,
            target_lang: 'en'
         });
         englishTranscript = transRes.data.translated_text;
      }

      const response = await api.post('/ai/analyze_consultation', {
        transcript: englishTranscript
      });
      
      setAiResult({
         ...response.data,
         original_transcript: transcript,
         translated_transcript: englishTranscript
      });
    } catch (error) {
      console.error('Failed to process AI logic:', error);
      alert('AI processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const saveConsultation = async () => {
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }
    
    try {
      await api.post('/consultations', {
        patient_id: selectedPatientId,
        original_transcript: aiResult.original_transcript || transcript,
        translated_transcript: aiResult.translated_transcript || '',
        symptoms: aiResult.symptoms,
        diagnosis: aiResult.diagnosis,
        doctor_notes: aiResult.doctor_notes,
        follow_up_instructions: aiResult.follow_up_instructions,
        prescriptions: aiResult.prescriptions,
        lab_tests: aiResult.lab_tests
      });
      alert('Consultation saved successfully and routed to pharmacy/lab!');
      // Reset
      setTranscript('');
      setAiResult(null);
      setSelectedPatientId('');
    } catch (error) {
      console.error(error);
      alert('Failed to save consultation');
    }
  };

  const speakToPatient = async (text) => {
     try {
       let textToSpeak = text;
       if (!patientLanguage.startsWith('en')) {
          const transRes = await api.post('/translate', {
            text: text,
            source_lang: 'en',
            target_lang: patientLanguage
          });
          textToSpeak = transRes.data.translated_text;
       }
       
       const utterance = new SpeechSynthesisUtterance(textToSpeak);
       utterance.lang = patientLanguage;
       window.speechSynthesis.speak(utterance);
     } catch (error) {
       console.error("Speech error", error);
     }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Mic className="w-8 h-8 text-blue-600" />
            Voice Consultation
          </h1>
          <p className="text-gray-500 mt-1">Capture clinical notes via speech and generate insights using AI.</p>
        </div>
        
        <div className="w-72">
           <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
           <select 
             value={selectedPatientId}
             onChange={(e) => {
                setSelectedPatientId(e.target.value);
                const p = patients.find(pat => pat.id === e.target.value);
                if (p && p.preferred_language) {
                   setPatientLanguage(p.preferred_language);
                }
             }}
             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
           >
             <option value="">-- Choose Patient --</option>
             {patients.map(p => (
               <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Voice Capture */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
             
             <button 
                onClick={toggleRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-lg ${
                  isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
             >
                {isRecording ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-10 h-10" />}
             </button>
             
             <h3 className="text-lg font-bold text-gray-900">
                {isRecording ? 'Listening...' : 'Tap Mic to Start'}
             </h3>
             <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Speak {patientLanguage.startsWith('en') ? 'English' : 'in local language'}. Describe the patient's symptoms, required lab tests, and medications.
             </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-64">
             <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-center">
                 <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Live Transcript
                 </h4>
             </div>
             <div className="p-4 flex-1 overflow-y-auto">
                {transcript ? (
                  <div>
                    <p className="text-gray-800 leading-relaxed text-lg mb-2">{transcript}</p>
                    {aiResult?.translated_transcript && (
                      <p className="text-blue-600 text-sm italic border-t pt-2 border-gray-100">
                         English: {aiResult.translated_transcript}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Transcript will appear here as you speak...</p>
                )}
             </div>
             <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                 <button
                    onClick={processConsultation}
                    disabled={!transcript || isRecording || processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                 >
                    {processing ? <Activity className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                    {processing ? 'Processing with AI...' : 'Generate Clinical Summary'}
                 </button>
             </div>
          </div>
        </div>

        {/* Right Column: AI Output */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-blue-50 rounded-t-xl">
              <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                 AI Medical Summary
              </h3>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
             {!aiResult ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Activity className="w-16 h-16 mb-4 opacity-30" />
                    <p>AI generated details will populate here.</p>
                </div>
             ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    
                    {aiResult.risk_alert && (
                       <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-4">
                          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                          <div>
                             <h4 className="font-bold text-red-800">High Risk Alert Detected</h4>
                             <p className="text-red-700 text-sm mt-1">{aiResult.risk_alert}</p>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                          <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Symptoms</h4>
                          <p className="text-gray-800 font-medium">{aiResult.symptoms}</p>
                       </div>
                       <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Possible Diagnosis</h4>
                          <p className="text-gray-800 font-medium">{aiResult.diagnosis}</p>
                       </div>
                    </div>

                    {aiResult.prescriptions?.length > 0 && (
                       <div>
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Prescribed Medicines
                          </h4>
                          <ul className="space-y-2">
                            {aiResult.prescriptions.map((p, i) => (
                               <li key={i} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                  <span className="font-medium text-gray-900">{p.medicine_name}</span>
                                  <span className="text-gray-500 text-sm">{p.dosage}</span>
                               </li>
                            ))}
                          </ul>
                       </div>
                    )}

                    {aiResult.lab_tests?.length > 0 && (
                       <div>
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-blue-500"></span> Recommended Lab Tests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {aiResult.lab_tests.map((t, i) => (
                               <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                                  {t.test_name}
                               </span>
                            ))}
                          </div>
                       </div>
                    )}

                    <div>
                       <div className="flex justify-between items-end mb-2">
                           <h4 className="text-sm font-bold text-gray-700">Clinical Notes & Follow-up</h4>
                           <button 
                              onClick={() => speakToPatient(aiResult.doctor_notes + ". " + aiResult.follow_up_instructions)}
                              className="text-xs flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                           >
                              <Volume2 className="w-3 h-3" /> Speak to Patient
                           </button>
                       </div>
                       <textarea 
                          className="w-full text-gray-700 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          defaultValue={`${aiResult.doctor_notes}\n\n${aiResult.follow_up_instructions}`}
                       />
                    </div>
                </div>
             )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
             <button
                onClick={saveConsultation}
                disabled={!aiResult}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
             >
                <Save className="w-5 h-5" />
                Save & Update Records
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
