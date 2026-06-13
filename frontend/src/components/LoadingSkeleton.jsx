import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full glass-panel border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      {/* Table Header */}
      <div className="bg-slate-900/50 border-b border-white/5 px-6 py-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-800 rounded flex-1"></div>
        ))}
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-800 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileCardSkeleton = () => {
  return (
    <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-pulse flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-800"></div>
        <div className="flex flex-col gap-2">
          <div className="h-5 bg-slate-800 rounded w-36"></div>
          <div className="h-4 bg-slate-800 rounded w-24"></div>
        </div>
      </div>
      <div className="h-0.5 bg-white/5 w-full"></div>
      <div className="flex flex-col gap-3">
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
      </div>
    </div>
  );
};
