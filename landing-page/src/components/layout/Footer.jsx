import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t border-glass-border bg-black/40 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-accent-gradient flex items-center justify-center text-white text-xs font-bold">
                            AI
                        </div>
                        <span className="font-bold text-gray-200">ImageAI</span>
                    </div>

                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link to="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
                        <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
                    </div>

                    <div className="text-sm text-gray-500">
                        © 2025 ImageAI. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
