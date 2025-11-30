import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-fast"></div>
      
      {/* Main Circle */}
      <div className="relative w-full h-full bg-black rounded-full border-2 border-neon-blue flex items-center justify-center overflow-hidden z-10 group-hover:scale-105 transition-transform duration-300">
        
        {/* Inner Glitch Effect */}
        <span className="font-display font-black text-white text-lg tracking-tighter relative z-20 group-hover:animate-glitch">
          Ti
        </span>
        
        {/* Background Scanline in Logo */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,243,255,0.2)_50%)] bg-[length:100%_4px]"></div>
      </div>
    </div>
  );
};