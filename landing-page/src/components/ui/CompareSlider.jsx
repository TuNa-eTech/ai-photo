import React, { useState, useRef, useEffect } from 'react';

const CompareSlider = ({ beforeImage, afterImage, beforeLabel = "Before", afterLabel = "After" }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (event) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        setSliderPosition(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        const handleWindowMove = (e) => {
            if (isDragging) handleMove(e);
        };

        const handleWindowUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleWindowMove);
        window.addEventListener('mouseup', handleWindowUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMove);
            window.removeEventListener('mouseup', handleWindowUp);
        };
    }, [isDragging]);

    // Touch support
    const handleTouchMove = (e) => {
        if (!containerRef.current) return;
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl select-none cursor-ew-resize group"
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
        >
            {/* After Image (Background) */}
            <img
                src={afterImage}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                {afterLabel}
            </div>

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt={beforeLabel}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                    {beforeLabel}
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default CompareSlider;
