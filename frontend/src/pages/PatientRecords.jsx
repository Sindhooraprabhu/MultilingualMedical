import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
   UsersIcon, 
   Search, 
   Activity, 
   Download,
   Stethoscope,
   Pill,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

export default function PatientRecords() {
  const { id } = useParams();
  
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(id || '');
  const [patientDetails, setPatientDetails] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch list of patients for the sidebar
  useEffect(() => {
    api.get('/patients').then(res => {
        setPatients(res.data);
        if(!id && res.data.length > 0) {
            setSelectedPatientId(res.data[0].id);
        }
        setLoading(false);
    }).catch(console.error);
  }, [id]);

  // Fetch specific patient timeline
  useEffect(() => {
    if (!selectedPatientId) return;
    
    const fetchPatientData = async () => {
       try {
          const pRes = await api.get(`/patients/${selectedPatientId}`);
          setPatientDetails(pRes.data);
          
          const cRes = await api.get(`/consultations/patient/${selectedPatientId}`);
          setConsultations(cRes.data);
       } catch (error) {
          console.error("Error fetching patient timeline", error);
       }
    };
    
    fetchPatientData();
  }, [selectedPatientId]);

  const downloadReport = async () => {
      window.print();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] print:h-auto print:block">
       {/* Left Sidebar: Patient List */}
       <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full print:hidden">
           <div className="p-4 border-b border-gray-200">
               <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                     type="text" 
                     placeholder="Search patients..." 
                     className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                  />
               </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
               {loading ? (
                   <div className="p-8 text-center text-gray-400 text-sm">Loading patients...</div>
               ) : patients.map(p => (
                   <button 
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full text-left p-4 border-b border-gray-100 transition-colors flex items-center justify-between group
                          ${selectedPatientId === p.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
                      `}
                   >
                      <div>
                          <p className={`font-medium ${selectedPatientId === p.id ? 'text-blue-900' : 'text-gray-900'}`}>{p.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{p.id} • {p.age} yrs • {p.gender}</p>
                      </div>
                   </button>
               ))}
           </div>
       </div>

       {/* Right Area: Unified Timeline */}
       <div className="flex-1 overflow-y-auto bg-gray-50 p-8 print:col-span-12 print:p-4 print:bg-white print:overflow-visible">
           {!patientDetails ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                   <UsersIcon className="w-16 h-16 mb-4 opacity-20" />
                   <p>Select a patient to view their medical timeline.</p>
               </div>
           ) : (
               <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
                   
                   {/* Printable Header */}
                   <div className="hidden print:flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-8 mt-4">
                       <div>
                           <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
                              <Activity className="w-8 h-8" /> MEDIFLOW
                           </h1>
                           <p className="text-gray-600 font-medium tracking-wide border-t border-gray-200 pt-1 mt-1">
                               Portable Medical Record
                           </p>
                       </div>
                       <div className="flex items-center gap-4 text-right">
                            <div>
                               <p className="text-sm text-gray-500 font-semibold uppercase">Scan for Live Record</p>
                               <p className="text-xs text-gray-400">ID: {patientDetails.id}</p>
                            </div>
                            <QRCodeSVG value={window.location.origin + `/patient/${patientDetails.id}`} size={80} level="H" />
                       </div>
                   </div>

                   {/* Patient Header Card */}
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex justify-between items-start print:shadow-none print:border-gray-300">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <h1 className="text-2xl font-bold text-gray-900">{patientDetails.name}</h1>
                               <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                                   {patientDetails.id}
                               </span>
                           </div>
                           <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                               <div><span className="font-semibold text-gray-500 mr-1">Age:</span> {patientDetails.age}</div>
                               <div><span className="font-semibold text-gray-500 mr-1">Gender:</span> {patientDetails.gender}</div>
                               <div><span className="font-semibold text-gray-500 mr-1">Contact:</span> {patientDetails.contact_number}</div>
                               <div><span className="font-semibold text-gray-500 mr-1">Language:</span> {patientDetails.preferred_language}</div>
                           </div>
                       </div>
                       
                       <button 
                          onClick={downloadReport}
                          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors border border-blue-200 shadow-sm print:hidden"
                       >
                          <Download className="w-4 h-4" /> Download Report
                       </button>
                   </div>

                   {/* Timeline Section */}
                   <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <Activity className="w-5 h-5 text-gray-400" />
                       Clinical History & Timeline
                   </h3>
                   
                   <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                       
                       {consultations.length === 0 ? (
                           <div className="text-center py-12 text-gray-400 relative z-10 bg-gray-50">
                               No consultations recorded yet.
                           </div>
                       ) : consultations.map((consultation, idx) => (
                           <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                               
                               {/* Icon Marker */}
                               <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 print:transform-none print:order-none print:static print:shadow-none print:border-gray-200">
                                   <Stethoscope className="w-5 h-5" />
                               </div>
                               
                               {/* Card */}
                               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm print:w-[calc(100%-5rem)] print:shadow-none print:border-gray-300">
                                   <div className="flex items-center justify-between mb-4">
                                       <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                          Consultation
                                       </span>
                                       <span className="text-xs text-gray-500 font-medium">
                                          {new Date(consultation.date).toLocaleDateString()}
                                       </span>
                                   </div>
                                   
                                   <div className="space-y-4">
                                       <div>
                                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Symptoms</p>
                                           <p className="text-sm font-medium text-gray-900">{consultation.symptoms}</p>
                                       </div>
                                       <div>
                                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Diagnosis</p>
                                           <p className="text-sm text-red-600 font-medium">{consultation.diagnosis}</p>
                                       </div>
                                       {consultation.doctor_notes && (
                                           <div className="pt-3 border-t border-gray-100">
                                               <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Doctor's Notes</p>
                                               <p className="text-sm text-gray-700 italic">"{consultation.doctor_notes}"</p>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>

               </div>
           )}
       </div>
    </div>
  );
}
