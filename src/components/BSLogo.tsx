import React from 'react';

interface BSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function BSLogo({ size = 'md', className = '' }: BSLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Outer rounded rectangular frame with 3D effect */}
      <div className="w-full h-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 relative overflow-hidden">
        {/* 3D depth effect - top highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 rounded-2xl"></div>
        
        {/* Inner glow effect */}
        <div className="absolute inset-1 bg-gradient-to-br from-red-400/30 to-red-800/30 rounded-xl"></div>
        
        {/* BS Monogram */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            viewBox="0 0 100 100" 
            className="w-3/4 h-3/4 text-white drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            {/* Letter B */}
            <path
              d="M15 20 L15 80 L45 80 Q55 80 60 70 Q65 60 60 50 Q65 40 60 30 Q55 20 45 20 Z M25 30 L40 30 Q45 30 47.5 35 Q50 40 47.5 45 Q45 50 40 50 L25 50 Z M25 60 L42 60 Q47 60 49.5 65 Q52 70 49.5 75 Q47 80 42 80 L25 80 Z"
              fill="currentColor"
              className="opacity-95"
            />
            
            {/* Letter S */}
            <path
              d="M70 25 Q60 20 50 25 Q45 30 50 35 L65 45 Q75 50 75 60 Q75 70 65 75 Q55 80 45 75 L45 85 Q60 90 75 85 Q85 80 85 65 Q85 50 75 45 L60 35 Q50 30 50 25 Q50 20 60 25 Q70 30 80 25 L80 15 Q70 10 55 15 Q40 20 40 35 Q40 50 55 55 L70 65 Q80 70 80 75 Q80 80 70 75 Q60 70 50 75"
              fill="currentColor"
              className="opacity-95"
            />
            
            {/* Connecting element - subtle curve */}
            <path
              d="M45 45 Q50 47 55 45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="opacity-60"
            />
          </svg>
        </div>
        
        {/* Glossy overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl"></div>
        
        {/* Bottom shadow for 3D depth */}
        <div className="absolute -bottom-1 -right-1 w-full h-full bg-red-900/40 rounded-2xl -z-10 blur-sm"></div>
      </div>
    </div>
  );
}