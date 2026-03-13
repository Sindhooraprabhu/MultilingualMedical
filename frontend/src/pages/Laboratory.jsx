import React, { useState, useEffect } from 'react';
import { BeakerIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import api from '../api';

export default function Laboratory() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      const res = await api.get('/lab_tests');
      setTests(res.data);
    } catch (error) {
      console.error('Error fetching lab tests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleUpdateResult = async (id, currentStatus) => {
    if (currentStatus === 'Completed') return;
    
    const result = prompt("Enter lab test result (e.g. 'Normal', 'Positive', 'Elevated WBC'):");
    if (result) {
        try {
            await api.put(`/lab_tests/${id}`, { status: 'Completed', result });
            fetchTests();
        } catch (error) {
            console.error('Error saving result', error);
            alert('Failed to save result');
        }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BeakerIcon className="w-8 h-8 text-blue-600" />
          Laboratory Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage diagnostic test requests and enter results.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           <p className="text-gray-500">Loading tests...</p>
        ) : tests.length === 0 ? (
           <p className="text-gray-500">No pending lab tests.</p>
        ) : (
          tests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
               <div className={`p-4 border-b ${test.status === 'Completed' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                         test.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                     }`}>
                        {test.status === 'Completed' ? <CheckCircleIcon className="w-3 h-3"/> : <ClockIcon className="w-3 h-3"/>}
                        {test.status}
                     </span>
                     <span className="text-xs text-gray-500">{new Date(test.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-2" title={test.test_name}>{test.test_name}</h3>
               </div>
               
               <div className="p-4">
                  <div className="mb-4">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Patient</p>
                     <p className="text-sm font-medium text-gray-900">{test.patient_name}</p>
                     <p className="text-xs text-gray-500">{test.patient_id}</p>
                  </div>

                  {test.status === 'Completed' ? (
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Result</p>
                        <p className="text-sm font-medium text-gray-900">{test.result}</p>
                     </div>
                  ) : (
                     <button 
                        onClick={() => handleUpdateResult(test.id, test.status)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                     >
                        Enter Result
                     </button>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
