import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { HRDashboard } from './pages/HRDashboard';
import { TrackCase } from './pages/TrackCase';
import { HRLogin } from './pages/HRLogin';
import { DatabaseStatus } from './pages/DatabaseStatus';
import { Footer } from './components/Footer';
import { MagicalBoltLogo } from './components/MagicalBoltLogo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/track" element={<TrackCase />} />
            <Route path="/hr-login" element={<HRLogin />} />
            <Route path="/hr-dashboard" element={<HRDashboard />} />
            <Route path="/database-status" element={<DatabaseStatus />} />
          </Routes>
        </main>
        <Footer />
        <MagicalBoltLogo />
      </div>
    </Router>
  );
}

export default App;