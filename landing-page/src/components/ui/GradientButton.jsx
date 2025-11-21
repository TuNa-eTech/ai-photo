import React from 'react';

const GradientButton = ({ children, onClick, className = '', icon }) => {
    return (
        <button
            onClick={onClick}
            className={`
        relative group overflow-hidden rounded-full px-8 py-3 
        bg-accent-gradient text-white font-semibold tracking-wide
        transition-all duration-300 hover:shadow-glow hover:scale-105
        ${className}
      `}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
                {icon && <span className="transition-transform group-hover:translate-x-1">{icon}</span>}
            </span>

            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
    );
};

export default GradientButton;
