import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Building2Icon, 
  UsersIcon, 
  StethoscopeIcon, 
  ActivityIcon,
  FlaskConicalIcon,
  PillIcon,
  TrendingUpIcon,
  MapPinIcon
} from 'lucide-react';

const HospitalDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/hospital/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching hospital stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Admin Dashboard...</div>;

    const mainStats = [
        { label: 'Total Patients', value: stats.total_patients, icon: UsersIcon, color: 'blue' },
        { label: 'Licensed Doctors', value: stats.total_doctors, icon: StethoscopeIcon, color: 'indigo' },
        { label: 'Active Consultations', value: stats.active_consultations, icon: ActivityIcon, color: 'emerald' },
    ];

    const departmentStats = [
        { label: 'Lab Tests Pending', value: stats.pending_lab_tests, icon: FlaskConicalIcon, color: 'amber' },
        { label: 'Prescriptions Pending', value: stats.pending_prescriptions, icon: PillIcon, color: 'rose' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                            <Building2Icon className="w-5 h-5" />
                            <span>Institutional Overview</span>
                        </div>
                        <h1 className="text-4xl font-bold italic">City General Hospital</h1>
                        <p className="text-slate-400 flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            123 Health Ave, Central District • Multi-Specialty Health Center
                        </p>
                    </div>
                    <div className="hidden lg:block bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">All Units Operational</span>
                        </div>
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-100px] left-[20%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mainStats.map((stat) => (
                    <div key={stat.label} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <p className="text-slate-500 font-medium">{stat.label}</p>
                        <div className="flex items-end gap-3 mt-1">
                            <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                            <span className="text-green-500 text-sm font-medium flex items-center mb-1">
                                <TrendingUpIcon className="w-4 h-4 mr-1" />
                                +4.2%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-blue-500" />
                        Departmental Queue
                    </h3>
                    <div className="space-y-4">
                        {departmentStats.map((dep) => (
                            <div key={dep.label} className="p-5 rounded-2xl border border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-${dep.color}-100 text-${dep.color}-600`}>
                                        <dep.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-slate-700">{dep.label}</span>
                                </div>
                                <span className="text-2xl font-black text-slate-900">{dep.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                   <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Hospital Capacity</h3>
                            <p className="text-slate-500 text-sm">Real-time bed and resource allocation tracking.</p>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-600">ICU Beds</span>
                                    <span className="text-slate-900 font-bold">12 / 20</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-600">General Ward</span>
                                    <span className="text-slate-900 font-bold">85 / 120</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDashboard;
