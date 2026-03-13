import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import Consultation from './pages/Consultation';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import PatientRecords from './pages/PatientRecords';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="register" element={<PatientRegistration />} />
          <Route path="consultation" element={<Consultation />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="laboratory" element={<Laboratory />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="patient/:id" element={<PatientRecords />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
