import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GradientButton from '../ui/GradientButton';

const NavBar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-dark/80 backdrop-blur-lg border-b border-glass-border py-4' : 'bg-transparent py-6'}
      `}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-white font-bold">
                        AI
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">ImageAI</span>
                </Link>

                {isHome && (
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
                        <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
                    </div>
                )}

                <GradientButton className="text-sm px-6 py-2">
                    Tải App
                </GradientButton>
            </div>
        </nav>
    );
};

export default NavBar;
