import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlusIcon, CheckCircleIcon } from 'lucide-react';
import api from '../api';

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    preferred_language: 'en-IN',
    contact_number: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/patients', formData);
      setPatientData({
        ...formData,
        id: response.data.patient_id,
        qrUrl: response.data.qr_code_url
      });
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        preferred_language: 'en-IN',
        contact_number: ''
      });
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlusIcon className="w-8 h-8 text-blue-600" />
          Patient Registration
        </h1>
        <p className="text-gray-500 mt-1">Register a new patient and generate their digital ID.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. 45"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    required
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Preferred Language</label>
                  <select
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="en-IN">English</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="kn-IN">Kannada</option>
                    <option value="te-IN">Telugu</option>
                    <option value="ta-IN">Tamil</option>
                    <option value="ml-IN">Malayalam</option>
                    <option value="mr-IN">Marathi</option>
                    <option value="bn-IN">Bengali</option>
                    <option value="gu-IN">Gujarati</option>
                    <option value="pa-IN">Punjabi</option>
                    <option value="ur-IN">Urdu</option>
                    <option value="or-IN">Odia</option>
                    <option value="as-IN">Assamese</option>
                    <option value="tcy-IN">Tulu (if supported)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success & QR Code Section */}
        <div className="lg:col-span-1">
          {success && patientData ? (
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Registration Successful!</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">Patient profile created.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 w-full mb-6">
                <p className="text-sm text-gray-500 uppercase font-semibold">Patient ID</p>
                <p className="text-2xl font-bold text-blue-700">{patientData.id}</p>
                <p className="text-md font-medium text-gray-800 mt-2">{patientData.name}</p>
              </div>

              <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                 <QRCodeSVG 
                    value={`http://localhost:5173${patientData.qrUrl}`} 
                    size={160}
                    level="H"
                    includeMargin={true}
                 />
              </div>
              <p className="text-xs text-gray-400 mt-4">Scan to open patient record</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-8 h-full flex flex-col items-center justify-center text-center text-gray-400">
              <UserPlusIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>Fill out the form to generate the patient's ID and QR Code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
