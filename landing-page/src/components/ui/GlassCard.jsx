import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false }) => {
    return (
        <div
            className={`
        glass rounded-2xl p-6 
        transition-all duration-300 ease-in-out
        ${hoverEffect ? 'hover:scale-[1.02] hover:shadow-glow hover:border-purple-500/30' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default GlassCard;
