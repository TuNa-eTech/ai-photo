import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/layout/NavBar';
import Hero from './sections/Hero';
import BentoFeatures from './sections/BentoFeatures';
import Footer from './components/layout/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <div className="min-h-screen bg-dark text-white selection:bg-purple-500/30 flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <BentoFeatures />
            </>
          } />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </main>
      <Footer />

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}

export default App;
