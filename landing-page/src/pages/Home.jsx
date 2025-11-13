import React, { Suspense, lazy } from 'react';
import Hero from '../sections/Hero.jsx';
import Features from '../sections/Features.jsx';
import SocialProof from '../sections/SocialProof.jsx';
const Testimonials = lazy(() => import('../sections/Testimonials.jsx'));
import Pricing from '../sections/Pricing.jsx';
const FAQ = lazy(() => import('../sections/FAQ.jsx'));
import Contact from '../sections/Contact.jsx';
import FinalCTA from '../sections/FinalCTA.jsx';

export default function Home() {
  return (
    <>
      <div className="space-y-24">
        <Hero />
        <Features />
        <SocialProof />
        <Suspense fallback={null}>
          <Testimonials />
        </Suspense>
        <Pricing />
        <Suspense fallback={null}>
          <FAQ />
        </Suspense>
        <Contact />
        <FinalCTA />
      </div>
    </>
  );
}