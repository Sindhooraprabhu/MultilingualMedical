import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ActivitySquare, 
  Pill, 
  BeakerIcon,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_patients: 0,
    active_consultations: 0,
    pending_lab_tests: 0,
    pending_prescriptions: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const cards = [
    { 
      title: 'Total Patients', 
      value: stats.total_patients, 
      icon: UsersIcon, 
      color: 'bg-blue-500', 
      trend: '+12% this week' 
    },
    { 
       title: 'Active Consultations', 
       value: stats.active_consultations, 
       icon: Stethoscope, 
       color: 'bg-purple-500', 
       trend: 'Live' 
    },
    { 
       title: 'Pending Lab Tests', 
       value: stats.pending_lab_tests, 
       icon: BeakerIcon, 
       color: 'bg-yellow-500', 
       trend: `${stats.pending_lab_tests > 5 ? 'High Volume' : 'Normal'}`
    },
    { 
       title: 'Pending Prescriptions', 
       value: stats.pending_prescriptions, 
       icon: Pill, 
       color: 'bg-green-500', 
       trend: 'Requires Action' 
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ActivitySquare className="w-8 h-8 text-blue-600" />
          Hospital System Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Overview of clinical workflows and AI processing metrics.</p>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                 <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                    
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${card.color}`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                       <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color} bg-opacity-10`}>
                          <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                       </div>
                       <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                         <TrendingUp className="w-3 h-3 mr-1" />
                         {card.trend}
                       </span>
                    </div>
                    
                    <div>
                       <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
                       <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    </div>
                 </div>
              );
           })}
        </div>
      )}

      {/* Workflow Map Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
         <h2 className="text-lg font-bold text-gray-900 mb-6">AI Clinical Workflow Overview</h2>
         
         <div className="flex flex-col md:flex-row items-center justify-between relative">
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
             
             {[
                { step: '1', title: 'Registration', desc: 'QR Code Generation' },
                { step: '2', title: 'Voice', desc: 'Multilingual Capture' },
                { step: '3', title: 'AI Summary', desc: 'Clinical Data Extraction' },
                { step: '4', title: 'Pharmacy', desc: 'Prescription Routing' },
                { step: '5', title: 'Lab', desc: 'Diagnostic Updates' }
             ].map((node, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center bg-white px-4 md:px-0 md:bg-transparent">
                   <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-3">
                      {node.step}
                   </div>
                   <h4 className="font-bold text-gray-900 text-sm">{node.title}</h4>
                   <p className="text-xs text-gray-500 mt-1">{node.desc}</p>
                </div>
             ))}
         </div>
      </div>
    </div>
  );
}
