import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import Logo from '../common/Logo';
import GlassButton from '../common/GlassButton';

const navLinks = [
  { path: '/', label: 'Trang chủ' },
  { path: '/about', label: 'Về chúng tôi' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Liên hệ' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-primary-1/95 backdrop-blur-xl border-b border-white/20 shadow-sm" role="banner">
      {/* Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent-1 to-accent-2 transition-all duration-200" 
        style={{ width: `${scrollProgress}%` }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-18" aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity" aria-label="Home">
            <Logo size="md" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-primary-2 text-primary font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-primary-1/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Button - Separated from nav */}
          <div className="hidden md:flex items-center">
            <GlassButton size="sm" variant="primary" className="ml-4">
              <Download className="w-4 h-4 mr-2 inline-block" />
              Tải App
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-primary hover:bg-primary-1/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              {/* Menu */}
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="md:hidden pb-4 pt-2 border-t border-white/20 mt-2 relative z-50"
              >
                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-3 rounded-lg transition-all duration-200 min-h-[44px] flex items-center font-medium ${
                          isActive
                            ? 'bg-primary-2 text-primary font-semibold'
                            : 'text-secondary hover:text-primary hover:bg-primary-1/50'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="pt-2">
                    <GlassButton size="sm" variant="primary" className="w-full" onClick={() => setIsOpen(false)}>
                      <Download className="w-4 h-4 mr-2 inline-block" />
                      Tải App
                    </GlassButton>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

