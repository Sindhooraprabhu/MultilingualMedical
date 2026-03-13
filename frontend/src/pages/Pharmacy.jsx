import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

export default function Pharmacy() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Error fetching prescriptions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const markDispensed = async (id) => {
    try {
      await api.put(`/prescriptions/${id}`, { status: 'Dispensed' });
      fetchPrescriptions();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Pill className="w-8 h-8 text-green-600" />
          Pharmacy Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage and dispense prescriptions generated from consultations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No prescriptions found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{p.patient_name}</div>
                    <div className="text-sm text-gray-500">{p.patient_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {p.medicine_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.dosage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1
                      ${p.status === 'Dispensed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {p.status === 'Dispensed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {p.status === 'Pending' && (
                      <button 
                        onClick={() => markDispensed(p.id)}
                        className="text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-md transition-colors"
                      >
                        Dispense
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
