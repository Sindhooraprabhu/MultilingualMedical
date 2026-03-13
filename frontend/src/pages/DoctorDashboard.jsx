import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ChevronRightIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Mocking doctor ID for now - in real app would come from Auth
    const doctorId = "DOC-001"; 

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get(`/api/doctor/${doctorId}/dashboard`);
                setConsultations(res.data);
            } catch (err) {
                console.error("Error fetching doctor dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'In-Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Physician Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your assigned patients and clinical consultations.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Assigned Patients', value: consultations.length, icon: UsersIcon, color: 'blue' },
                    { label: 'Pending Reviews', value: consultations.filter(c => c.status !== 'Completed').length, icon: ClockIcon, color: 'amber' },
                    { label: 'Completed Today', value: consultations.filter(c => c.status === 'Completed').length, icon: CheckCircleIcon, color: 'green' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-slate-800">Recent Consultation Requests</h2>
                    <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                        <FilterIcon className="w-3.5 h-3.5" />
                        Filter
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading consultations...</div>
                ) : consultations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UsersIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500">No patients assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {consultations.map((item) => (
                            <div 
                                key={item.consultation_id} 
                                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                                onClick={() => navigate(`/doctor/consultation/${item.consultation_id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        {item.patient_name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{item.patient_name}</h4>
                                        <p className="text-xs text-slate-500">ID: {item.patient_id} • {new Date(item.date).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden lg:block text-right">
                                        <p className="text-xs text-slate-400 uppercase font-semibold">Primary Symptom</p>
                                        <p className="text-sm text-slate-600 truncate max-w-[200px]">{item.symptoms || 'Not recorded'}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                    <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
