import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import GlassBackground from '../common/GlassBackground';
import Navigation from './Navigation';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <GlassBackground />
      <Navigation />
      <main className="flex-grow relative z-10">
        {children || <Outlet />}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

