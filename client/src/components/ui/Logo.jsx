import React from 'react';

export function Logo({ className = "", showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="RoomFlow" className="w-full h-full object-contain" />
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tight text-primary">
          Room<span className="text-accent">Flow</span>
        </span>
      )}
    </div>
  );
}
